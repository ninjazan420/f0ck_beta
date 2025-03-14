import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import { NotificationService } from '@/lib/services/notificationService';
import mongoose from 'mongoose';
import ModLog from '@/models/ModLog';

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
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }
    
    // Benutzer in der DB nachschlagen
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }
    
    // Initialisiere likes-Array, falls nicht vorhanden
    if (!user.likes) {
      user.likes = [];
    }
    
    // MongoDB _id als String für den Vergleich
    const postMongoId = post._id.toString();
    
    // Prüfe, ob der Post bereits geliked wurde
    const hasLiked = user.likes.some(id => id.toString() === postMongoId);
    
    if (hasLiked) {
      // Der Post wurde bereits geliked, verweigere weitere Likes
      return NextResponse.json({ 
        liked: true, 
        likeCount: post.stats.likes,
        message: 'Post bereits geliked'
      });
    }
    
    // Initialisiere stats und likedBy für den Post, falls nicht vorhanden
    if (!post.stats) {
      post.stats = { likes: 0, views: 0, comments: 0, favorites: 0 };
    }
    
    if (!post.likedBy) {
      post.likedBy = [];
    }
    
    // Like zum Post und zum Benutzer hinzufügen
    post.likedBy.push(session.user.id);
    post.stats.likes += 1;
    
    // Speichere Like auch beim User
    user.likes.push(post._id);
    await user.save();
    
    // Benachrichtigung an den Autor senden, wenn es nicht sein eigener Post ist
    if (post.author && post.author.toString() !== session.user.id) {
      await NotificationService.notifyPostLike(post._id.toString(), session.user.id);
    }
    
    // ModLog eintragen - direkte Implementierung statt Service-Aufruf
    await ModLog.create({
      moderator: session.user.id,
      action: 'like',
      targetType: 'post',
      targetId: post._id,
      reason: 'User liked post',
      metadata: {
        postId: post._id,
        postTitle: post.title
      }
    });
    
    await post.save();
    
    return NextResponse.json({ 
      liked: true, 
      likeCount: post.stats.likes 
    });
    
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: 'Fehler beim Liken des Beitrags' },
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
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }
    
    // Benutzer aus der DB abrufen
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }
    
    // Initialisiere likes-Array, falls nicht vorhanden
    if (!user.likes) {
      user.likes = [];
    }
    
    // MongoDB _id als String für den Vergleich
    const postMongoId = post._id.toString();
    
    // Prüfe, ob der Post geliked wurde
    const likeIndex = user.likes.findIndex(id => id.toString() === postMongoId);
    const hasLiked = likeIndex !== -1;
    
    if (!hasLiked) {
      // Der Post wurde nicht geliked, es gibt nichts zu entfernen
      return NextResponse.json({ 
        liked: false, 
        likeCount: post.stats?.likes || 0,
        message: 'Post wurde nicht geliked'
      });
    }
    
    // Like vom User entfernen
    user.likes.splice(likeIndex, 1);
    await user.save();
    
    // Auch aus dem Post entfernen, wenn vorhanden
    if (post.likedBy) {
      const userIndex = post.likedBy.indexOf(session.user.id);
      if (userIndex !== -1) {
        post.likedBy.splice(userIndex, 1);
      }
    }
    
    // Like-Zähler aktualisieren
    if (post.stats) {
      post.stats.likes = Math.max(0, (post.stats.likes || 0) - 1);
    }
    
    await post.save();
    
    // ModLog eintragen mit korrektem action Enum
    await ModLog.create({
      moderator: session.user.id,
      action: 'like', // Korrektur von 'unlike' zu 'like'
      targetType: 'post',
      targetId: post._id,
      reason: 'User removed like from post',
      metadata: {
        postId: post._id,
        postTitle: post.title,
        removed: true // Flag für Entfernung
      }
    });
    
    return NextResponse.json({ 
      liked: false, 
      likeCount: post.stats.likes 
    });
    
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json(
      { error: 'Fehler beim Entfernen des Likes' },
      { status: 500 }
    );
  }
} 