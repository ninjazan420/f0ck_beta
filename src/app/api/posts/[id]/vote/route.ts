import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import ModLog from '@/models/ModLog';
import { NotificationService } from '@/lib/services/notificationService';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { vote } = body; // vote can be 'like', 'dislike', or null (to remove vote)
    
    // Find post by id
    const postId = params.id;
    let post;
    
    if (mongoose.isValidObjectId(postId)) {
      post = await Post.findById(postId);
    }
    
    if (!post) {
      const numericId = parseInt(postId, 10);
      if (!isNaN(numericId)) {
        post = await Post.findOne({ id: numericId });
      }
    }
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Find user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Initialize arrays and stats if they don't exist
    if (!user.likes) user.likes = [];
    if (!user.dislikes) user.dislikes = [];
    if (!post.likedBy) post.likedBy = [];
    if (!post.dislikedBy) post.dislikedBy = [];
    if (!post.stats) {
      post.stats = { likes: 0, dislikes: 0, views: 0, comments: 0, favorites: 0 };
    }
    
    // Check current state
    const hasLiked = user.likes.some(id => id.toString() === post._id.toString());
    const hasDisliked = user.dislikes.some(id => id.toString() === post._id.toString());
    
    // Remove existing votes first
    if (hasLiked) {
      // Remove like from user
      user.likes = user.likes.filter(id => id.toString() !== post._id.toString());
      
      // Remove user from post's likedBy
      post.likedBy = post.likedBy.filter(id => id.toString() !== session.user.id);
      
      // Update post stats
      post.stats.likes = Math.max(0, post.stats.likes - 1);
    }
    
    if (hasDisliked) {
      // Remove dislike from user
      user.dislikes = user.dislikes.filter(id => id.toString() !== post._id.toString());
      
      // Remove user from post's dislikedBy
      post.dislikedBy = post.dislikedBy.filter(id => id.toString() !== session.user.id);
      
      // Update post stats
      post.stats.dislikes = Math.max(0, post.stats.dislikes - 1);
    }
    
    // Add new vote if requested
    let currentVote = null;
    
    if (vote === 'like') {
      // Add like
      user.likes.push(post._id);
      post.likedBy.push(session.user.id);
      post.stats.likes += 1;
      currentVote = 'like';
      
      // Send notification if the post isn't by the current user
      if (post.author && post.author.toString() !== session.user.id) {
        await NotificationService.notifyPostLike(post._id.toString(), session.user.id);
      }
    } else if (vote === 'dislike') {
      // Add dislike
      user.dislikes.push(post._id);
      post.dislikedBy.push(session.user.id);
      post.stats.dislikes += 1;
      currentVote = 'dislike';
    }
    
    // Log the action
    await ModLog.create({
      moderator: session.user.id,
      action: vote || 'remove_vote',
      targetType: 'post',
      targetId: post._id,
      reason: vote ? `User ${vote}d post` : 'User removed vote from post',
      metadata: {
        postId: post._id,
        postTitle: post.title,
        previousLike: hasLiked,
        previousDislike: hasDisliked,
        newVote: vote
      }
    });
    
    // Save changes
    await user.save();
    await post.save();
    
    return NextResponse.json({
      userVote: currentVote,
      stats: {
        likes: post.stats.likes,
        dislikes: post.stats.dislikes
      }
    });
    
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Error processing vote' },
      { status: 500 }
    );
  }
} 