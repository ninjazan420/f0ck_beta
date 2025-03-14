import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import { NotificationService } from '@/lib/services/notificationService';
import mongoose from 'mongoose';
import ModLog from '@/models/ModLog';
import { addNotification } from '@/lib/services/notificationService';
import { createModLog } from '@/lib/services/moderationService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = resolvedParams.id;
    
    await dbConnect();
    
    // Post finden
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
    
    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }
    
    // Benutzer finden
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }
    
    // Arrays initialisieren, wenn nötig
    if (!user.dislikes) user.dislikes = [];
    if (!post.dislikedBy) post.dislikedBy = [];
    if (!post.stats) post.stats = { likes: 0, views: 0, comments: 0, favorites: 0, dislikes: 0 };
    if (!post.stats.dislikes) post.stats.dislikes = 0;
    
    const postMongoId = post._id.toString();
    
    // Prüfen, ob der Benutzer den Post bereits disliked hat
    const hasDisliked = user.dislikes && user.dislikes.some(id => id.toString() === postMongoId);
    
    if (hasDisliked) {
      return NextResponse.json({
        disliked: true,
        dislikeCount: post.stats.dislikes,
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
          const userLikeIndex = post.likedBy.indexOf(session.user.id);
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
    post.dislikedBy.push(session.user.id);
    post.stats.dislikes += 1;
    
    // Änderungen speichern
    await user.save();
    await post.save();
    
    // ModLog-Eintrag erstellen
    await ModLog.create({
      moderator: session.user.id,
      action: 'dislike',
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
      dislikeCount: post.stats.dislikes
    });
  } catch (error) {
    console.error('Error disliking post:', error);
    return NextResponse.json(
      { error: 'Fehler beim Disliken des Beitrags' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const resolvedParams = await params;
    const postId = resolvedParams.id;
    
    await dbConnect();
    
    // Post finden
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
    
    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }
    
    // Benutzer finden
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }
    
    // Arrays initialisieren, wenn nötig
    if (!user.dislikes) user.dislikes = [];
    if (!post.stats) post.stats = { likes: 0, views: 0, comments: 0, favorites: 0, dislikes: 0 };
    if (!post.stats.dislikes) post.stats.dislikes = 0;
    
    const postMongoId = post._id.toString();
    
    // Prüfen, ob der Benutzer den Post disliked hat
    const dislikeIndex = user.dislikes ? user.dislikes.findIndex(id => id.toString() === postMongoId) : -1;
    const hasDisliked = dislikeIndex !== -1;
    
    if (!hasDisliked) {
      return NextResponse.json({
        disliked: false,
        dislikeCount: post.stats.dislikes,
        message: 'Post wurde nicht disliked'
      });
    }
    
    // Dislike entfernen
    user.dislikes.splice(dislikeIndex, 1);
    
    // Aus dem Post entfernen
    if (post.dislikedBy) {
      const userIndex = post.dislikedBy.indexOf(session.user.id);
      if (userIndex !== -1) {
        post.dislikedBy.splice(userIndex, 1);
      }
    }
    
    // Dislike-Zähler reduzieren
    post.stats.dislikes = Math.max(0, post.stats.dislikes - 1);
    
    // Änderungen speichern
    await user.save();
    await post.save();
    
    // ModLog-Eintrag erstellen
    await ModLog.create({
      moderator: session.user.id,
      action: 'dislike',
      targetType: 'post',
      targetId: post._id,
      reason: 'User disliked post',
      metadata: {
        postId: post._id,
        postTitle: post.title
      }
    });
    
    return NextResponse.json({
      disliked: false,
      dislikeCount: post.stats.dislikes
    });
  } catch (error) {
    console.error('Error removing dislike:', error);
    return NextResponse.json(
      { error: 'Fehler beim Entfernen des Dislikes' },
      { status: 500 }
    );
  }
} 