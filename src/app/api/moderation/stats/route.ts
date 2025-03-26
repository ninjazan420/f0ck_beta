import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    // Parallele Abfragen für bessere Performance
    const [pendingComments, reportedPosts, activeUsers, reportedComments] = await Promise.all([
      Comment.countDocuments({ status: 'pending' }),
      Post.countDocuments({ reported: true }),
      User.countDocuments({ 
        lastSeen: { 
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Letzte 24 Stunden
        }
      }),
      Comment.countDocuments({ 'reports.0': { $exists: true }, isHidden: { $ne: true } })
    ]);

    return NextResponse.json({
      pendingComments,
      reportedPosts,
      activeUsers,
      reportedComments
    });
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 