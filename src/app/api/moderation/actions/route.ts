import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import ModLog from '@/models/ModLog';
import User from '@/models/User';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import mongoose from 'mongoose';
import { withModeratorAuth } from '@/lib/api-utils';

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
    const { action, targetType, targetId, reason, duration } = body;

    if (!action || !targetType || !targetId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Zielobjekt finden
    let Model;
    let target;
    
    switch (targetType) {
      case 'user':
        Model = User;
        target = await Model.findById(targetId);
        break;
      case 'comment':
        Model = Comment;
        target = await Model.findById(targetId);
        break;
      case 'post':
        Model = Post;
        // Versuche zuerst, den Post durch seine MongoDB ObjectId zu finden
        if (mongoose.Types.ObjectId.isValid(targetId)) {
          target = await Model.findById(targetId);
        }
        
        // Wenn nicht gefunden, versuche als numerische ID zu finden
        if (!target) {
          target = await Model.findOne({ id: parseInt(targetId, 10) });
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
    }

    if (!target) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 });
    }

    // Aktion ausführen
    const previousState = { ...target.toObject() };
    
    switch (action) {
      case 'delete':
        await target.deleteOne();
        break;
      case 'ban':
        if (targetType !== 'user') {
          return NextResponse.json(
            { error: 'Can only ban users' },
            { status: 400 }
          );
        }
        target.role = 'banned';
        await target.save();
        break;
      case 'unban':
        if (targetType !== 'user') {
          return NextResponse.json(
            { error: 'Can only unban users' },
            { status: 400 }
          );
        }
        target.role = 'user';
        await target.save();
        break;
      case 'approve':
        if (!target.status) {
          return NextResponse.json(
            { error: 'Target cannot be approved' },
            { status: 400 }
          );
        }
        target.status = 'approved';
        await target.save();
        break;
      case 'reject':
        if (!target.status) {
          return NextResponse.json(
            { error: 'Target cannot be rejected' },
            { status: 400 }
          );
        }
        target.status = 'rejected';
        await target.save();
        break;
      case 'disableComments':
        if (targetType !== 'post') {
          return NextResponse.json({ error: 'Can only disable comments on posts' }, { status: 400 });
        }
        target.hasCommentsDisabled = true;
        await target.save();
        break;
      case 'enableComments':
        if (targetType !== 'post') {
          return NextResponse.json({ error: 'Can only enable comments on posts' }, { status: 400 });
        }
        target.hasCommentsDisabled = false;
        await target.save();
        break;
      case 'pin':
        await handlePinAction(targetId, session.user.id);
        return NextResponse.json({ success: true });
      case 'unpin':
        await handleUnpinAction(targetId, session.user.id);
        return NextResponse.json({ success: true });
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Aktion loggen
    const modLog = new ModLog({
      moderator: session.user.id,
      action,
      targetType,
      targetId: target._id,
      reason,
      metadata: {
        previousState,
        newState: target.isDeleted ? null : target.toObject(),
        duration,
        autoTriggered: false
      }
    });

    await modLog.save();

    return NextResponse.json({
      success: true,
      message: `${action} action completed successfully`
    });

  } catch (error) {
    console.error('Moderation action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

async function handlePinAction(postId: string, userId: string): Promise<any> {
  try {
    // Setze zuerst alle anderen Posts zurück
    await Post.updateMany(
      { isPinned: true },
      { $set: { isPinned: false } }
    );
    
    // Finde den Post auf die gleiche Weise wie im Haupthandler
    let post;
    
    // Versuche zuerst, den Post durch seine MongoDB ObjectId zu finden
    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findByIdAndUpdate(
        postId,
        { $set: { isPinned: true } },
        { new: true }
      );
    }
    
    // Wenn nicht gefunden, versuche als numerische ID zu finden
    if (!post) {
      post = await Post.findOneAndUpdate(
        { id: parseInt(postId, 10) },
        { $set: { isPinned: true } },
        { new: true }
      );
    }
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    // Erstelle einen Moderations-Log-Eintrag
    await ModLog.create({
      moderator: userId,
      action: 'pin',
      targetType: 'post',
      targetId: post._id, // Wichtig: Wir verwenden die _id des gefundenen Posts
      reason: 'Post pinned to posts page'
    });
    
    return post;
  } catch (error) {
    console.error('Failed to pin post:', error);
    throw new Error('Failed to pin post');
  }
}

async function handleUnpinAction(postId: string, userId: string): Promise<any> {
  try {
    // Finde den Post mit der gleichen Logik wie oben
    let post;
    
    // Versuche zuerst, den Post durch seine MongoDB ObjectId zu finden
    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findByIdAndUpdate(
        postId,
        { $set: { isPinned: false } },
        { new: true }
      );
    }
    
    // Wenn nicht gefunden, versuche als numerische ID zu finden
    if (!post) {
      post = await Post.findOneAndUpdate(
        { id: parseInt(postId, 10) },
        { $set: { isPinned: false } },
        { new: true }
      );
    }
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    // Erstelle einen Moderations-Log-Eintrag
    await ModLog.create({
      moderator: userId,
      action: 'unpin',
      targetType: 'post',
      targetId: post._id, // Verwende die _id des gefundenen Posts
      reason: 'Post unpinned from posts page'
    });
    
    return post;
  } catch (error) {
    console.error('Failed to unpin post:', error);
    throw new Error('Failed to unpin post');
  }
} 