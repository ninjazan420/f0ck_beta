import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Notification from '@/models/Notification';

// GET /api/notifications - Alle Benachrichtigungen für den aktuellen Benutzer abrufen
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') || '10');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    
    await dbConnect();
    
    // Query-Objekt erstellen
    const query: any = { recipient: session.user.id };
    
    // Nur ungelesene Benachrichtigungen, wenn unreadOnly=true
    if (unreadOnly) {
      query.read = false;
    }
    
    console.log(`Fetching notifications for user ${session.user.id}:`, query);
    
    // Benachrichtigungen abrufen
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'relatedId',
        select: 'title content numericId id author thumbnailUrl imageUrl',
      });
    
    // Aktualisiere alle geladenen Benachrichtigungen mit korrekten Post-IDs
    for (const notification of notifications) {
      // Überprüfe alle Post-bezogenen Benachrichtigungen
      if (notification.relatedModel === 'Post' && notification.relatedId) {
        let needsUpdate = false;
        let updateData = { ...notification.data || {} };
        
        // 1. Stelle sicher, dass wir eine korrekte postId haben (bevorzuge numerische ID)
        // WICHTIG: Hier müssen wir alle möglichen ID-Varianten berücksichtigen
        const numericId = notification.relatedId.numericId || notification.relatedId.id;
        if (numericId && (!updateData.postId || updateData.postId !== numericId.toString())) {
          updateData.postId = numericId.toString();
          needsUpdate = true;
          console.log(`Fixing postId for notification ${notification._id}: ${updateData.postId}`);
        }
        
        // 2. Stelle sicher, dass wir ein Thumbnail haben
        if (!updateData.postThumbnail && (notification.relatedId.thumbnailUrl || notification.relatedId.imageUrl)) {
          updateData.postThumbnail = notification.relatedId.thumbnailUrl || notification.relatedId.imageUrl;
          needsUpdate = true;
        }
        
        // 3. Stelle sicher, dass wir einen Titel haben
        if (!updateData.postTitle && notification.relatedId.title) {
          updateData.postTitle = notification.relatedId.title;
          needsUpdate = true;
        }
        
        // Aktualisiere die Benachrichtigung in der Datenbank, falls Änderungen nötig sind
        if (needsUpdate) {
          try {
            await Notification.findByIdAndUpdate(notification._id, { 
              data: updateData 
            });
            // Aktualisiere auch die lokale Instanz für die Antwort
            notification.data = updateData;
          } catch (updateError) {
            console.error(`Failed to update notification ${notification._id}:`, updateError);
          }
        }
      }
    }
    
    console.log(`Found ${notifications.length} notifications`);
    
    // Ungelesene Benachrichtigungen zählen
    const unreadCount = await Notification.countDocuments({
      recipient: session.user.id,
      read: false
    });
    
    return NextResponse.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Benachrichtigungen als gelesen markieren
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { notificationId, markAllRead } = body;
    
    await dbConnect();
    
    if (markAllRead) {
      // Alle Benachrichtigungen als gelesen markieren
      await Notification.updateMany(
        { recipient: session.user.id },
        { read: true }
      );
      
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notificationId) {
      // Einzelne Benachrichtigung als gelesen markieren
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: session.user.id
      });
      
      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }
      
      notification.read = true;
      await notification.save();
      
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json(
        { error: 'Missing required parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 