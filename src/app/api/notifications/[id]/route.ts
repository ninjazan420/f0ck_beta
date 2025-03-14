import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Notification from '@/models/Notification';
import Post from '@/models/Post';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationId = params.id;
    await dbConnect();

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: session.user.id
    }).populate({
      path: 'relatedId',
      select: 'title content numericId id author thumbnailUrl imageUrl',
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Wenn die Benachrichtigung einen Verweis auf einen Post hat,
    // stellen wir sicher, dass die Thumbnail-Daten vorhanden sind
    if (notification.relatedModel === 'Post' && notification.relatedId) {
      // WICHTIG: Hier bevorzugen wir numericId oder id
      const postId = notification.relatedId.numericId || notification.relatedId.id || notification.relatedId._id;
      
      // Wir aktualisieren die Benachrichtigung mit dem Thumbnail und korrekter postId
      notification.data = {
        ...notification.data,
        postId: postId.toString(),
        postThumbnail: notification.relatedId.thumbnailUrl || notification.relatedId.imageUrl,
        postTitle: notification.relatedId.title
      };
      await notification.save();
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 