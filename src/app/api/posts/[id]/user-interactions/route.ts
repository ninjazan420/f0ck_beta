import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const postIdOrNumericId = resolvedParams.id;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({
        liked: false,
        favorited: false,
        disliked: false
      });
    }

    await dbConnect();

    // First, get the actual MongoDB _id of the post
    const post = await Post.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(postIdOrNumericId) ? postIdOrNumericId : null },
        { id: parseInt(postIdOrNumericId) || -1 }
      ]
    });

    if (!post) {
      return NextResponse.json({
        liked: false,
        favorited: false,
        disliked: false,
        error: 'Post not found'
      });
    }

    const postId = post._id.toString();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({
        liked: false,
        favorited: false,
        disliked: false
      });
    }

    // Check if user has liked, disliked or favorited this post using the MongoDB _id
    const liked = user.likes ? user.likes.some(id => id.toString() === postId) : false;
    const favorited = user.favorites ? user.favorites.some(id => id.toString() === postId) : false;
    const disliked = user.dislikes ? user.dislikes.some(id => id.toString() === postId) : false;

    return NextResponse.json({
      liked,
      favorited,
      disliked,
      postId: postId // Send back the actual MongoDB _id for future reference
    });
  } catch (error) {
    console.error('Error getting user interactions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 