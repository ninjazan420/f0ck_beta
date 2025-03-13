import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Tag from '@/models/Tag';
import Post from '@/models/Post';
import ModLog from '@/models/ModLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and permissions
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (!['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { tagId, tagName, reason } = body;
    
    if (!tagId && !tagName) {
      return NextResponse.json(
        { error: 'Tag ID or tag name required' },
        { status: 400 }
      );
    }
    
    // Find tag - use a function that can search by name or ID
    let tag;
    
    // If it looks like a valid MongoDB ObjectId, try to find by ID
    if (tagId && mongoose.isValidObjectId(tagId)) {
      tag = await Tag.findById(tagId);
    } 
    // If we have a tagName or the ID isn't valid ObjectId (might be name), try find by name
    else {
      const searchName = tagName || tagId; // Use either explicit tagName or fallback to tagId as name
      tag = await Tag.findOne({ name: searchName });
    }
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    // Remove tag from all posts
    await Post.updateMany(
      { tags: tag.name },
      { $pull: { tags: tag.name } }
    );
    
    // Create mod log entry
    await ModLog.create({
      moderator: session.user.id,
      action: 'delete',
      targetType: 'tag',
      targetId: tag._id,
      reason: reason || 'No reason provided',
      metadata: {
        previousState: {
          name: tag.name,
          postsCount: tag.postsCount,
          newPostsToday: tag.newPostsToday,
          newPostsThisWeek: tag.newPostsThisWeek,
        }
      }
    });
    
    // Delete tag
    await Tag.findByIdAndDelete(tag._id);
    
    return NextResponse.json({
      success: true,
      message: 'Tag successfully deleted'
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 