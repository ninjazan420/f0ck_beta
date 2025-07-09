import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import ModLog from '@/models/ModLog';
import { NotificationService } from '@/lib/services/notificationService';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const postIdOrNumericId = resolvedParams.id;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Finde den Post entweder anhand der MongoDB _id oder der numerischen id
    const post = await Post.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(postIdOrNumericId) ? postIdOrNumericId : null },
        { id: parseInt(postIdOrNumericId) || -1 }
      ]
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Verwende immer die MongoDB _id für den Vergleich
    const postId = post._id.toString();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already favorited this post
    const alreadyFavorited = user.favorites && user.favorites.some(
      (fav) => fav.toString() === postId
    );

    if (alreadyFavorited) {
      return NextResponse.json({ 
        favorited: true,
        message: 'Post already in favorites' 
      });
    }

    // Add post to user's favorites
    if (!user.favorites) {
      user.favorites = [];
    }
    user.favorites.push(postId);

    // Increment favorites count on post
    post.stats.favorites = (post.stats.favorites || 0) + 1;

    // Use transaction to prevent version conflicts
    const session_db = await mongoose.startSession();
    try {
      await session_db.withTransaction(async () => {
        await user.save({ session: session_db });
        await post.save({ session: session_db });

        // Create ModLog entry
        await ModLog.create([{
          moderator: session.user.id,
          action: 'favorite',
          targetType: 'post',
          targetId: post._id,
          reason: 'User favorited post',
          metadata: {
            autoTriggered: true
          }
        }], { session: session_db });
      });
    } finally {
      await session_db.endSession();
    }

    // Send notification to post author (implement this function)
    try {
      await NotificationService.notifyPostFavorite(postId, session.user.id);
    } catch (notifyError) {
      console.error('Error sending favorite notification:', notifyError);
    }

    return NextResponse.json({ 
      success: true,
      favorited: true,
      favoritesCount: post.stats.favorites
    });
  } catch (error) {
    console.error('Error favoriting post:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Remove from favorites
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parameter korrekt auflösen
    const resolvedParams = await params;
    const postId = resolvedParams.id;
    
    await dbConnect();
    
    // Verbesserte Suche nach dem Post mit Überprüfung der ObjectId-Gültigkeit
    let post;
    
    // Prüfen, ob postId eine gültige MongoDB ObjectId ist
    if (mongoose.isValidObjectId(postId)) {
      post = await Post.findById(postId);
    }
    
    // Falls nicht gefunden, versuche als numerische ID zu finden
    if (!post) {
      const numericId = parseInt(postId, 10);
      if (!isNaN(numericId)) {
        post = await Post.findOne({ id: numericId });
      }
    }
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Finde den Benutzer
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Überprüfe, ob der Benutzer den Post favorisiert hat
    if (!user.favorites) {
      user.favorites = [];
      return NextResponse.json({ 
        favorited: false,
        favoriteCount: post.stats?.favorites || 0 
      });
    }

    // Finde und entferne den Post aus den Favoriten des Benutzers
    const postMongoId = post._id.toString();
    const favoriteIndex = user.favorites.findIndex(
      favId => favId.toString() === postMongoId
    );

    if (favoriteIndex !== -1) {
      // Post aus Favoriten entfernen
      user.favorites.splice(favoriteIndex, 1);

      // Aktualisiere den Post-Zähler
      if (!post.stats) {
        post.stats = { likes: 0, views: 0, comments: 0, favorites: 0 };
      }

      post.stats.favorites = Math.max(0, (post.stats.favorites || 0) - 1);

      // Use transaction to prevent version conflicts
      const session_db = await mongoose.startSession();
      try {
        await session_db.withTransaction(async () => {
          await user.save({ session: session_db });
          await post.save({ session: session_db });

          // ModLog eintragen mit korrekter action
          await ModLog.create([{
            moderator: session.user.id,
            action: 'favorite', // Änderung von 'unfavorite' zu 'favorite'
            targetType: 'post',
            targetId: post._id,
            reason: 'User removed post from favorites',
            metadata: {
              postId: post._id,
              postTitle: post.title,
              removed: true // Zeigt an, dass es eine Entfernung ist
            }
          }], { session: session_db });
        });
      } finally {
        await session_db.endSession();
      }
    }

    return NextResponse.json({ 
      favorited: false,
      favoriteCount: post.stats.favorites 
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Error removing favorite' },
      { status: 500 }
    );
  }
} 