import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import { NotificationService } from '@/lib/services/notificationService';
import mongoose from 'mongoose';
import ModLog from '@/models/ModLog';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const postIdOrNumericId = resolvedParams.id;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const post = await Post.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(postIdOrNumericId) ? postIdOrNumericId : null },
        { id: parseInt(postIdOrNumericId) || -1 }
      ]
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postId = post._id.toString();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const alreadyLiked = user.likes ? user.likes.some(id => id.toString() === postId) : false;

    if (alreadyLiked) {
      return NextResponse.json({ 
        liked: true,
        message: 'Post already liked by user',
        likeCount: post.stats.likes || 0
      });
    }

    if (!user.likes) {
      user.likes = [];
    }
    user.likes.push(new mongoose.Types.ObjectId(postId));
    await user.save();

    if (!post.stats) post.stats = { likes: 0, comments: 0, favorites: 0, views: 0, dislikes: 0 };
    post.stats.likes = (post.stats.likes || 0) + 1;
    await post.save();

    await ModLog.create({
      moderator: session.user.id,
      action: 'like',
      targetType: 'post',
      targetId: post._id,
      reason: 'User liked post',
      metadata: {
        autoTriggered: true
      }
    });

    try {
      await NotificationService.notifyPostLike(postId, session.user.id);
    } catch (notifyError) {
      console.error('Error sending like notification:', notifyError);
    }

    return NextResponse.json({ 
      success: true,
      liked: true,
      likeCount: post.stats.likes
    });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 