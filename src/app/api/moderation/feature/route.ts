import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import SiteSettings from '@/models/SiteSettings';
import Post from '@/models/Post';
import ModLog from '@/models/ModLog';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
    }

    await dbConnect();

    // Post finden
    let post;
    if (Number.isInteger(parseInt(postId, 10))) {
      post = await Post.findOne({ id: parseInt(postId, 10) });
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // SiteSettings aktualisieren
    const settings = await SiteSettings.getInstance();
    const previousFeaturedPostId = settings.featuredPostId;
    settings.featuredPostId = post.id;
    await settings.save();

    // ModLog erstellen
    const modLog = new ModLog({
      moderator: session.user.id,
      action: 'feature',
      targetType: 'post',
      targetId: post._id,
      reason: 'Featured post on homepage',
      metadata: {
        previousState: { featuredPostId: previousFeaturedPostId },
        newState: { featuredPostId: post.id },
        autoTriggered: false
      }
    });

    await modLog.save();

    return NextResponse.json({
      success: true,
      message: 'Post featured successfully'
    });
  } catch (error) {
    console.error('Feature post error:', error);
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

    // SiteSettings aktualisieren
    const settings = await SiteSettings.getInstance();
    const previousFeaturedPostId = settings.featuredPostId;
    settings.featuredPostId = null;
    await settings.save();

    // ModLog erstellen
    const modLog = new ModLog({
      moderator: session.user.id,
      action: 'unfeature',
      targetType: 'post',
      targetId: null, // Kein spezifisches Target
      reason: 'Removed featured post from homepage',
      metadata: {
        previousState: { featuredPostId: previousFeaturedPostId },
        newState: { featuredPostId: null },
        autoTriggered: false
      }
    });

    await modLog.save();

    return NextResponse.json({
      success: true,
      message: 'Featured post removed successfully'
    });
  } catch (error) {
    console.error('Unfeature post error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 