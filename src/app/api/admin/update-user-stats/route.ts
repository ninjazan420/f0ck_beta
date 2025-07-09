import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import Tag from '@/models/Tag';

/**
 * API route to update all user statistics
 * This route can only be called by administrators
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    // Only administrators can call this route
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    
    console.log('Starting user stats update...');
    
    // Get all users
    const users = await User.find().select('_id username');
    console.log(`Updating stats for ${users.length} users`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      try {
        // Get user's posts (uploads)
        const userPosts = await Post.find({ author: user._id }).select('_id');
        const uploadIds = userPosts.map(post => post._id);
        
        // Get user's approved comments
        const userComments = await Comment.find({ 
          author: user._id, 
          status: 'approved' 
        }).select('_id');
        const commentIds = userComments.map(comment => comment._id);
        
        // Get user's tags (tags they created)
        const userTags = await Tag.find({ creator: user._id }).select('_id');
        const tagIds = userTags.map(tag => tag._id);
        
        // Update user with correct arrays
        await User.findByIdAndUpdate(user._id, {
          uploads: uploadIds,
          comments: commentIds,
          tags: tagIds
          // Note: likes, dislikes, favorites are already updated by interaction handlers
        });
        
        updatedCount++;
        
        if (updatedCount % 10 === 0) {
          console.log(`Updated ${updatedCount}/${users.length} users...`);
        }
      } catch (userError) {
        console.error(`Error updating user ${user.username}:`, userError);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} of ${users.length} users.`);
    
    return NextResponse.json({
      success: true,
      message: `Updated stats for ${updatedCount} users`,
      updatedCount,
      totalUsers: users.length
    });
    
  } catch (error) {
    console.error('Error updating user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
