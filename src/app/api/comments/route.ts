import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db/mongodb';
import Comment from '@/models/Comment';
import Post from '@/models/Post';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, content, replyTo } = await req.json();
    
    // Erweiterte Validierung
    if (!postId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Post ID and non-empty content are required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Parallel Verification
    const [post, parentComment] = await Promise.all([
      Post.findById(postId),
      replyTo ? Comment.findById(replyTo) : null
    ]);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (replyTo && !parentComment) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
    }

    // Sanitize content here if needed

    const comment = await Comment.create({
      content: content.trim(),
      author: session.user.id,
      post: postId,
      replyTo
    });

    await comment.populate('author', 'username');

    // Aktualisiere Post-Statistiken
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
      $set: { lastActivity: new Date() }
    });

    return NextResponse.json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error: unknown) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const comments = await Comment.find({ post: postId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    return NextResponse.json(comments);
  } catch (error: unknown) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
