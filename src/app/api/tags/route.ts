import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Tag from '@/models/Tag';
import Post from '@/models/Post';
import User from '@/models/User';
import { withAuth, createErrorResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'most_used';
    const author = searchParams.get('author') || '';
    const usedBy = searchParams.get('usedBy') || '';
    const timeRange = searchParams.get('timeRange') || 'all';
    const minPosts = parseInt(searchParams.get('minPosts') || '0');
    const creator = searchParams.get('creator') || '';
    
    await dbConnect();
    
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (minPosts > 0) {
      query.postsCount = { $gte: minPosts };
    }
    
    if (author) {
      const authorUser = await User.findOne({ username: { $regex: author, $options: 'i' } });
      if (authorUser) {
        const authorPosts = await Post.find({ author: authorUser._id });
        const authorTagNames = authorPosts.flatMap(post => post.tags);
        query.name = { ...(query.name || {}), $in: [...new Set(authorTagNames)] };
      } else {
        return NextResponse.json({
          tags: [],
          pagination: { total: 0, page, limit, totalPages: 0 }
        });
      }
    }
    
    if (usedBy) {
      const user = await User.findOne({ username: { $regex: usedBy, $options: 'i' } });
      if (user) {
        const userPosts = await Post.find({ 
          _id: { $in: [...(user.favorites || []), ...(user.likes || [])] } 
        });
        const userTagNames = userPosts.flatMap(post => post.tags);
        query.name = { ...(query.name || {}), $in: [...new Set(userTagNames)] };
      } else {
        return NextResponse.json({
          tags: [],
          pagination: { total: 0, page, limit, totalPages: 0 }
        });
      }
    }
    
    if (creator) {
      const creatorUser = await User.findOne({ username: creator }).select('_id');
      if (creatorUser) {
        query.creator = creatorUser._id;
      } else {
        return NextResponse.json({
          tags: [],
          totalTags: 0,
          currentPage: page,
          totalPages: 0
        });
      }
    }
    
    if (timeRange !== 'all') {
      let dateFilter = new Date();
      switch (timeRange) {
        case 'day':
          dateFilter.setDate(dateFilter.getDate() - 1);
          query.newPostsToday = { $gt: 0 };
          break;
        case 'week':
          dateFilter.setDate(dateFilter.getDate() - 7);
          query.newPostsThisWeek = { $gt: 0 };
          break;
        case 'month':
          dateFilter.setMonth(dateFilter.getMonth() - 1);
          const monthTagNames = await getTagsWithPostsInTimeRange(dateFilter);
          query.name = { ...(query.name || {}), $in: monthTagNames };
          break;
        case 'year':
          dateFilter.setFullYear(dateFilter.getFullYear() - 1);
          const yearTagNames = await getTagsWithPostsInTimeRange(dateFilter);
          query.name = { ...(query.name || {}), $in: yearTagNames };
          break;
      }
    }
    
    let sortOptions: any = {};
    switch (sortBy) {
      case 'most_used':
        sortOptions = { postsCount: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'alphabetical':
        sortOptions = { name: 1 };
        break;
      case 'trending':
        sortOptions = { newPostsThisWeek: -1, postsCount: -1 };
        break;
      default:
        sortOptions = { postsCount: -1 };
    }
    
    const skip = (page - 1) * limit;

    const [tags, totalCount] = await Promise.all([
      Tag.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate({ 
          path: 'creator', 
          select: 'username', 
          strictPopulate: false
        })
        .lean(),
      Tag.countDocuments(query)
    ]);
    
    return NextResponse.json({
      tags: tags,
      pagination: {
        total: totalCount,
        page: page,
        perPage: limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getTagsWithPostsInTimeRange(startDate: Date) {
  const posts = await Post.find({
    createdAt: { $gte: startDate }
  }).select('tags');
  
  return [...new Set(posts.flatMap(post => post.tags))];
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (session) => {
    if (!session?.user?.isAdmin) {
      return createErrorResponse('Unauthorized', 403);
    }

    try {
      const { name } = await request.json();
      
      if (!name || typeof name !== 'string') {
        return createErrorResponse('Invalid tag name', 400);
      }

      await dbConnect();
      
      const existingTag = await Tag.findOne({ name });
      if (existingTag) {
        return createErrorResponse('Tag already exists', 400);
      }
      
      const newTag = await Tag.create({
        name,
        creator: session.user.id,
        postsCount: 0,
        newPostsToday: 0,
        newPostsThisWeek: 0
      });

      return NextResponse.json(newTag);
    } catch (error) {
      console.error('Error creating tag:', error);
      return createErrorResponse('Internal server error', 500);
    }
  });
} 