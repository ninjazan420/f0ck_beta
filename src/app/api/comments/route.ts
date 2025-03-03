import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { rateLimit } from '@/lib/rateLimit';
import mongoose from 'mongoose';

// GET /api/comments
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'approved';

    await dbConnect();

    const query: any = {};
    
    // Prüfen ob postId eine gültige ObjectId ist
    if (postId) {
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        // Versuchen, die numerische ID zu konvertieren
        const numericId = Number(postId);
        if (isNaN(numericId)) {
          return NextResponse.json({ 
            comments: [],
            pagination: {
              total: 0,
              pages: 0,
              current: page,
              limit
            }
          });
        }
        
        // Post mit der numerischen ID suchen
        try {
          const Post = mongoose.model('Post');
          const post = await Post.findOne({ id: numericId });
          if (!post) {
            console.log(`Post with numeric ID ${numericId} not found`);
            return NextResponse.json({
              comments: [],
              pagination: {
                total: 0,
                pages: 0,
                current: page,
                limit
              }
            });
          }
          console.log(`GET: Found post with numeric ID ${numericId}, MongoDB ID: ${post._id}`);
          query.post = post._id;
        } catch (error) {
          console.error('Error finding post by numeric ID:', error);
          return NextResponse.json({
            comments: [],
            pagination: {
              total: 0,
              pages: 0,
              current: page,
              limit
            }
          });
        }
      } else {
        query.post = postId;
      }
    }
    
    if (status !== 'all') query.status = status;
    query.isHidden = false;

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'username avatar')
        .populate({
          path: 'post',
          select: '_id id title numericId'
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

    // Make sure we provide numericId for posts if available
    const processedComments = comments.map(comment => {
      const processedComment = comment.toObject();
      
      // If the post has a numericId, make sure it's included
      if (processedComment.post && processedComment.post._id) {
        // If post has an id field but not a numericId field, use that as numericId
        if (!processedComment.post.numericId && processedComment.post.id) {
          processedComment.post.numericId = processedComment.post.id;
        }
      }
      
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
    console.log('Session:', session);
    
    // Hole request body
    const body = await req.json();
    const { content, postId, replyTo, isAnonymous } = body;
    console.log('Received comment data:', { content, postId, isAnonymous });

    if (!content || !postId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await rateLimit(`comment_${ip}`, 5, 60); // 5 Kommentare pro Minute
    if (rateLimitResult) {
      return NextResponse.json(
        { error: 'Too many comments. Please try again later.' },
        { status: 429 }
      );
    }

    await dbConnect();
    
    // Zuerst den Post anhand der numerischen ID finden
    let post;
    if (!mongoose.isValidObjectId(postId)) {
      // Versuchen, die numerische ID zu konvertieren
      const numericId = Number(postId);
      if (isNaN(numericId)) {
        return NextResponse.json(
          { error: 'Invalid post ID format' },
          { status: 400 }
        );
      }
      
      // Post mit der numerischen ID suchen
      try {
        const Post = mongoose.model('Post');
        post = await Post.findOne({ id: numericId });
        if (!post) {
          console.log(`Post with numeric ID ${numericId} not found`);
          return NextResponse.json(
            { error: 'Post not found' },
            { status: 404 }
          );
        }
        console.log(`Found post with numeric ID ${numericId}, MongoDB ID: ${post._id}`);
      } catch (error) {
        console.error('Error finding post by numeric ID:', error);
        return NextResponse.json(
          { error: 'Error finding post' },
          { status: 500 }
        );
      }
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

    // Kommentar erstellen - verwende post._id statt postId, wenn post gefunden wurde
    const commentData = {
      content,
      author: actualIsAnonymous ? null : author, // Null für anonyme Kommentare
      post: post ? post._id : postId, // Verwende die MongoDB ID des Posts, wenn gefunden
      replyTo,
      // Alle Kommentare werden standardmäßig als "approved" markiert
      status: 'approved'
    };
    
    console.log('Comment data being saved:', JSON.stringify(commentData));
    
    const comment = new Comment(commentData);

    try {
      await comment.save();
      console.log('Comment saved successfully:', comment._id);
    } catch (saveError) {
      console.error('Error saving comment:', saveError);
      return NextResponse.json(
        { error: 'Failed to save comment', details: saveError instanceof Error ? saveError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Kommentar mit Autor zurückgeben
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar')
      .populate('replyTo');
    console.log('Populated comment after save:', JSON.stringify(populatedComment));

    // Sicherstellen, dass die Antwort das korrekte Format für die UI hat
    const formattedComment = {
      _id: populatedComment._id,
      id: populatedComment._id.toString(), // Explizites ID-Feld als String
      content: populatedComment.content,
      author: actualIsAnonymous ? {
        _id: null,
        id: null,
        username: 'Anonymous',
        avatar: null
      } : populatedComment.author ? {
        _id: populatedComment.author._id,
        id: populatedComment.author._id.toString(), // Explizites ID-Feld als String
        username: populatedComment.author.username || 'User',
        avatar: populatedComment.author.avatar
      } : {
        _id: null,
        id: null,
        username: 'Anonymous',
        avatar: null
      },
      post: {
        id: postId,
        title: ''
      },
      status: populatedComment.status || 'approved',
      createdAt: populatedComment.createdAt
    };

    console.log('Formatted comment for UI:', formattedComment);
    return NextResponse.json(formattedComment);
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
      const isAuthor = comment.author && comment.author.toString() === session.user.id;
      const isModerator = ['moderator', 'admin'].includes(user.role);

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

      // Kommentar aktualisieren
      comment.content = content;
      await comment.save();

      // Kommentar mit Autor zurückgeben
      const populatedComment = await Comment.findById(comment._id)
        .populate('author', 'username avatar')
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

    // Kommentar löschen oder als versteckt markieren
    if (isModerator) {
      // Moderatoren können Kommentare dauerhaft löschen
      await Comment.findByIdAndDelete(commentId);
    } else {
      // Normale Benutzer markieren ihre Kommentare als versteckt
      comment.isHidden = true;
      await comment.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
