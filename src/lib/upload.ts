import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import Post from '@/models/Post';
import Tag from '@/models/Tag';
import { Types } from 'mongoose';
import crypto from 'crypto';
import User from '@/models/User';

// Definiere die Upload-Ordner
const UPLOAD_DIRS = {
  temp: join(process.cwd(), 'public', 'uploads', 'temp'),
  original: join(process.cwd(), 'public', 'uploads', 'original'),
  thumbnails: join(process.cwd(), 'public', 'uploads', 'thumbnails'),
} as const;

// Generiere eine eindeutige Bild-ID
function generateImageId(): string {
  const prefix = Math.floor(1000 + Math.random() * 9000); // 4-stellige Zahl
  const randomHex = crypto.randomBytes(8).toString('hex'); // 16 Zeichen Hex
  return `${prefix}_${randomHex}`;
}

// Initialisiere die Upload-Ordner
export async function initializeUploadDirectories() {
  try {
    await Promise.all(
      Object.values(UPLOAD_DIRS).map(dir => mkdir(dir, { recursive: true }))
    );
    console.log('Upload directories created successfully');
  } catch (error) {
    console.error('Failed to create upload directories:', error);
  }
}

interface ProcessedUpload {
  id: number;
  filename: string;
  originalPath: string;
  thumbnailPath: string;
  contentType: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  tags: string[];
}

export async function processUpload(
  file: Buffer, 
  originalFilename: string, 
  contentType: string,
  userId?: string,
  contentRating: 'safe' | 'sketchy' | 'unsafe' = 'safe',
  tags: string[] = []
): Promise<ProcessedUpload> {
  try {
    // Verarbeite das Bild mit Sharp
    const image = sharp(file);
    const metadata = await image.metadata();

    // Process tags
    const processedTags: string[] = [];
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Find or create the tag
        const tag = await Tag.findOrCreate(tagName);
        
        // Increment post count for the tag
        await Tag.findByIdAndUpdate(tag._id, {
          $inc: { postsCount: 1, newPostsToday: 1, newPostsThisWeek: 1 }
        });
        
        processedTags.push(tag.name);
      }
    }

    // Erstelle einen neuen Post in der Datenbank
    const post = new Post({
      title: originalFilename,
      author: userId || null, // Wenn kein userId, dann null für anonymen Upload
      contentRating: contentRating, // Setze das contentRating
      tags: processedTags, // Setze die Tags
      meta: {
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: file.length,
        format: metadata.format || 'jpeg',
        source: null
      }
    });
    
    // Speichere den Post, um die automatisch generierte ID zu erhalten
    await post.save();

    // Wenn ein User vorhanden ist, füge den Post zu seinen Uploads hinzu
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: { uploads: post._id }
      });
    }
    
    // Generiere eine eindeutige Bild-ID
    const imageId = generateImageId();
    const filename = `${imageId}.jpg`; // Wir speichern alles als JPG
    const thumbnailFilename = `thumb_${filename}`; // Thumbnail mit Präfix

    // Speichere das Originalbild
    await writeFile(join(UPLOAD_DIRS.original, filename), file);

    // Erstelle und speichere das Thumbnail
    const thumbnail = await image
      .resize(400, 400, {
        fit: 'cover',
        position: 'centre'
      })
      .toBuffer();

    await writeFile(join(UPLOAD_DIRS.thumbnails, thumbnailFilename), thumbnail);

    // Aktualisiere den Post mit den Bildpfaden
    post.imageUrl = `/uploads/original/${filename}`;
    post.thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
    await post.save();

    return {
      id: post.id,
      filename,
      originalPath: post.imageUrl,
      thumbnailPath: post.thumbnailUrl,
      contentType,
      size: file.length,
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0
      },
      tags: processedTags
    };
  } catch (error) {
    console.error('Error processing upload:', error);
    throw new Error('Failed to process upload');
  }
}

// Function to download an image from URL and create a temp file
export async function downloadImageFromUrl(url: string): Promise<{
  file: Buffer;
  filename: string;
  contentType: string;
  tempFilePath: string;
  previewUrl: string;
  dimensions: { width: number; height: number };
}> {
  try {
    // Extract filename from URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    let filename = pathSegments[pathSegments.length - 1];
    
    // If filename doesn't have an extension, add .jpg as default
    if (!filename.includes('.')) {
      filename += '.jpg';
    }
    
    // Download the image
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate a thumbnail and get dimensions
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Create a temporary thumbnail
    // Generiere eine eindeutige ID für die temporäre Datei
    const tempId = generateImageId();
    // Entferne ungültige Dateizeichen aus dem Dateinamen
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_'); 
    const tempFilename = `temp_${tempId}_${safeFilename}`;
    const tempFilePath = join(UPLOAD_DIRS.temp, tempFilename);
    
    // Erstelle einen Web-Pfad (URL) für die temporäre Datei
    const publicTempUrl = `/uploads/temp/${tempFilename}`;
    
    console.log('Saving temporary file to:', tempFilePath);
    console.log('Public URL will be:', publicTempUrl);
    
    // Stelle sicher, dass das temp-Verzeichnis existiert
    try {
      await mkdir(UPLOAD_DIRS.temp, { recursive: true });
    } catch (err) {
      console.error('Error creating temp directory:', err);
    }
    
    // Save the temporary thumbnail
    const thumbnail = await image
      .resize(400, 400, {
        fit: 'cover',
        position: 'centre'
      })
      .toBuffer();
    
    // Speichere die temporäre Datei
    await writeFile(tempFilePath, thumbnail);
    
    return {
      file: buffer,
      filename: safeFilename,
      contentType,
      tempFilePath, // Lokaler Dateipfad (für Backend)
      previewUrl: publicTempUrl, // URL-Pfad (für Frontend)
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0
      }
    };
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Failed to download image from URL');
  }
} 