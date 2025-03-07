import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import ModLog from '@/models/ModLog';
import User from '@/models/User';
import Comment from '@/models/Comment';
import Post from '@/models/Post';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { action, targetType, targetId, reason, duration } = body;

    if (!action || !targetType || !targetId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Zielobjekt finden
    let Model;
    switch (targetType) {
      case 'user':
        Model = User;
        break;
      case 'comment':
        Model = Comment;
        break;
      case 'post':
        Model = Post;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid target type' },
          { status: 400 }
        );
    }

    const target = await Model.findById(targetId);
    if (!target) {
      return NextResponse.json(
        { error: 'Target not found' },
        { status: 404 }
      );
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
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Aktion loggen
    const modLog = new ModLog({
      moderator: session.user.id,
      action,
      targetType,
      targetId,
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
    console.error('Error performing moderation action:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 