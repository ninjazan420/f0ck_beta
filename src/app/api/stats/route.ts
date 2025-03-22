import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import Tag from '@/models/Tag';

export async function GET() {
  try {
    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeUsers = await User.countDocuments({ lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
    const newPosts = await Post.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
    const newComments = await Comment.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
    
    const newTags = await Tag.countDocuments({ newPostsToday: { $gt: 0 } });
    const totalTags = await Tag.countDocuments();

    return NextResponse.json({
      activeUsers,
      newPosts,
      newComments,
      newTags,
      totalTags
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
