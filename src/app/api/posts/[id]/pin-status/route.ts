import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import ModLog from '@/models/ModLog';
import mongoose from 'mongoose';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Nur Moderatoren und Admins dürfen Posts anpinnen
    if (!session?.user || !['moderator', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const postId = params.id;
    const { pinned, reason } = await request.json();
    
    await dbConnect();
    
    // Wenn wir einen Post anpinnen, müssen wir zuerst alle anderen Posts entpinnen
    if (pinned) {
      await Post.updateMany(
        { isPinned: true },
        { $set: { isPinned: false } }
      );
    }
    
    // Versuche, den Post mit verschiedenen ID-Typen zu finden
    let post;
    
    // Versuche zuerst als MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findByIdAndUpdate(
        postId,
        { $set: { isPinned: pinned } },
        { new: true }
      );
    }
    
    // Wenn nicht gefunden, versuche als numerische ID
    if (!post) {
      const numericId = parseInt(postId, 10);
      if (!isNaN(numericId)) {
        post = await Post.findOneAndUpdate(
          { id: numericId },
          { $set: { isPinned: pinned } },
          { new: true }
        );
      }
    }
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Erstelle einen ModLog-Eintrag
    await ModLog.create({
      moderator: session.user.id,
      action: pinned ? 'pin' : 'unpin',
      targetType: 'post',
      targetId: post._id,
      reason: reason || `Moderator ${pinned ? 'pinned' : 'unpinned'} post`,
    });
    
    return NextResponse.json({
      success: true,
      isPinned: post.isPinned
    });
  } catch (error) {
    console.error('Error updating pin status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 