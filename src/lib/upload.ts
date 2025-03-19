import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import Post from '@/models/Post';
import Tag from '@/models/Tag';
import { Types } from 'mongoose';
import crypto from 'crypto';
import User from '@/models/User';
import fs from 'fs/promises';
import { ApplicationError } from '@/lib/error-handling';

// Lokale Definition von ContentRating
export type ContentRating = 'safe' | 'sketchy' | 'unsafe';
export const DEFAULT_CONTENT_RATING: ContentRating = 'safe';
export const CONTENT_RATINGS: ContentRating[] = ['safe', 'sketchy', 'unsafe'];

// Erweitere UPLOAD_DIRS um baseDir
const UPLOAD_DIRS = {
  base: join(process.cwd(), 'public', 'uploads'),
  temp: join(process.cwd(), 'public', 'uploads', 'temp'),
  original: join(process.cwd(), 'public', 'uploads', 'original'),
  thumbnails: join(process.cwd(), 'public', 'uploads', 'thumbnails'),
} as const;

// Generiere eine eindeutige Bild-ID
function generateImageId(): string {
  try {
    const prefix = Math.floor(1000 + Math.random() * 9000);
    const randomHex = crypto.randomBytes(8).toString('hex');
    return `${prefix}_${randomHex}`;
  } catch (error) {
    console.error('Error generating image ID:', error);
    // Fallback mit timestamp und Math.random
    return `${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

// Neue vereinheitlichte Funktion:
export async function initializeUploadDirectories() {
  try {
    console.log('Initializing upload directories...');
    
    // Erstelle alle nötigen Upload-Verzeichnisse
    for (const dir of Object.values(UPLOAD_DIRS)) {
      try {
        console.log(`Creating directory: ${dir}`);
        await mkdir(dir, { recursive: true });
        
        // Überprüfe Schreibrechte mit einer Testdatei
        const testFile = join(dir, '.test-permissions');
        await writeFile(testFile, 'test');
        await fs.unlink(testFile);
        console.log(`✅ Directory ${dir} is writable`);
      } catch (error) {
        console.error(`❌ Failed to initialize directory ${dir}:`, error);
        throw new Error(`Failed to initialize directory ${dir}: ${error.message}`);
      }
    }
    
    console.log('✅ Upload directories initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing upload directories:', error);
    throw error;
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
  contentRating: ContentRating;
  uploadDate: Date;
  userId?: string;
}

// Neue Validierungsfunktion
function validateUploadParams(
  file: Buffer,
  originalFilename: string,
  contentType: string,
  contentRating: ContentRating,
  tags: string[]
) {
  if (!file || file.length === 0) {
    throw new ApplicationError('Empty file buffer', 'ValidationError', 400);
  }

  if (!originalFilename || originalFilename.trim() === '') {
    throw new ApplicationError('Invalid filename', 'ValidationError', 400);
  }

  const validContentTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validContentTypes.includes(contentType)) {
    throw new ApplicationError('Invalid content type', 'ValidationError', 400);
  }

  if (!CONTENT_RATINGS.includes(contentRating)) {
    throw new ApplicationError(
      `Invalid content rating. Must be one of: ${CONTENT_RATINGS.join(', ')}`,
      'ValidationError',
      400
    );
  }

  if (tags.length > 30) {
    throw new ApplicationError('Too many tags (max 30)', 'ValidationError', 400);
  }
}

export async function processUpload(
  file: Buffer,
  filename: string,
  contentType: string,
  userId: string | null,
  contentRating: ContentRating = DEFAULT_CONTENT_RATING,
  tags: string[] = []
): Promise<ProcessedUpload> {
  try {
    // Validiere Parameter
    validateUploadParams(file, filename, contentType, contentRating, tags);
    
    // Verarbeite das Bild direkt mit Sharp
    const image = sharp(file);
    const metadata = await image.metadata();

    // Verbesserte Tag-Verarbeitung
    const processedTags: string[] = [];
    if (tags && tags.length > 0) {
      console.log('🏷️ Processing tags for upload:', tags);
      
      for (const tagName of tags) {
        try {
          if (!tagName || typeof tagName !== 'string' || tagName.trim() === '') {
            console.log('⚠️ Skipping empty tag');
            continue;
          }
          
          console.log('🔄 Processing tag:', tagName);
          
          // Find or create the tag - userId übergeben!
          const tag = await Tag.findOrCreate(tagName, userId);
          console.log('✅ Tag result:', tag);
          
          if (!tag) {
            console.error('❌ Failed to create tag:', tagName);
            continue;
          }
          
          // Hier ist der kritische Fix: Tag-Name zur Liste hinzufügen
          processedTags.push(tag.name);
          
          // Increment post count for the tag
          await Tag.findByIdAndUpdate(tag._id, {
            $inc: { postsCount: 1, newPostsToday: 1, newPostsThisWeek: 1 }
          });
        } catch (error) {
          console.error('❌ Error processing tag:', tagName, error);
        }
      }
    }
    console.log('📋 Final processed tags:', processedTags);

    // Erstelle einen neuen Post mit den verarbeiteten Tags
    const post = new Post({
      title: filename,
      author: userId || null,
      contentRating: contentRating,
      tags: processedTags, // Diese Liste sollte jetzt korrekt gefüllt sein
      meta: {
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: file.length,
        format: metadata.format || 'jpeg',
        source: null
      }
    });
    
    // Debug-Ausgabe des Post-Objekts vor dem Speichern
    console.log('📝 Creating post with tags:', post.tags);
    
    // Speichere den Post
    await post.save();
    console.log('💾 Post saved with ID:', post._id, 'and numeric ID:', post.id);

    // Wenn ein User vorhanden ist, füge den Post zu seinen Uploads hinzu
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: { uploads: post._id }
      });
    }
    
    // Generiere eine eindeutige Bild-ID
    const imageId = generateImageId();
    const finalFilename = `${imageId}.jpg`; // Wir speichern alles als JPG
    const thumbnailFilename = `thumb_${finalFilename}`; // Thumbnail mit Präfix

    // Speichere das Originalbild mit expliziten Berechtigungen
    const originalPath = join(UPLOAD_DIRS.original, finalFilename);
    await writeFile(originalPath, file, { mode: 0o644 });
    console.log(`Original image saved to: ${originalPath}`);

    // Erstelle und speichere das Thumbnail mit expliziten Berechtigungen
    const thumbnailPath = join(UPLOAD_DIRS.thumbnails, thumbnailFilename);
    try {
      console.log(`Generating thumbnail for ${thumbnailPath}...`);
      await image
        .resize(400, 400, {
          fit: 'cover',
          position: 'centre'
        })
        .toFile(thumbnailPath);
      console.log(`Thumbnail successfully saved to ${thumbnailPath}`);

      // Überprüfe, ob die Datei wirklich existiert
      const exists = await fs.access(thumbnailPath).then(() => true).catch(() => false);
      if (!exists) {
        console.error(`Thumbnail file does not exist after creation at: ${thumbnailPath}`);
      }
    } catch (thumbError) {
      console.error('Error generating thumbnail:', thumbError);
      // Versuche einen alternativen Ansatz
      try {
        const thumbBuffer = await image
          .resize(400, 400, {
            fit: 'cover',
            position: 'centre'
          })
          .toBuffer();
        await fs.writeFile(thumbnailPath, thumbBuffer);
        console.log(`Thumbnail saved using alternative method to ${thumbnailPath}`);
      } catch (altError) {
        console.error('Alternative thumbnail creation also failed:', altError);
      }
    }

    // Aktualisiere den Post mit den Bildpfaden
    post.imageUrl = `/uploads/original/${finalFilename}`;
    post.thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
    await post.save();
    console.log(`Saved image paths to database: ${post.imageUrl}, ${post.thumbnailUrl}`);

    // Stelle sicher, dass contentRating korrekt ist, mit Fallback zur DEFAULT_CONTENT_RATING
    const validContentRating: ContentRating = 
      ['safe', 'sketchy', 'unsafe'].includes(contentRating) 
        ? contentRating as ContentRating 
        : DEFAULT_CONTENT_RATING;

    return {
      id: post.id,
      filename: finalFilename,
      originalPath: post.imageUrl,
      thumbnailPath: post.thumbnailUrl,
      contentType,
      size: file.length,
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0
      },
      tags: processedTags,
      contentRating: validContentRating,
      uploadDate: new Date(),
      userId
    };
  } catch (error) {
    throw new ApplicationError(
      `Failed to process upload: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UploadError',
      500,
      error
    );
  }
}

// Neue Hilfsfunktion für Cleanup
async function cleanupTempFiles(olderThan = 24 * 60 * 60 * 1000) { // 24h
  try {
    const tempDir = UPLOAD_DIRS.temp;
    const files = await fs.readdir(tempDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtimeMs > olderThan) {
        await fs.unlink(filePath).catch(console.error);
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
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
    
    // Cleanup alte temporäre Dateien
    await cleanupTempFiles().catch(console.error);
    
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
    throw new ApplicationError(
      'Failed to download image from URL',
      'NetworkError',
      500,
      error
    );
  }
}