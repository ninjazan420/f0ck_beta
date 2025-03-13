import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Tag from '@/models/Tag';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    
    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find tag in database
    const tag = await Tag.findOne({
      $or: [
        { name },
        { id: name }
      ]
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      tag: {
        id: tag._id.toString(),
        name: tag.name,
        postsCount: tag.postsCount,
        newPostsToday: tag.newPostsToday,
        newPostsThisWeek: tag.newPostsThisWeek,
        createdAt: tag.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching tag details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 