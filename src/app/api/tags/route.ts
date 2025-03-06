import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Tag from '@/models/Tag';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sortBy = searchParams.get('sortBy') || 'postsCount';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Sort options
    const sortOptions: any = {};
    
    switch (sortBy) {
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'alphabetical':
        sortOptions.name = 1;
        break;
      case 'trending':
        sortOptions.newPostsToday = -1;
        break;
      case 'most_used':
      default:
        sortOptions.postsCount = -1;
    }
    
    // Execute query
    const tags = await Tag.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    const totalTags = await Tag.countDocuments(query);
    const totalPages = Math.ceil(totalTags / limit);
    
    return NextResponse.json({
      tags,
      pagination: {
        total: totalTags,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    // Normalize tag name
    const name = body.name.toLowerCase().trim().replace(/\s+/g, '_');
    
    // Check if tag already exists
    const existingTag = await Tag.findOne({ name });
    
    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag already exists', tag: existingTag },
        { status: 409 }
      );
    }
    
    // Create new tag
    const tag = new Tag({
      name,
      aliases: body.aliases || []
    });
    
    await tag.save();
    
    return NextResponse.json({
      message: 'Tag created successfully',
      tag
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
} 