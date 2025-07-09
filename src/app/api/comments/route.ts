import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { rateLimit } from '@/lib/rateLimit';
import mongoose from 'mongoose';
import DOMPurify from 'isomorphic-dompurify';
import { NotificationService } from '@/lib/services/notificationService';
import { CommentStatsService } from '@/lib/services/commentStatsService';

// GET /api/comments
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const postId = searchParams.get('postId');
    const status = searchParams.get('status') || 'approved';
    const username = searchParams.get('username');
    const searchText = searchParams.get('searchText');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minLikes = parseInt(searchParams.get('minLikes') || '0');

    await dbConnect();

    const query: any = {};

    // Basis-Query für postId
    if (postId) {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        const numericId = Number(postId);
        if (isNaN(numericId)) {
          return NextResponse.json({
            comments: [],
            pagination: { total: 0, pages: 0, current: page, limit }
          });
        }

        const Post = mongoose.model('Post');
        const post = await Post.findOne({ id: numericId });
        if (!post) {
          return NextResponse.json({
            comments: [],
            pagination: { total: 0, pages: 0, current: page, limit }
          });
        }
        query.post = post._id;
      } else {
        query.post = postId;
      }
    }

    // Filter-Bedingungen hinzufügen
    if (username) {
      const users = await User.find({
        username: { $regex: username, $options: 'i' }
      });
      query.author = { $in: users.map(u => u._id) };
    }

    if (searchText) {
      query.content = { $regex: searchText, $options: 'i' };
    }

    if (dateFrom) {
      query.createdAt = { ...query.createdAt, $gte: new Date(dateFrom) };
    }

    if (dateTo) {
      query.createdAt = { ...query.createdAt, $lte: new Date(dateTo) };
    }

    if (minLikes > 0) {
      query['stats.likes'] = { $gte: minLikes };
    }

    if (status !== 'all') query.status = status;

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'username avatar role')
        .populate({
          path: 'post',
          select: '_id id title numericId imageUrl videoUrl type nsfw'
        })
        .populate({
          path: 'replyTo',
          populate: {
            path: 'author',
            select: 'username avatar'
          }
        }),
      Comment.countDocuments(query)
    ]);

    const processedComments = comments.map(comment => {
      const processedComment = comment.toObject();

      if (processedComment.post && processedComment.post._id) {
        if (!processedComment.post.numericId && processedComment.post.id) {
          processedComment.post.numericId = processedComment.post.id;
        }
      }

      if (processedComment.replyTo) {
        processedComment.replyTo.id = processedComment.replyTo._id.toString();
      }

      processedComment.id = processedComment._id.toString();

      return processedComment;
    });

    return NextResponse.json({
      comments: processedComments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/comments
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Hole request body
    const body = await req.json();
    const { content, postId, replyTo, isAnonymous } = body;
    console.log('Received comment data:', { content, postId, replyTo, isAnonymous });

    if (!content) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      );
    }

    // Überprüfe die Länge des Inhalts
    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Content exceeds maximum length of 500 characters' },
        { status: 400 }
      );
    }

    // Entweder postId oder replyTo muss vorhanden sein
    if (!postId && !replyTo) {
      return NextResponse.json(
        { error: 'Either postId or replyTo must be provided' },
        { status: 400 }
      );
    }

    await dbConnect();

    let postObjectId;

    // Wenn postId vorhanden ist, verarbeite es wie bisher
    if (postId) {
      // Post-Existenzprüfung
      const Post = mongoose.model('Post');
      let post;

      if (mongoose.isValidObjectId(postId)) {
        post = await Post.findById(postId);
      } else {
        // Versuche als numerische ID zu finden
        const numericId = Number(postId);
        if (!isNaN(numericId)) {
          post = await Post.findOne({ id: numericId });
        }
      }

      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      if (post.hasCommentsDisabled) {
        return NextResponse.json(
          { error: 'Comments are disabled for this post' },
          { status: 403 }
        );
      }

      postObjectId = post._id;
    }

    // Prüfen, ob der Benutzer eingeloggt ist
    // isAnonymous wird nur berücksichtigt, wenn der Benutzer nicht eingeloggt ist
    let author = null;
    let userRole = 'user';
    let actualIsAnonymous = true; // Standard: anonym

    // Benutzer abrufen für Rollenprüfung, nur wenn eingeloggt
    if (session?.user) {
      try {
        const user = await User.findById(session.user.id);
        console.log('User found:', user ? user.username : 'null');

        if (!user || user.role === 'banned') {
          return NextResponse.json(
            { error: 'User is not allowed to comment' },
            { status: 403 }
          );
        }

        userRole = user.role;
        author = session.user.id;
        actualIsAnonymous = isAnonymous === true; // Nur wenn explizit auf true gesetzt

        console.log(`User is logged in. Using anonymous mode: ${actualIsAnonymous}`);
      } catch (error) {
        console.error('Error finding user:', error);
        return NextResponse.json(
          { error: 'Error finding user' },
          { status: 500 }
        );
      }
    } else {
      console.log('No user session. Using anonymous comment.');
      actualIsAnonymous = true;
    }

    console.log('Creating comment with author:', author, 'isAnonymous:', actualIsAnonymous);

    // Kommentarinhalt sanitisieren und Zeilenumbrüche erhalten
    // Behalte \n als \n, konvertiere nicht zu <br> beim Speichern
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
      ALLOWED_ATTR: ['href', 'title', 'target']
    });

    // Kommentar erstellen
    const commentData = {
      content: sanitizedContent,
      author: isAnonymous === true ? null : (session?.user?.id || null),
      post: postObjectId,
      replyTo,
      // Alle Kommentare werden standardmäßig als "approved" markiert
      status: 'approved'
    };

    console.log('Comment data being saved:', JSON.stringify(commentData));

    const comment = new Comment(commentData);

    try {
      await comment.save();
      console.log('Comment saved successfully:', comment._id);

      // Add comment to user's comments array if not anonymous
      if (comment.author) {
        await User.findByIdAndUpdate(comment.author, {
          $addToSet: { comments: comment._id }
        });
      }

      // Aktualisiere die Statistiken
      if (comment.author) {
        await CommentStatsService.updateUserCommentStats(comment.author);
      }
      if (postObjectId) {
        await CommentStatsService.updatePostCommentStats(postObjectId);
      }

      // Benachrichtigungen senden
      try {
        if (replyTo) {
          // Für Antworten auf Kommentare
          await NotificationService.notifyCommentReply(comment._id.toString());
        } else {
          // Für neue Kommentare unter Posts
          await NotificationService.notifyNewComment(comment._id.toString());
        }

        // New function: Process user mentions and send notifications
        if (session?.user?.id) {
          const authorId = session.user.id;
          const postIdForMention = postObjectId.toString();
          const commentId = comment._id.toString();

          // Import MentionService at the top of the file
          const { MentionService } = await import('@/lib/services/mentionService');

          // Extract and process mentions
          await MentionService.extractAndProcessMentions(
            sanitizedContent,
            authorId,
            postIdForMention,
            commentId
          );
        }
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
        // Notification sending error should not affect comment success
      }
    } catch (saveError) {
      console.error('Error saving comment:', saveError);
      return NextResponse.json(
        { error: 'Failed to save comment' },
        { status: 500 }
      );
    }

    // Populate der Autor- und Reply-Informationen für die Antwort
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar role')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      })
      .populate({
        path: 'post',
        select: '_id id title numericId'
      });

    // Stelle sicher, dass wir die numerische ID des Posts für die Antwort bereitstellen
    const populatedCommentObj = populatedComment.toObject();
    if (populatedCommentObj.post) {
      // Wenn der Post ein Objekt ist und eine numericId oder id hat, setze diese als numericId
      if (typeof populatedCommentObj.post === 'object') {
        populatedCommentObj.post.numericId = postObjectId?.id || populatedCommentObj.post.numericId || populatedCommentObj.post.id;
      }
    }

    return NextResponse.json(populatedCommentObj);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/comments/:id
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const commentId = url.pathname.split('/').pop();

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { error: 'Invalid comment ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, action } = body;

    await dbConnect();

    // Kommentar finden
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Benutzer finden
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Nur für Moderationsaktionen
    if (action && ['approve', 'reject'].includes(action)) {
      // Prüfen, ob der Benutzer Moderator oder Admin ist
      if (!['moderator', 'admin'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Not authorized to moderate comments' },
          { status: 403 }
        );
      }

      comment.status = action === 'approve' ? 'approved' : 'rejected';
      await comment.save();

      return NextResponse.json({ success: true, status: comment.status });
    }

    // Für Bearbeitung von Inhalten
    if (content !== undefined) {
      // Prüfen, ob der Benutzer der Autor ist oder Moderator/Admin
      console.log('Author check in /api/comments:', {
        commentAuthor: comment.author,
        sessionUserId: session.user.id,
        userRole: user.role
      });

      const isAuthor = comment.author &&
        (typeof comment.author === 'object' && comment.author._id
          ? comment.author._id.toString() === session.user.id
          : comment.author.toString() === session.user.id);
      const isModerator = ['moderator', 'admin'].includes(user.role);

      console.log('Authorization result in /api/comments:', { isAuthor, isModerator });

      if (!isAuthor && !isModerator) {
        return NextResponse.json(
          { error: 'Not authorized to edit this comment' },
          { status: 403 }
        );
      }

      // Rate limiting für normale Benutzer (nicht für Moderatoren)
      if (!isModerator) {
        const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        const rateLimitResult = await rateLimit(`edit_comment_${ip}`, 5, 60); // 5 Bearbeitungen pro Minute
        if (rateLimitResult) {
          return NextResponse.json(
            { error: 'Too many edit attempts. Please try again later.' },
            { status: 429 }
          );
        }
      }

      // Überprüfe die Länge des Inhalts
      if (content.length > 500) {
        return NextResponse.json(
          { error: 'Content exceeds maximum length of 500 characters' },
          { status: 400 }
        );
      }

      // Ersetze \n durch <br> für korrekte Zeilenumbrüche
      const contentWithLineBreaks = content.replace(/\n/g, '<br>');
      const sanitizedContent = DOMPurify.sanitize(contentWithLineBreaks, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'title', 'target']
      });

      // Kommentar aktualisieren
      comment.content = sanitizedContent;
      await comment.save();

      // Kommentar mit Autor zurückgeben
      const populatedComment = await Comment.findById(comment._id)
        .populate('author', 'username avatar role')
        .populate('replyTo');

      // Formatieren der Antwort für die UI
      const formattedComment = {
        ...populatedComment.toObject(),
        author: !populatedComment.author ? {
          id: null,
          username: 'Anonymous',
          avatar: null
        } : {
          id: populatedComment.author._id,
          username: populatedComment.author.username || 'User',
          avatar: populatedComment.author.avatar
        },
        id: populatedComment._id
      };

      return NextResponse.json(formattedComment);
    }

    return NextResponse.json(
      { error: 'No valid action or content provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/:id
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const commentId = url.pathname.split('/').pop();

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { error: 'Invalid comment ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Kommentar finden
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Prüfen, ob der Benutzer der Autor ist oder Moderator/Admin
    const user = await User.findById(session.user.id);
    const isAuthor = comment.author && comment.author.toString() === session.user.id;
    const isModerator = user && ['moderator', 'admin'].includes(user.role);

    if (!isAuthor && !isModerator) {
      return NextResponse.json(
        { error: 'Not authorized to delete this comment' },
        { status: 403 }
      );
    }

    // Speichere die Post-ID und Autor-ID, bevor der Kommentar gelöscht wird
    const postId = comment.post;
    const authorId = comment.author;

    // Alle Benutzer können Kommentare dauerhaft löschen
    await Comment.findByIdAndDelete(commentId);

    // Aktualisiere die Statistiken
    await CommentStatsService.updateStatsAfterCommentDeletion(commentId, postId, authorId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
