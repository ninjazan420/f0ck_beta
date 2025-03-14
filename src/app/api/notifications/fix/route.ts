import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Notification from '@/models/Notification';
import Post from '@/models/Post';

/**
 * Diese Route behebt alle Benachrichtigungen mit fehlenden oder falschen postId-Werten.
 * Sie ist nützlich, um im laufenden Betrieb alle Benachrichtigungen zu reparieren.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Finde alle Post-bezogenen Benachrichtigungen
    const notifications = await Notification.find({
      relatedModel: 'Post'
    }).populate({
      path: 'relatedId',
      select: 'numericId id title thumbnailUrl imageUrl'
    });
    
    console.log(`Found ${notifications.length} Post-related notifications to check`);
    
    const results = {
      checked: notifications.length,
      fixed: 0,
      errors: 0
    };
    
    // Durchlaufe alle Benachrichtigungen und korrigiere sie
    for (const notification of notifications) {
      if (notification.relatedId) {
        try {
          // Bevorzuge numericId oder id, wenn verfügbar
          const postId = notification.relatedId.numericId || notification.relatedId.id || notification.relatedId._id;
          
          // Aktualisiere die Benachrichtigung mit korrekten Daten
          const updateData = {
            ...notification.data || {},
            postId: postId.toString(),
            postTitle: notification.relatedId.title || 'Untitled post',
            postThumbnail: notification.relatedId.thumbnailUrl || notification.relatedId.imageUrl || null
          };
          
          await Notification.findByIdAndUpdate(notification._id, { data: updateData });
          results.fixed++;
        } catch (error) {
          console.error(`Error fixing notification ${notification._id}:`, error);
          results.errors++;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error fixing notifications:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 