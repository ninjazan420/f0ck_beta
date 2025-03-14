import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Notification from '@/models/Notification';
import Post from '@/models/Post';

// Nur für Entwicklungszwecke - zeigt detaillierte Debugging-Informationen für Notifications
export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debugging endpoint disabled in production' }, { status: 403 });
  }
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Alle Benachrichtigungen des Nutzers mit vollständigen Details laden
    const notifications = await Notification.find({ 
      recipient: session.user.id 
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({
      path: 'relatedId',
      select: 'title content numericId id author thumbnailUrl imageUrl',
    });
    
    // Sammle Debugging-Informationen
    const notificationDebug = notifications.map(notification => {
      // Bestimme die zu verwendende Post-ID
      const postId = notification.data?.postId || 
                    (notification.relatedId?.numericId?.toString()) || 
                    (notification.relatedId?.id?.toString()) || 
                    notification.relatedId?._id;
      
      return {
        _id: notification._id,
        type: notification.type,
        content: notification.content,
        relatedModel: notification.relatedModel,
        relatedIdType: notification.relatedId ? typeof notification.relatedId : 'undefined',
        relatedIdDetails: notification.relatedId ? {
          _id: notification.relatedId._id,
          numericId: notification.relatedId.numericId,
          id: notification.relatedId.id,
          title: notification.relatedId.title,
          thumbnailUrl: notification.relatedId.thumbnailUrl,
          imageUrl: notification.relatedId.imageUrl
        } : null,
        data: notification.data,
        createdAt: notification.createdAt,
        computedPostId: postId,
        computedLink: getDebugNotificationLink(notification)
      };
    });
    
    return NextResponse.json({
      notifications: notificationDebug,
      raw: notifications
    });
  } catch (error) {
    console.error('Error getting notification debug info:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

function getDebugNotificationLink(notification: any) {
  try {
    // Berechnung des Links mit Priorität auf numericId/id
    const postId = notification.data?.postId || 
                 (notification.relatedId?.numericId?.toString()) || 
                 (notification.relatedId?.id?.toString()) || 
                 notification.relatedId?._id;
    
    switch (notification.type) {
      case 'comment':
        return `/post/${postId}#comment-${notification.data?.commentId || ''}`;
      case 'reply':
        return `/post/${postId}#comment-${notification.relatedId?._id || notification.data?.commentId || ''}`;
      case 'like':
      case 'favorite':
        return `/post/${postId}`;
      case 'mention':
        if (notification.relatedModel === 'Comment') {
          return `/post/${postId}#comment-${notification.relatedId?._id || ''}`;
        }
        return `/post/${postId}`;
      default:
        return `/post/${postId}`;
    }
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
} 