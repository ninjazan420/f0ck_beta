import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import Post from '@/models/Post';
import Tag from '@/models/Tag';
import { Types } from 'mongoose';
import crypto from 'crypto';
import User from '@/models/User';
import fs from 'fs/promises';

// Erweitere UPLOAD_DIRS um baseDir
const UPLOAD_DIRS = {
  base: join(process.cwd(), 'public', 'uploads'),
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

// Erweitere die initializeUploadDirectories Funktion um mehr Fehlerbehandlung
export async function initializeUploadDirectories() {
  try {
    console.log('Initializing upload directories...');
    console.log('Base directory:', UPLOAD_DIRS.base);
    
    // Erstelle alle nötigen Upload-Verzeichnisse
    for (const dir of Object.values(UPLOAD_DIRS)) {
      try {
        console.log(`Creating directory: ${dir}`);
        await mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
        // Werfe den Fehler nicht, damit andere Verzeichnisse trotzdem erstellt werden können
      }
    }
    
    // Überprüfe die Berechtigungen
    for (const dir of Object.values(UPLOAD_DIRS)) {
      try {
        // Versuche, eine Testdatei zu schreiben
        const testFile = join(dir, '.test-permissions');
        await writeFile(testFile, 'test');
        await fs.unlink(testFile).catch(console.error);
        console.log(`Directory ${dir} is writable`);
      } catch (error) {
        console.error(`Directory ${dir} is NOT writable:`, error);
      }
    }
    
    console.log('Upload directories initialized successfully');
  } catch (error) {
    console.error('Error initializing upload directories:', error);
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
    // Stelle sicher, dass die Verzeichnisse existieren
    await initializeUploadDirectories();

    // Zusätzlicher Debug-Code für den Thumbnail-Ordner
    console.log('Checking thumbnail directory...');
    try {
      const thumbDirStat = await fs.stat(UPLOAD_DIRS.thumbnails);
      console.log('Thumbnail directory exists:', UPLOAD_DIRS.thumbnails);
      console.log('Directory permissions:', thumbDirStat.mode.toString(8));
    } catch (error) {
      console.error('Thumbnail directory check failed:', error);
      // Versuche erneut, das Verzeichnis zu erstellen
      try {
        await mkdir(UPLOAD_DIRS.thumbnails, { recursive: true, mode: 0o755 });
        console.log('Thumbnail directory created successfully');
      } catch (mkdirError) {
        console.error('Failed to create thumbnail directory:', mkdirError);
      }
    }

    // Verarbeite das Bild mit Sharp
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
          
          // Find or create the tag
          const tag = await Tag.findOrCreate(tagName);
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
      title: originalFilename,
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
    console.log('💾 Post saved with ID:', post._id, 'and tags:', post.tags);

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

    // Speichere das Originalbild mit expliziten Berechtigungen
    const originalPath = join(UPLOAD_DIRS.original, filename);
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
    post.imageUrl = `/uploads/original/${filename}`;
    post.thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
    await post.save();
    console.log(`Saved image paths to database: ${post.imageUrl}, ${post.thumbnailUrl}`);

    // Nach erfolgreicher Bildverarbeitung in processUpload-Funktion
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        await fs.unlink(tempFilePath);
        console.log(`Temporary file ${tempFilePath} deleted`);
      } catch (err) {
        console.warn(`Failed to delete temporary file ${tempFilePath}:`, err);
        // Nicht kritisch, daher den Prozess nicht abbrechen
      }
    }

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
    console.error('Error processing upload:', error, error.stack);
    throw new Error(`Failed to process upload: ${error.message}`);
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