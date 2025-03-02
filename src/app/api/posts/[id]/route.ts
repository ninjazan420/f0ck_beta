import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Ensure params.id is parsed as a number
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Finde den Post ohne populate
    const post = await Post.findOne({ id: id });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Wenn ein Autor existiert, populate die Autor-Daten
    if (post.author) {
      await post.populate('author', 'username avatar bio premium role createdAt stats');
    } else {
      // Füge Dummy-Autor-Daten für anonyme Posts hinzu
      post.author = {
        _id: 'anonymous',
        username: 'Anonymous',
        avatar: null,
        bio: '',
        premium: false,
        role: 'member',
        createdAt: new Date(),
        stats: {
          totalPosts: 0,
          totalLikes: 0,
          totalViews: 0,
          level: 1,
          xp: 0,
          xpNeeded: 100
        }
      };
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 