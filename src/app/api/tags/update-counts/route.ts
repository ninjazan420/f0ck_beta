import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Tag from '@/models/Tag';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only admin/mods can run this
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.role || !['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Get all tags
    const tags = await Tag.find();
    
    // Update counts for each tag
    const updatePromises = tags.map(async (tag) => {
      // Count posts with this tag
      const postsCount = await Post.countDocuments({ tags: tag.name });
      
      // Count posts from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newPostsToday = await Post.countDocuments({
        tags: tag.name,
        createdAt: { $gte: today }
      });
      
      // Count posts from this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      const newPostsThisWeek = await Post.countDocuments({
        tags: tag.name,
        createdAt: { $gte: weekStart }
      });
      
      // Update tag with new counts
      return Tag.updateOne(
        { _id: tag._id },
        { 
          postsCount,
          newPostsToday,
          newPostsThisWeek
        }
      );
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    return NextResponse.json({
      message: 'Tag counts updated successfully',
      tagsProcessed: tags.length
    });
  } catch (error) {
    console.error('Error updating tag counts:', error);
    return NextResponse.json(
      { error: 'Failed to update tag counts' },
      { status: 500 }
    );
  }
} 