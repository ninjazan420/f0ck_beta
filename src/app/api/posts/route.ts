import { withAuth, createErrorResponse } from '@/lib/api-utils';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import Comment from '@/models/Comment';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  return withAuth(async (session) => {
    const { title, content, mediaUrl, mediaType, tags, isNSFW } = await req.json();
    
    if (!title || !content || !mediaUrl || !mediaType) {
      return createErrorResponse('Title, content, mediaUrl and mediaType are required');
    }

    await dbConnect();
    const post = await Post.create({
      title,
      content,
      mediaUrl,
      mediaType, 
      tags: tags || [],
      isNSFW: isNSFW || false,
      author: session.user.id
    });

    return { message: 'Post created successfully', post };
  });
}

export async function GET(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await rateLimit(`fetch_posts_${ip}`, 50, 60); // 50 Anfragen pro Minute
    if (rateLimitResult) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    await dbConnect();
    
    // Parse query parameters
    const url = new URL(req.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '28');
    const search = url.searchParams.get('search') || '';
    const uploader = url.searchParams.get('uploader') || '';
    const commenter = url.searchParams.get('commenter') || '';
    const minLikes = parseInt(url.searchParams.get('minLikes') || '0');
    const dateFrom = url.searchParams.get('dateFrom') || '';
    const dateTo = url.searchParams.get('dateTo') || '';
    const sortBy = url.searchParams.get('sortBy') || 'newest';
    const contentRating = url.searchParams.getAll('contentRating');
    const tags = url.searchParams.getAll('tag');
    
    console.log('API received tag parameters:', tags);
    
    // Build query object
    const query: any = {};
    
    // Text search (if provided)
    if (search) {
      const safeSearchPattern = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: safeSearchPattern, $options: 'i' } },
        { tags: { $regex: safeSearchPattern, $options: 'i' } }
      ];
    }
    
    // Tag filter
    if (tags && tags.length > 0) {
      // Alle angegebenen Tags müssen im Post enthalten sein (UND-Verknüpfung)
      query.tags = { $all: tags };
      console.log('Filtering posts by tags:', tags);
    }
    
    // Uploader filter
    if (uploader) {
      const authorQuery = { username: { $regex: uploader, $options: 'i' } };
      const authors = await User.find(authorQuery).select('_id');
      query.author = { $in: authors.map(a => a._id) };
    }
    
    // Commenter filter
    if (commenter) {
      // Find user IDs matching the commenter name
      const commenterQuery = { username: { $regex: commenter, $options: 'i' } };
      const commenters = await User.find(commenterQuery).select('_id');
      const commenterIds = commenters.map(c => c._id);
      
      // Find posts that have comments from these users
      const postsWithComments = await Comment.find({
        author: { $in: commenterIds }
      }).distinct('post');
      
      // Add to query (AND with other conditions)
      query._id = { $in: postsWithComments };
    }
    
    // Content rating filter
    if (contentRating && contentRating.length > 0) {
      query.contentRating = { $in: contentRating };
    }
    
    // Min likes filter
    if (minLikes > 0) {
      query['stats.likes'] = { $gte: minLikes };
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // "Geliked von"-Filter
    if (url.searchParams.has('liked_by')) {
      const username = url.searchParams.get('liked_by');
      const user = await User.findOne({ username });
      if (user && user.likes && user.likes.length > 0) {
        // Finde Posts, die vom Benutzer geliked wurden
        query._id = { $in: user.likes };
      } else {
        // Keine Likes oder kein Benutzer gefunden
        return NextResponse.json({
          posts: [],
          pagination: { total: 0, page: 1, perPage: limit, totalPages: 0 }
        });
      }
    }

    // "Favorisiert von"-Filter
    if (url.searchParams.has('favorited_by')) {
      const username = url.searchParams.get('favorited_by');
      const user = await User.findOne({ username });
      if (user && user.favorites && user.favorites.length > 0) {
        // Finde Posts, die vom Benutzer favorisiert wurden
        query._id = { $in: user.favorites };
      } else {
        // Keine Favoriten oder kein Benutzer gefunden
        return NextResponse.json({
          posts: [],
          pagination: { total: 0, page: 1, perPage: limit, totalPages: 0 }
        });
      }
    }

    // Determine sort order
    let sortOptions: any = { createdAt: -1 }; // Default to newest
    switch(sortBy) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'most_liked':
        sortOptions = { 'stats.likes': -1 };
        break;
      case 'most_commented':
        sortOptions = { 'stats.comments': -1 };
        break;
    }
    
    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);
    
    // Get paginated results
    const posts = await Post.find(query)
      .select({
        id: 1,
        title: 1,
        imageUrl: 1,
        thumbnailUrl: 1,
        stats: 1,
        contentRating: 1,
        meta: 1,
        author: 1,
        mediaType: 1,
        hasAudio: 1,
        isPinned: 1,
        isAd: 1,
        createdAt: 1,
        _id: 0
      })
      .populate('author', 'username avatar premium member admin moderator')
      .sort(sortOptions)
      .skip(offset)
      .limit(limit);
    
    // Ergänze die Verarbeitung der Posts, um das isVideo-Flag zu verwenden
    const processedPosts = posts.map((post) => ({
      id: post._id || post.id,
      title: post.title || '',
      thumbnail: post.thumbnailUrl || '/images/placeholder.jpg',
      imageUrl: post.imageUrl || '',
      likes: post.stats?.likes || 0,
      comments: post.stats?.comments || 0,
      favorites: post.stats?.favorites || 0,
      stats: {
        likes: post.stats?.likes || 0,
        comments: post.stats?.comments || 0,
        favorites: post.stats?.favorites || 0
      },
      contentRating: post.contentRating || 'safe',
      isPinned: post.isPinned || false,
      // Setze den mediaType basierend auf dem post.meta.isVideo Flag
      mediaType: post.meta?.isVideo ? 'video' : 
                 (post.meta?.format === 'gif' ? 'gif' : 'image'),
      // Falls es ein Video ist, setze hasAudio immer auf true (kann später verfeinert werden)
      hasAudio: post.meta?.isVideo ? true : false,
    }));
    
    return NextResponse.json({
      posts: processedPosts,
      totalPosts,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(totalPosts / limit)
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
