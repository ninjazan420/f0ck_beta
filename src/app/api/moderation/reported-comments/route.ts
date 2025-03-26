import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Comment from '@/models/Comment';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    
    // Kommentare mit mindestens einem Report finden
    const reportedComments = await Comment.find({
      'reports.0': { $exists: true },  // Mindestens ein Report vorhanden
      isHidden: { $ne: true }          // Nicht versteckte Kommentare
    })
    .sort({ 'reports.0.createdAt': -1 }) // Neueste Reports zuerst
    .populate('author', 'username name avatar')
    .populate('post', 'title id numericId')
    .populate('reports.user', 'username name');
    
    return NextResponse.json({
      comments: reportedComments.map(comment => ({
        ...comment.toObject(),
        id: comment._id
      }))
    });
  } catch (error) {
    console.error('Error fetching reported comments:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 