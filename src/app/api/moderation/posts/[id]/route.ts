import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Post from '@/models/Post';
import User from '@/models/User';
import ModLog from '@/models/ModLog';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/mongodb';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Params korrekt awaiten
    const resolvedParams = await params;
    const postId = resolvedParams.id;
    
    // Body-Daten abrufen, falls vorhanden
    let reason = 'Moderation action';
    try {
      const body = await request.json();
      reason = body.reason || reason;
    } catch (e) {
      // Ignorieren, falls Body leer ist
    }
    
    await dbConnect();
    
    // Post finden und l?schen (MongoDB ID oder Numeric ID)
    let post;
    
    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findById(postId);
    }
    
    if (!post) {
      const numericId = parseInt(postId, 10);
      if (!isNaN(numericId)) {
        post = await Post.findOne({ id: numericId });
      }
    }
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Finde den Benutzer, dem der Post geh?rt und bereinige die uploads-Liste
    const userId = post.author;
    if (userId) {
      // Aktualisiere den User-Datensatz, indem der Post aus dem uploads-Array entfernt wird
      await User.updateOne(
        { _id: userId },
        { $pull: { uploads: post._id } }
      );
      console.log(`Post ${post._id} removed from user ${userId} uploads array`);
    }
    
    // L?sche die zugeh?rigen Medien-Dateien
    await deleteMediaFiles(post);
    
    // ModLog erstellen, bevor wir l?schen
    await ModLog.create({
      moderator: session.user.id,
      action: 'delete',
      targetType: 'post',
      targetId: post._id,
      reason: reason
    });
    
    // Post l?schen
    await Post.findByIdAndDelete(post._id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in moderation delete:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Hilfsfunktion zum L?schen der Medien-Dateien
async function deleteMediaFiles(post) {
  try {
    // Dateipfade aus dem Post-Objekt extrahieren
    const filesToDelete = [];
    
    // Alle m?glichen URL-Felder pr?fen
    const urlFields = ['thumbnailUrl', 'fileUrl', 'imageUrl', 'videoUrl', 'mediaUrl'];
    
    // Sammle alle vorhandenen URLs
    for (const field of urlFields) {
      if (post[field] && typeof post[field] === 'string') {
        // Direktes Debugging
        console.log(`Found media URL in field ${field}: ${post[field]}`);
        
        // Nur lokale Dateien l?schen (die mit / beginnen)
        if (post[field].startsWith('/')) {
          const filePath = path.join(process.cwd(), 'public', post[field]);
          filesToDelete.push(filePath);
        }
      }
    }
    
    // Wenn es keine zu l?schenden Dateien gibt, beenden
    if (filesToDelete.length === 0) {
      console.log(`No local files found to delete for post ${post._id}`);
      // Zum Debugging: Zeige alle Felder des Posts
      console.log('Post fields:', Object.keys(post.toObject ? post.toObject() : post));
      return;
    }
    
    console.log(`Attempting to delete ${filesToDelete.length} media files for post ${post._id}:`, filesToDelete);
    
    // L?sche jede Datei
    for (const filePath of filesToDelete) {
      try {
        await fs.access(filePath); // Pr?fen, ob die Datei existiert
        await fs.unlink(filePath); // Datei l?schen
        console.log(`Deleted file: ${filePath}`);
      } catch (fileError) {
        // Wenn die Datei nicht existiert oder nicht gel?scht werden kann, loggen aber weitermachen
        console.warn(`Could not delete file ${filePath}:`, fileError.message);
      }
    }
  } catch (error) {
    console.error('Error deleting media files:', error);
    // Wir werfen den Fehler nicht, damit der Rest des L?schvorgangs fortgesetzt wird
  }
} 