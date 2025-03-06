import { withAuth, createErrorResponse } from '@/lib/api-utils';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';
import { join } from 'path';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';

// Definiere den Avatar-Speicherort
const AVATAR_DIR = join(process.cwd(), 'public', 'uploads', 'avatars');

// Stellt sicher, dass das Avatar-Verzeichnis existiert
async function ensureAvatarDir() {
  try {
    await mkdir(AVATAR_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating avatar directory:', error);
    throw new Error('Failed to create avatar directory');
  }
}

// Generiere einen eindeutigen Dateinamen für den Avatar
function generateAvatarFilename(userId: string): string {
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `avatar_${userId}_${randomBytes}.jpg`;
}

// POST-Handler für den Avatar-Upload
export async function POST(req: Request) {
  return withAuth(async (session: { user: { id: string } }) => {
    try {
      await dbConnect();
      await ensureAvatarDir();
      
      // Finde den aktuellen Benutzer
      const user = await User.findById(session.user.id);
      if (!user) {
        return createErrorResponse('Benutzer nicht gefunden', 404);
      }
      
      // Verarbeite die FormData
      const formData = await req.formData();
      const avatarFile = formData.get('avatar');
      
      if (!avatarFile || !(avatarFile instanceof File)) {
        return createErrorResponse('Keine gültige Bilddatei erhalten', 400);
      }
      
      // Überprüfe den Dateityp
      if (!avatarFile.type.startsWith('image/')) {
        return createErrorResponse('Nur Bilddateien sind erlaubt', 400);
      }
      
      // Größenbeschränkung (2MB)
      if (avatarFile.size > 2 * 1024 * 1024) {
        return createErrorResponse('Maximale Dateigröße: 2MB', 400);
      }
      
      // Konvertiere die Datei in einen Buffer
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      
      // Generiere einen eindeutigen Dateinamen
      const filename = generateAvatarFilename(user._id.toString());
      const avatarPath = join(AVATAR_DIR, filename);
      
      // Verarbeite und speichere das Bild mit Sharp
      await sharp(buffer)
        .resize(128, 128, { fit: 'cover' }) // Beschneide auf 128x128px
        .jpeg({ quality: 85 }) // Konvertiere zu JPEG mit guter Qualität
        .toFile(avatarPath);
      
      // Wenn der Benutzer bereits einen Avatar hat, lösche ihn
      if (user.avatar) {
        const oldAvatarPath = join(process.cwd(), 'public', user.avatar);
        if (existsSync(oldAvatarPath)) {
          try {
            await unlink(oldAvatarPath);
          } catch (error) {
            console.error('Error deleting old avatar:', error);
          }
        }
      }
      
      // Aktualisiere den Benutzer mit dem neuen Avatar-Pfad
      const avatarUrl = `/uploads/avatars/${filename}`;
      user.avatar = avatarUrl;
      await user.save();
      
      return NextResponse.json({ 
        success: true, 
        avatarUrl 
      });
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return createErrorResponse('Fehler beim Hochladen des Avatars', 500);
    }
  });
}

// DELETE-Handler zum Entfernen des Avatars
export async function DELETE() {
  return withAuth(async (session: { user: { id: string } }) => {
    try {
      await dbConnect();
      
      // Finde den aktuellen Benutzer
      const user = await User.findById(session.user.id);
      if (!user) {
        return createErrorResponse('Benutzer nicht gefunden', 404);
      }
      
      // Wenn der Benutzer einen Avatar hat, lösche ihn
      if (user.avatar) {
        const avatarPath = join(process.cwd(), 'public', user.avatar);
        if (existsSync(avatarPath)) {
          try {
            await unlink(avatarPath);
          } catch (error) {
            console.error('Error deleting avatar:', error);
          }
        }
        
        // Setze das Avatar-Feld zurück
        user.avatar = null;
        await user.save();
      }
      
      return NextResponse.json({ success: true });
      
    } catch (error) {
      console.error('Error removing avatar:', error);
      return createErrorResponse('Fehler beim Entfernen des Avatars', 500);
    }
  });
} 