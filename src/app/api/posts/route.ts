import { withAuth, createErrorResponse } from '@/lib/api-utils';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import Comment from '@/models/Comment';
import { rateLimitLegacy } from '@/lib/rateLimit';

export async function POST(req: Request) {
  return withAuth(async (session: { user: { id: string } }) => {
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
    const rateLimitResult = rateLimitLegacy(`fetch_posts_${ip}`, 50, 60); // 50 Anfragen pro Minute
    if (rateLimitResult) {
      return rateLimitResult;
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
    
    // Get all ads first (they need to be mixed randomly)
    const allAds = await Post.find({ ...query, isAd: true })
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
      .populate('author', 'username avatar premium member admin moderator');

    // Calculate how many ads to include on this page (roughly 1 ad per 10 posts)
    const adsPerPage = allAds.length > 0 ? Math.min(Math.ceil(limit / 10), allAds.length) : 0;

    // Adjust limit for normal posts to make room for ads
    const normalPostsLimit = limit - adsPerPage;

    // Get normal posts (excluding ads) with adjusted limit
    const normalPosts = await Post.find({ ...query, isAd: { $ne: true } })
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
      .sort({ isPinned: -1, ...sortOptions }) // Pinned posts first
      .skip(offset)
      .limit(normalPostsLimit);

    // Start with normal posts
    const mixedPosts = [...normalPosts];

    if (allAds.length > 0 && adsPerPage > 0) {
      // Use page number as seed for consistent randomization across requests
      const pageNumber = Math.floor(offset / limit);
      const seed = pageNumber * 12345; // Simple seed based on page

      // Shuffle ads with seeded randomization for consistency
      const shuffledAds = [...allAds].sort((a, b) => {
        const randomA = Math.sin(seed + a.id * 7777) * 10000;
        const randomB = Math.sin(seed + b.id * 7777) * 10000;
        return (randomA - Math.floor(randomA)) - (randomB - Math.floor(randomB));
      });

      // Take only the ads we need for this page
      const pageAds = shuffledAds.slice(0, adsPerPage);

      // Insert ads at random positions
      pageAds.forEach((ad, index) => {
        const pinnedCount = mixedPosts.filter(post => post.isPinned).length;

        // For page 1, allow ads anywhere after pinned posts (but not before them)
        // For other pages, allow ads anywhere
        let minPosition, maxPosition;

        if (pageNumber === 0) {
          // On first page, ads can be placed anywhere after pinned posts
          minPosition = pinnedCount;
          maxPosition = Math.max(pinnedCount, mixedPosts.length);
        } else {
          // On other pages, allow ads anywhere
          minPosition = 0;
          maxPosition = Math.max(0, mixedPosts.length);
        }

        // Use seeded random for consistent positioning
        const positionSeed = seed + index * 9999;
        const randomValue = Math.sin(positionSeed) * 10000;
        const normalizedRandom = randomValue - Math.floor(randomValue);
        const randomPosition = Math.floor(normalizedRandom * (maxPosition - minPosition + 1)) + minPosition;

        // Ensure we don't exceed array bounds
        const safePosition = Math.min(randomPosition, mixedPosts.length);
        mixedPosts.splice(safePosition, 0, ad);
      });
    }

    const posts = mixedPosts;
    
    // Process posts including ad status and video flags
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
      isAd: post.isAd || false, // Include ad status
      author: post.author || { username: 'anonymous' }, // Include author info
      // Set mediaType based on post.meta.isVideo flag
      mediaType: post.meta?.isVideo ? 'video' :
                 (post.meta?.format === 'gif' ? 'gif' : 'image'),
      // If it's a video, set hasAudio to true (can be refined later)
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
