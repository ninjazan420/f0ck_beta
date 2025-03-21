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
    
    // Nur Moderatoren und Admins dürfen Kommentare deaktivieren
    if (!session?.user || !['moderator', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const postId = params.id;
    const { disabled, reason } = await request.json();
    
    await dbConnect();
    
    // Versuche, den Post mit verschiedenen ID-Typen zu finden
    let post;
    
    // Versuche zuerst als MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findById(postId);
    }
    
    // Wenn nicht gefunden, versuche als numerische ID
    if (!post) {
      const numericId = parseInt(postId, 10);
      if (!isNaN(numericId)) {
        post = await Post.findOne({ id: numericId });
      }
    }
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Aktualisiere den Kommentarstatus
    post.hasCommentsDisabled = disabled;
    await post.save();
    
    // Erstelle einen ModLog-Eintrag
    await ModLog.create({
      moderator: session.user.id,
      action: disabled ? 'disableComments' : 'enableComments',
      targetType: 'post',
      targetId: post._id,
      reason: reason || `Moderator ${disabled ? 'disabled' : 'enabled'} comments on post`,
    });
    
    return NextResponse.json({
      success: true,
      commentsDisabled: post.hasCommentsDisabled
    });
  } catch (error) {
    console.error('Error updating comment status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 