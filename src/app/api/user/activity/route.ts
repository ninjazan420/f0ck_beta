import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Comment from '@/models/Comment';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Kommentare des Benutzers abrufen
    const comments = await Comment.find({ 
      author: session.user.id,
      status: 'approved',
      isHidden: false 
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('post', 'title imageUrl type nsfw');

    // Aktivitäten formatieren
    const activities = comments.map(comment => ({
      id: comment._id,
      type: 'comment',
      text: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
      date: comment.createdAt,
      emoji: '💬',
      post: {
        id: comment.post._id,
        title: comment.post.title,
        imageUrl: comment.post.imageUrl,
        type: comment.post.type,
        nsfw: comment.post.nsfw
      }
    }));

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 