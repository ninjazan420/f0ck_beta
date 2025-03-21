/**
 * Funktion zum Löschen eines Posts und Bereinigen von Benutzerreferenzen
 */
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import Comment from '@/models/Comment';
import ModLog from '@/models/ModLog';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

export async function deletePostAndCleanupReferences(postId: string, reason: string = 'Post deletion', moderatorId?: string) {
  try {
    await dbConnect();
    
    // Finde den Post mit verschiedenen ID-Typen
    let post;
    
    // Versuche zuerst als MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findById(postId);
    }
    
    // Wenn nicht gefunden, versuche als numerische ID
    if (!post) {
      const numericId = parseInt(postId, 10);
      if (!isNaN(numericId)) {
        post = await Post.findOne({ id: numericId });
      }
    }
    
    if (!post) {
      return { success: false, error: 'Post not found' };
    }
    
    // Finde den Benutzer, dem der Post gehört
    const userId = post.author;
    if (userId) {
      // Aktualisiere den User-Datensatz, indem der Post aus dem uploads-Array entfernt wird
      await User.updateOne(
        { _id: userId },
        { $pull: { uploads: post._id } }
      );
      console.log(`Post ${post._id} removed from user ${userId} uploads array`);
    }
    
    // Lösche zugehörige Medien-Dateien
    await deleteMediaFiles(post);
    
    // Lösche zugehörige Kommentare
    await Comment.deleteMany({ post: post._id });
    
    // Erstelle einen ModLog-Eintrag
    await ModLog.create({
      moderator: moderatorId || 'system',
      action: 'delete',
      targetType: 'post',
      targetId: post._id,
      reason: reason
    });
    
    // Lösche den Post
    await Post.findByIdAndDelete(post._id);
    
    return { success: true };
  } catch (error) {
    console.error('Error in delete post cleanup:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

// Funktion zum Löschen der Medien-Dateien
async function deleteMediaFiles(post) {
  try {
    // Dateipfade aus dem Post-Objekt extrahieren
    const filesToDelete = [];
    
    // Alle möglichen URL-Felder prüfen
    const urlFields = ['thumbnailUrl', 'fileUrl', 'imageUrl', 'videoUrl', 'mediaUrl'];
    
    // Sammle alle vorhandenen URLs
    for (const field of urlFields) {
      if (post[field] && typeof post[field] === 'string') {
        // Direktes Debugging
        console.log(`Found media URL in field ${field}: ${post[field]}`);
        
        // Nur lokale Dateien löschen (die mit / beginnen)
        if (post[field].startsWith('/')) {
          const filePath = path.join(process.cwd(), 'public', post[field]);
          filesToDelete.push(filePath);
        }
      }
    }
    
    // Wenn es keine zu löschenden Dateien gibt, beenden
    if (filesToDelete.length === 0) {
      console.log(`No local files found to delete for post ${post._id}`);
      // Zum Debugging: Zeige alle Felder des Posts
      console.log('Post fields:', Object.keys(post.toObject ? post.toObject() : post));
      return;
    }
    
    console.log(`Attempting to delete ${filesToDelete.length} media files for post ${post._id}:`, filesToDelete);
    
    // Lösche jede Datei
    for (const filePath of filesToDelete) {
      try {
        await fs.access(filePath); // Prüfen, ob die Datei existiert
        await fs.unlink(filePath); // Datei löschen
        console.log(`Deleted file: ${filePath}`);
      } catch (fileError) {
        // Wenn die Datei nicht existiert oder nicht gelöscht werden kann, loggen aber weitermachen
        console.warn(`Could not delete file ${filePath}:`, fileError.message);
      }
    }
  } catch (error) {
    console.error('Error deleting media files:', error);
    // Wir werfen den Fehler nicht, damit der Rest des Löschvorgangs fortgesetzt wird
  }
} 