import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const resolvedParams = await Promise.resolve(params);
    const postId = resolvedParams.id;
    
    let post;
    
    // Try to find by MongoDB ObjectId first
    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findById(postId).select('hasCommentsDisabled isPinned isAd');
    }
    
    // If not found, try as numeric ID
    if (!post) {
      post = await Post.findOne({ id: parseInt(postId, 10) }).select('hasCommentsDisabled isPinned isAd');
    }
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Add debugging log to see what we're returning
    console.log("Post status API returning:", {
      id: post._id,
      commentsDisabled: post.hasCommentsDisabled || false,
      isPinned: post.isPinned || false,
      isAd: post.isAd || false
    });
    
    return NextResponse.json({
      id: post._id,
      commentsDisabled: post.hasCommentsDisabled || false,
      isPinned: post.isPinned || false,
      isAd: post.isAd || false
    });
  } catch (error) {
    console.error('Error fetching post status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}