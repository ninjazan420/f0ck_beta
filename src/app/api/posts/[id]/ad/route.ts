import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import ModLog from '@/models/ModLog';
import mongoose from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or moderator
    if (session.user.role !== 'admin' && session.user.role !== 'moderator') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { action } = await request.json();

    if (!action || !['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await dbConnect();

    // Await params first
    const resolvedParams = await params;
    const postId = resolvedParams.id;

    // Try to find post by numeric ID first, then by ObjectId
    let post;
    const numericId = parseInt(postId, 10);

    if (!isNaN(numericId)) {
      post = await Post.findOne({ id: numericId });
    }

    if (!post && mongoose.isValidObjectId(postId)) {
      post = await Post.findById(postId);
    }
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const isAd = action === 'add';

    // Update post ad status using the correct ID
    if (!isNaN(numericId)) {
      await Post.findOneAndUpdate({ id: numericId }, { isAd: isAd });
    } else {
      await Post.findByIdAndUpdate(postId, { isAd: isAd });
    }

    // Log the moderation action
    await ModLog.create({
      moderator: session.user.id,
      action: isAd ? 'feature' : 'unfeature', // Using existing action types
      targetType: 'post',
      targetId: post._id.toString(),
      reason: `Post ${isAd ? 'marked as ad' : 'ad status removed'} by ${session.user.name}`,
      metadata: {
        previousState: { isAd: !isAd },
        newState: { isAd: isAd }
      }
    });

    return NextResponse.json({ 
      success: true, 
      isAd: isAd,
      message: isAd ? 'Post marked as ad' : 'Post ad status removed'
    });
    
  } catch (error) {
    console.error('Error updating post ad status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}