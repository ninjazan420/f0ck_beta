import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Tag from '@/models/Tag';
import Post from '@/models/Post';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag parameter required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Check if tag exists
    const tagExists = await Tag.findOne({ name: tag });
    
    // Check if there are posts with this tag
    const postsWithTag = await Post.countDocuments({ tags: tag });
    
    return NextResponse.json({
      tagExists: !!tagExists,
      hasPostsWithTag: postsWithTag > 0,
      postsCount: postsWithTag
    });
  } catch (error) {
    console.error('Error validating tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 