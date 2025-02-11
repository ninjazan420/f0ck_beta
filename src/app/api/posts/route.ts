import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, mediaUrl, mediaType, tags, isNSFW } = await req.json();
    
    if (!title || !content || !mediaUrl || !mediaType) {
      return NextResponse.json(
        { error: 'Title, content, mediaUrl and mediaType are required' },
        { status: 400 }
      );
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

    return NextResponse.json({ 
      message: 'Post created successfully',
      post
    });
  } catch (error: unknown) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(50);
    return NextResponse.json(posts);
  } catch (error: unknown) {
    console.error('Posts fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
