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
  { params }: { params: Promise<{ id: string }> }
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
    const { id: postId } = await params;
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
    const hasLiked = user.likes.includes(post._id);
    const hasDisliked = user.dislikes.includes(post._id);
    
    // Remove existing votes first
    if (hasLiked) {
      // Remove like from user
      user.likes = user.likes.filter((likeId: mongoose.Types.ObjectId) => !likeId.equals(post._id));
      
      // Remove user from post's likedBy
      post.likedBy = post.likedBy.filter((userId: mongoose.Types.ObjectId) => !userId.equals(session.user.id));
      
      // Update post stats
      post.stats.likes = Math.max(0, post.stats.likes - 1);
    }
    
    if (hasDisliked) {
      // Remove dislike from user
      user.dislikes = user.dislikes.filter((id: mongoose.Types.ObjectId) => !id.equals(post._id));
      
      // Remove user from post's dislikedBy
      post.dislikedBy = post.dislikedBy.filter((id: mongoose.Types.ObjectId) => !id.equals(session.user.id));
      
      // Update post stats
      post.stats.dislikes = Math.max(0, post.stats.dislikes - 1);
    }
    
    // Determine new vote state - toggle logic
    let currentVote = null;
    let actionToLog = null;
    let reasonToLog = '';

    if (vote === 'like' && !hasLiked) {
      // Add like only if user hasn't liked before
      user.likes.push(post._id);
      post.likedBy.push(session.user.id);
      post.stats.likes += 1;
      currentVote = 'like';
      actionToLog = 'like';
      reasonToLog = 'User liked post';

      // Send notification if the post isn't by the current user
      if (post.author && post.author.toString() !== session.user.id) {
        await NotificationService.notifyPostLike(post._id.toString(), session.user.id);
      }
    } else if (vote === 'dislike' && !hasDisliked) {
      // Add dislike only if user hasn't disliked before
      user.dislikes.push(post._id);
      post.dislikedBy.push(session.user.id);
      post.stats.dislikes += 1;
      currentVote = 'dislike';
      actionToLog = 'dislike';
      reasonToLog = 'User disliked post';
    } else if (vote === 'like' && hasLiked) {
      // Remove like (toggle behavior)
      actionToLog = 'remove_vote';
      reasonToLog = 'User removed like from post';
    } else if (vote === 'dislike' && hasDisliked) {
      // Remove dislike (toggle behavior)
      actionToLog = 'remove_vote';
      reasonToLog = 'User removed dislike from post';
    }
    // If no action needed (e.g., user clicks same vote again), actionToLog stays null
    
    // Use session to handle version conflicts and ensure atomicity
    const session_db = await mongoose.startSession();

    try {
      await session_db.withTransaction(async () => {
        // Save changes within transaction
        await user.save({ session: session_db });
        await post.save({ session: session_db });

        // Log the action only if something actually changed
        if (actionToLog) {
          await ModLog.create([{
            moderator: session.user.id,
            action: actionToLog,
            targetType: 'post',
            targetId: post._id,
            reason: reasonToLog,
            metadata: {
              postId: post._id,
              postTitle: post.title,
              previousLike: hasLiked,
              previousDislike: hasDisliked,
              newVote: currentVote
            }
          }], { session: session_db });
        }
      });
    } finally {
      await session_db.endSession();
    }
    
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