import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import { NotificationService } from '@/lib/services/notificationService';
import mongoose from 'mongoose';
import ModLog from '@/models/ModLog';

// Gemeinsame Funktion zum Finden eines Posts
async function findPost(postId: string) {
  let post;
  
  if (mongoose.isValidObjectId(postId)) {
    post = await Post.findById(postId);
  }
  
  if (!post) {
    const numericId = parseInt(postId, 10);
    if (!isNaN(numericId)) {
      post = await Post.findOne({ id: numericId });
    }
  }
  
  return post;
}

// Gemeinsame Funktion für Logging
async function createInteractionLog(userId: string, action: string, post: any, removed: boolean = false) {
  return ModLog.create({
    moderator: userId,
    action,
    targetType: 'post',
    targetId: post._id,
    reason: `User ${removed ? 'removed' : ''} ${action} ${removed ? 'from' : ''} post`,
    metadata: {
      postId: post._id,
      postTitle: post.title,
      removed
    }
  });
}

// Handler für alle Interaktionen (POST/DELETE mit type-Parameter)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, remove = false } = await request.json();
    
    if (!['like', 'dislike', 'favorite'].includes(type)) {
      return NextResponse.json({ error: 'Invalid interaction type' }, { status: 400 });
    }

    const resolvedParams = await params;
    const postId = resolvedParams.id;
    
    await dbConnect();
    
    const post = await findPost(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const postMongoId = post._id.toString();
    
    // Handle specific interaction type
    if (type === 'like') {
      return await handleLikeInteraction(user, post, postMongoId, session.user.id, remove);
    } else if (type === 'dislike') {
      return await handleDislikeInteraction(user, post, postMongoId, session.user.id, remove);
    } else if (type === 'favorite') {
      return await handleFavoriteInteraction(user, post, postMongoId, session.user.id, remove);
    }
  } catch (error) {
    console.error(`Error handling interaction:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function handleLikeInteraction(user: any, post: any, postMongoId: string, userId: string, remove: boolean) {
  // Initialisiere benötigte Arrays
  if (!user.likes) user.likes = [];
  if (!post.stats) post.stats = { likes: 0, views: 0, comments: 0, favorites: 0, dislikes: 0 };
  if (!post.likedBy) post.likedBy = [];
  
  const hasLiked = user.likes.some(id => id.toString() === postMongoId);
  
  if (remove) {
    // Like entfernen
    if (!hasLiked) {
      return NextResponse.json({
        liked: false, 
        dislikeCount: post.stats.dislikes,
        message: 'Post wurde nicht geliked'
      });
    }
    
    // Like vom User entfernen
    const likeIndex = user.likes.findIndex(id => id.toString() === postMongoId);
    user.likes.splice(likeIndex, 1);
    
    // Auch aus dem Post entfernen
    if (post.likedBy) {
      const userIndex = post.likedBy.indexOf(userId);
      if (userIndex !== -1) {
        post.likedBy.splice(userIndex, 1);
      }
    }
    
    // Like-Zähler aktualisieren
    post.stats.likes = Math.max(0, (post.stats.likes || 0) - 1);
    
    await user.save();
    await post.save();
    
    // ModLog eintragen
    await ModLog.create({
      moderator: userId,
      action: 'like',
      targetType: 'post',
      targetId: post._id,
      reason: 'User removed like from post',
      metadata: {
        postId: post._id,
        postTitle: post.title,
        removed: true
      }
    });
    
    return NextResponse.json({
      liked: false,
      dislikeCount: post.stats.dislikes
    });
  } else {
    // Like hinzufügen
    if (hasLiked) {
      return NextResponse.json({ 
        liked: true, 
        dislikeCount: post.stats.dislikes,
        message: 'Post bereits geliked'
      });
    }
    
    // Falls der Post bisher gedisliked wurde, entferne den Dislike
    if (user.dislikes) {
      const dislikeIndex = user.dislikes.findIndex(id => id.toString() === postMongoId);
      if (dislikeIndex !== -1) {
        // Dislike entfernen
        user.dislikes.splice(dislikeIndex, 1);
        
        // Auch aus dem Post entfernen
        if (post.dislikedBy) {
          const userDislikeIndex = post.dislikedBy.indexOf(userId);
          if (userDislikeIndex !== -1) {
            post.dislikedBy.splice(userDislikeIndex, 1);
          }
        }
        
        // Dislike-Zähler reduzieren
        post.stats.dislikes = Math.max(0, (post.stats.dislikes || 0) - 1);
      }
    }
    
    // Like zum Post und zum Benutzer hinzufügen
    post.likedBy.push(userId);
    post.stats.likes += 1;
    
    // Speichere Like auch beim User
    user.likes.push(post._id);
    
    await user.save();
    await post.save();
    
    // Benachrichtigung an den Autor senden
    if (post.author && post.author.toString() !== userId) {
      await NotificationService.notifyPostLike(post._id.toString(), userId);
    }
    
    // ModLog eintragen
    await ModLog.create({
      moderator: userId,
      action: 'like',
      targetType: 'post',
      targetId: post._id,
      reason: 'User liked post',
      metadata: {
        postId: post._id,
        postTitle: post.title
      }
    });
    
    return NextResponse.json({
      liked: true,
      dislikeCount: post.stats.dislikes
    });
  }
}

async function handleDislikeInteraction(user: any, post: any, postMongoId: string, userId: string, remove: boolean) {
  // Arrays initialisieren, wenn nötig
  if (!user.dislikes) user.dislikes = [];
  if (!post.dislikedBy) post.dislikedBy = [];
  if (!post.stats) post.stats = { likes: 0, views: 0, comments: 0, favorites: 0, dislikes: 0 };
  if (!post.stats.dislikes) post.stats.dislikes = 0;
  
  // Prüfen, ob der Benutzer den Post bereits disliked hat
  const hasDisliked = user.dislikes.some(id => id.toString() === postMongoId);
  
  if (remove) {
    // Dislike entfernen
    if (!hasDisliked) {
      return NextResponse.json({
        disliked: false,
        likeCount: post.stats.likes,
        message: 'Post wurde nicht disliked'
      });
    }
    
    const dislikeIndex = user.dislikes.findIndex(id => id.toString() === postMongoId);
    user.dislikes.splice(dislikeIndex, 1);
    
    // Aus dem Post entfernen
    if (post.dislikedBy) {
      const userIndex = post.dislikedBy.indexOf(userId);
      if (userIndex !== -1) {
        post.dislikedBy.splice(userIndex, 1);
      }
    }
    
    // Dislike-Zähler reduzieren
    post.stats.dislikes = Math.max(0, post.stats.dislikes - 1);
    
    await user.save();
    await post.save();
    
    // ModLog-Eintrag erstellen
    await ModLog.create({
      moderator: userId,
      action: 'dislike', // Verwende 'dislike' direkt
      targetType: 'post',
      targetId: post._id,
      reason: 'User removed dislike from post',
      metadata: {
        postId: post._id,
        postTitle: post.title,
        removed: true
      }
    });
    
    return NextResponse.json({
      disliked: false,
      likeCount: post.stats.likes
    });
  } else {
    // Dislike hinzufügen
    if (hasDisliked) {
      return NextResponse.json({
        disliked: true,
        likeCount: post.stats.likes,
        message: 'Post bereits disliked'
      });
    }
    
    // Prüfen, ob der Benutzer den Post geliked hat, und diesen Like entfernen
    if (user.likes) {
      const likeIndex = user.likes.findIndex(id => id.toString() === postMongoId);
      if (likeIndex !== -1) {
        // Like entfernen
        user.likes.splice(likeIndex, 1);
        
        // Auch aus dem Post entfernen
        if (post.likedBy) {
          const userLikeIndex = post.likedBy.indexOf(userId);
          if (userLikeIndex !== -1) {
            post.likedBy.splice(userLikeIndex, 1);
          }
        }
        
        // Like-Zähler reduzieren
        post.stats.likes = Math.max(0, (post.stats.likes || 0) - 1);
      }
    }
    
    // Dislike hinzufügen
    user.dislikes.push(post._id);
    post.dislikedBy.push(userId);
    post.stats.dislikes += 1;
    
    await user.save();
    await post.save();
    
    // ModLog-Eintrag erstellen
    await ModLog.create({
      moderator: userId,
      action: 'dislike', // Verwende 'dislike' direkt
      targetType: 'post',
      targetId: post._id,
      reason: 'User disliked post',
      metadata: {
        postId: post._id,
        postTitle: post.title
      }
    });
    
    return NextResponse.json({
      disliked: true,
      likeCount: post.stats.likes
    });
  }
}

async function handleFavoriteInteraction(user: any, post: any, postMongoId: string, userId: string, remove: boolean) {
  // Initialisiere favorites-Array, falls nicht vorhanden
  if (!user.favorites) user.favorites = [];
  if (!post.stats) post.stats = { likes: 0, views: 0, comments: 0, favorites: 0, dislikes: 0 };
  if (!post.stats.favorites) post.stats.favorites = 0;
  
  // Prüfe, ob der Post bereits favorisiert wurde
  const hasFavorited = user.favorites.some(id => id.toString() === postMongoId);
  
  if (remove) {
    // Falls nicht favorisiert, beenden
    if (!hasFavorited) {
      return NextResponse.json({ 
        favorited: false,
        favoriteCount: post.stats.favorites,
        message: 'Post nicht in Favoriten'
      });
    }
    
    // Favorit entfernen
    const favoriteIndex = user.favorites.findIndex(id => id.toString() === postMongoId);
    user.favorites.splice(favoriteIndex, 1);
    
    // Zähler reduzieren
    post.stats.favorites = Math.max(0, post.stats.favorites - 1);
    
    await user.save();
    await post.save();
    
    // ModLog erstellen
    await ModLog.create({
      moderator: userId,
      action: 'favorite',
      targetType: 'post',
      targetId: post._id,
      reason: 'User removed post from favorites',
      metadata: {
        postId: post._id,
        postTitle: post.title,
        removed: true
      }
    });
    
    return NextResponse.json({ 
      favorited: false,
      favoriteCount: post.stats.favorites
    });
  } else {
    // Favorit hinzufügen
    if (hasFavorited) {
      return NextResponse.json({ 
        favorited: true,
        favoriteCount: post.stats.favorites,
        message: 'Post bereits in Favoriten'
      });
    }
    
    // Favorit hinzufügen
    user.favorites.push(post._id);
    
    // Zähler erhöhen
    post.stats.favorites = (post.stats.favorites || 0) + 1;
    
    await user.save();
    await post.save();
    
    // ModLog erstellen
    await ModLog.create({
      moderator: userId,
      action: 'favorite',
      targetType: 'post',
      targetId: post._id,
      reason: 'User favorited post',
      metadata: {
        postId: post._id,
        postTitle: post.title
      }
    });
    
    // Benachrichtigung senden
    try {
      await NotificationService.notifyPostFavorite(postMongoId, userId);
    } catch (notifyError) {
      console.error('Error sending favorite notification:', notifyError);
    }
    
    return NextResponse.json({ 
      favorited: true,
      favoriteCount: post.stats.favorites
    });
  }
} 