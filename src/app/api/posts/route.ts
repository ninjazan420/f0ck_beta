import { withAuth, createErrorResponse } from '@/lib/api-utils';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import { NextResponse } from 'next/server';

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

export async function GET() {
  try {
    await dbConnect();
    const posts = await Post.find({})
      .select({
        id: 1,
        title: 1,
        imageUrl: 1,
        thumbnailUrl: 1,
        stats: 1,
        contentRating: 1,
        meta: 1,
        author: 1,
        _id: 0
      })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
