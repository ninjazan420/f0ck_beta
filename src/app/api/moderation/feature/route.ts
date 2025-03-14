import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import SiteSettings from '@/models/SiteSettings';
import Post from '@/models/Post';
import ModLog from '@/models/ModLog';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    let post;
    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findById(postId);
    }

    if (!post) {
      post = await Post.findOne({ id: parseInt(postId, 10) });
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const settings = await SiteSettings.getInstance();
    settings.featuredPostId = typeof post.id === 'number' ? post.id : parseInt(post.id, 10);
    await settings.save();

    await ModLog.create({
      moderator: session.user.id,
      action: 'feature',
      targetType: 'post',
      targetId: post._id,
      reason: 'Post featured on homepage'
    });

    return NextResponse.json({ success: true, featured: { id: post.id } });
  } catch (error) {
    console.error('Error featuring post:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const settings = await SiteSettings.getInstance();
    const featuredPostId = settings.featuredPostId;

    if (!featuredPostId) {
      return NextResponse.json({ error: 'No featured post to unfeature' }, { status: 400 });
    }

    let post;
    post = await Post.findOne({ id: featuredPostId });

    settings.featuredPostId = null;
    await settings.save();

    if (post) {
      await ModLog.create({
        moderator: session.user.id,
        action: 'unfeature',
        targetType: 'post',
        targetId: post._id,
        reason: 'Post removed from homepage'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unfeaturing post:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 