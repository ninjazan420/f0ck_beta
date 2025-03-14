import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import SiteSettings from '@/models/SiteSettings';
import Post from '@/models/Post';

export async function GET() {
  try {
    await dbConnect();

    const settings = await SiteSettings.getInstance();
    
    if (!settings.featuredPostId) {
      return NextResponse.json({ featured: null });
    }

    const post = await Post.findOne({ id: settings.featuredPostId })
      .populate('author', 'username avatar');

    if (!post) {
      // Falls der Featured Post nicht mehr existiert
      settings.featuredPostId = null;
      await settings.save();
      return NextResponse.json({ featured: null });
    }

    return NextResponse.json({ 
      featured: {
        id: post.id,
        _id: post._id,
        title: post.title,
        description: post.description,
        imageUrl: post.imageUrl,
        thumbnailUrl: post.thumbnailUrl,
        author: post.author,
        createdAt: post.createdAt,
        meta: post.meta,
        stats: post.stats,
        tags: post.tags
      }
    });
  } catch (error) {
    console.error('Error fetching featured post:', error);
    return NextResponse.json(
      { error: 'Error fetching featured post' },
      { status: 500 }
    );
  }
} 