import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import Comment from '@/models/Comment';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    await dbConnect();

    // Warte auf die Auflösung der params
    const resolvedParams = await Promise.resolve(params);
    const username = resolvedParams.username;

    console.log('Searching for user:', username); // Debug-Log

    const user = await User.findOne({ username: username });
    if (!user) {
      console.log('User not found for username:', username); // Debug-Log
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user:', user._id); // Debug-Log

    // Hole die letzten 10 genehmigten Kommentare des Benutzers
    const comments = await Comment.find({ 
      author: user._id,
      status: 'approved'
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('post', 'title imageUrl type nsfw');

    console.log('Found comments:', comments.length); // Debug-Log

    // Formatiere die Aktivitäten
    const activities = comments.map(comment => ({
      id: comment._id,
      type: 'comment',
      text: comment.content,
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
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    );
  }
} 