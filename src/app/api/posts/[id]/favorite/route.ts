import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import ModLog from '@/models/ModLog';
import { NotificationService } from '@/lib/services/notificationService';
import mongoose from 'mongoose';

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

    // Finde den Post entweder anhand der MongoDB _id oder der numerischen id
    const post = await Post.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(postIdOrNumericId) ? postIdOrNumericId : null },
        { id: parseInt(postIdOrNumericId) || -1 }
      ]
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Verwende immer die MongoDB _id für den Vergleich
    const postId = post._id.toString();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already favorited this post
    const alreadyFavorited = user.favorites && user.favorites.some(
      (fav) => fav.toString() === postId
    );

    if (alreadyFavorited) {
      return NextResponse.json({ 
        favorited: true,
        message: 'Post already in favorites' 
      });
    }

    // Add post to user's favorites
    if (!user.favorites) {
      user.favorites = [];
    }
    user.favorites.push(postId);
    await user.save();

    // Increment favorites count on post
    post.stats.favorites = (post.stats.favorites || 0) + 1;
    await post.save();

    // Create ModLog entry
    await ModLog.create({
      moderator: session.user.id,
      action: 'favorite',
      targetType: 'post',
      targetId: post._id,
      reason: 'User favorited post',
      metadata: {
        autoTriggered: true
      }
    });

    // Send notification to post author (implement this function)
    try {
      await NotificationService.notifyPostFavorite(postId, session.user.id);
    } catch (notifyError) {
      console.error('Error sending favorite notification:', notifyError);
    }

    return NextResponse.json({ 
      success: true,
      favorited: true,
      favoritesCount: post.stats.favorites
    });
  } catch (error) {
    console.error('Error favoriting post:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Remove from favorites
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.id;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has favorited this post
    const favoriteIndex = user.favorites ? user.favorites.findIndex(
      (fav) => fav.toString() === postId
    ) : -1;

    if (favoriteIndex === -1) {
      return NextResponse.json({ 
        favorited: false,
        message: 'Post not in favorites' 
      });
    }

    // Remove post from user's favorites
    user.favorites.splice(favoriteIndex, 1);
    await user.save();

    // Decrement favorites count on post
    post.stats.favorites = Math.max(0, (post.stats.favorites || 0) - 1);
    await post.save();

    // Create ModLog entry
    await ModLog.create({
      moderator: session.user.id,
      action: 'unfavorite',
      targetType: 'post',
      targetId: post._id,
      reason: 'User removed post from favorites',
      metadata: {
        autoTriggered: true
      }
    });

    return NextResponse.json({ 
      success: true,
      favorited: false,
      favoritesCount: post.stats.favorites
    });
  } catch (error) {
    console.error('Error removing post from favorites:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 