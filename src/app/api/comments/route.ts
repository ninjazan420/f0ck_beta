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
      query.post = postId;
    }
    
    if (status !== 'all') query.status = status;
    query.isHidden = false;

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'username avatar')
        .populate('replyTo'),
      Comment.countDocuments(query)
    ]);

    return NextResponse.json({
      comments,
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const body = await req.json();
    const { content, postId, replyTo } = body;

    if (!content || !postId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Benutzer abrufen für Rollenprüfung
    const user = await User.findById(session.user.id);
    if (!user || user.role === 'banned') {
      return NextResponse.json(
        { error: 'User is not allowed to comment' },
        { status: 403 }
      );
    }

    // Kommentar erstellen
    const comment = new Comment({
      content,
      author: session.user.id,
      post: postId,
      replyTo,
      // Wenn der Benutzer Moderator oder Admin ist, automatisch genehmigen
      status: ['moderator', 'admin'].includes(user.role) ? 'approved' : 'pending'
    });

    await comment.save();

    // Kommentar mit Autor zurückgeben
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar')
      .populate('replyTo');

    return NextResponse.json(populatedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/comments
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { commentId, action, reason } = body;

    if (!commentId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Benutzer abrufen für Rollenprüfung
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'report':
        // Prüfen ob der Benutzer den Kommentar bereits gemeldet hat
        if (comment.reports?.some((report: { user: { toString: () => string } }) => 
          report.user.toString() === user._id.toString()
        )) {
          return NextResponse.json(
            { error: 'Already reported' },
            { status: 400 }
          );
        }

        comment.reports = [
          ...(comment.reports || []),
          { user: user._id, reason, createdAt: new Date() }
        ];
        break;

      case 'delete':
        // Nur der Autor, Moderatoren oder Admins können löschen
        if (
          comment.author.toString() !== user._id.toString() &&
          !['moderator', 'admin'].includes(user.role)
        ) {
          return NextResponse.json(
            { error: 'Not authorized to delete this comment' },
            { status: 403 }
          );
        }
        comment.isHidden = true;
        break;

      case 'approve':
      case 'reject':
        // Nur Moderatoren oder Admins können Kommentare moderieren
        if (!['moderator', 'admin'].includes(user.role)) {
          return NextResponse.json(
            { error: 'Not authorized to moderate comments' },
            { status: 403 }
          );
        }
        comment.status = action === 'approve' ? 'approved' : 'rejected';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    await comment.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
