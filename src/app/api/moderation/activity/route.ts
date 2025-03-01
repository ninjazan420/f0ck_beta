import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import ModLog from '@/models/ModLog';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const action = searchParams.get('action');
    const moderator = searchParams.get('moderator');

    await dbConnect();

    // Query aufbauen
    const query: any = {};
    if (type) query.targetType = type;
    if (action) query.action = action;
    if (moderator) query.moderator = moderator;

    // Aktivitäten abrufen mit Pagination
    const [activities, total] = await Promise.all([
      ModLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('moderator', 'username')
        .populate('targetId'),
      ModLog.countDocuments(query)
    ]);

    // Aktivitäten formatieren
    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      action: activity.action,
      targetType: activity.targetType,
      reason: activity.reason,
      moderator: activity.moderator.username,
      createdAt: activity.createdAt,
      metadata: activity.metadata,
      target: activity.targetId ? {
        id: activity.targetId._id,
        type: activity.targetType,
        // Je nach Typ relevante Informationen hinzufügen
        ...(activity.targetType === 'user' && { username: activity.targetId.username }),
        ...(activity.targetType === 'comment' && { content: activity.targetId.content }),
        ...(activity.targetType === 'post' && { title: activity.targetId.title })
      } : null
    }));

    return NextResponse.json({
      activities: formattedActivities,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching moderation activity:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 