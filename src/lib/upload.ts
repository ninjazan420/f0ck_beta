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
import { spawn } from 'child_process';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { getVideoMetadata } from '@/lib/video-utils';

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

// Füge Konstanten für Content-Typen hinzu
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const VALID_VIDEO_TYPES = ['video/webm', 'video/mp4', 'video/quicktime'];
const VALID_CONTENT_TYPES = [...VALID_IMAGE_TYPES, ...VALID_VIDEO_TYPES];

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
  isVideo?: boolean;
}

// Funktion zum Erstellen von Video-Thumbnails mit ffmpeg
async function generateVideoThumbnail(videoPath: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Extrahiere ein Frame bei 1 Sekunde als Thumbnail
    const ffmpeg = spawn('ffmpeg', [
      '-i', videoPath,
      '-ss', '00:00:01.000',
      '-vframes', '1',
      '-vf', 'scale=400:400:force_original_aspect_ratio=decrease,pad=400:400:(ow-iw)/2:(oh-ih)/2',
      '-y',
      outputPath
    ]);

    let errorOutput = '';

    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Video thumbnail generated successfully at ${outputPath}`);
        resolve(true);
      } else {
        console.error(`❌ Failed to generate video thumbnail: ${errorOutput}`);
        reject(new Error(`ffmpeg exited with code ${code}: ${errorOutput}`));
      }
    });
  });
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

  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    throw new ApplicationError(`Invalid content type. Supported types: ${VALID_CONTENT_TYPES.join(', ')}`, 'ValidationError', 400);
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

// Aktualisiere processUpload Funktion, um Videos zu unterstützen
export async function processUpload(
  file: Buffer,
  filename: string,
  contentType: string,
  userId: string | null,
  contentRating: ContentRating = DEFAULT_CONTENT_RATING,
  tags: string[] = []
): Promise<ProcessedUpload> {
  try {
    // Initialisiere existingPostId Variable
    const existingPostId = null;
    
    // Stelle sicher, dass contentRating korrekt ist (DIESE ZEILE MUSS FRÜHER DEFINIERT WERDEN)
    const validContentRating: ContentRating = 
      ['safe', 'sketchy', 'unsafe'].includes(contentRating) 
        ? contentRating as ContentRating 
        : DEFAULT_CONTENT_RATING;
    
    // Validiere Parameter
    validateUploadParams(file, filename, contentType, contentRating, tags);
    
    // Überprüfe den tatsächlichen Dateityp mit fileTypeFromBuffer
    const actualType = await fileTypeFromBuffer(file);
    if (!actualType) {
      throw new ApplicationError(
        `Could not determine file type`,
        'ValidationError',
        400
      );
    }
    
    // Prüfe ob der erkannte Typ mit dem angegebenen Typ übereinstimmt
    if (actualType.mime !== contentType) {
      console.warn(`Mismatched content type: declared=${contentType}, actual=${actualType.mime}`);
      contentType = actualType.mime; // Verwende den tatsächlichen Typ statt dem deklarierten
    }
    
    // Prüfe ob der Dateityp unterstützt wird
    if (!VALID_CONTENT_TYPES.includes(contentType)) {
      throw new ApplicationError(
        `Unsupported file type: ${contentType}`,
        'ValidationError',
        400
      );
    }
    
    // Bestimme Dateityp
    const isVideo = VALID_VIDEO_TYPES.includes(contentType);
    console.log(`Processing ${isVideo ? 'video' : 'image'}: ${filename} (${contentType})`);
    
    // Verarbeite Metadaten
    let metadata: any = {};
    let width = 0;
    let height = 0;
    
    if (!isVideo) {
      // Bild-Verarbeitung mit Sharp
      const image = sharp(file);
      metadata = await image.metadata();
      width = metadata.width || 0;
      height = metadata.height || 0;
    } else {
      // Zusätzliche Validierung für Videos
      try {
        // Video-Metadaten extrahieren
        const videoMetadata = await getVideoMetadata(file);
        
        // Speichere Dimensionen
        width = videoMetadata.width;
        height = videoMetadata.height;
        
        // Füge zusätzliche Validierungen hinzu
        const maxDurationSeconds = 300; // 5 Minuten
        if (videoMetadata.durationSeconds > maxDurationSeconds) {
          throw new ApplicationError(
            `Video duration exceeds the maximum limit of ${maxDurationSeconds} seconds`,
            'ValidationError',
            400
          );
        }
        
        // Füge das Metadata zum Output hinzu
        metadata = {
          ...metadata,
          duration: videoMetadata.durationSeconds,
          codec: videoMetadata.codec,
          bitrate: videoMetadata.bitrate
        };
      } catch (error) {
        console.error('Video validation error:', error);
        throw new ApplicationError(
          `Failed to validate video: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'ValidationError',
          400,
          error
        );
      }
    }
    
    // Tags verarbeiten wie bisher
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

    // Post erstellen
    const post = await Post.findOneAndUpdate(
      { _id: existingPostId || new Types.ObjectId() },
      {
        title: filename,
        author: userId ? new Types.ObjectId(userId) : null,
        contentRating: validContentRating,
        tags: processedTags,
        meta: {
          width: width,
          height: height,
          size: file.length,
          format: isVideo ? (
            contentType === 'video/webm' ? 'webm' : 
            contentType === 'video/mp4' ? 'mp4' : 'mov'
          ) : (
            metadata.format || 'unknown'
          ),
          isVideo: isVideo,
        }
      },
      { new: true, upsert: true }
    );

    console.log(`Post created/updated with isVideo=${isVideo}, meta:`, post.meta);

    // Wenn ein User vorhanden ist, füge den Post zu seinen Uploads hinzu
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: { uploads: post._id }
      });
    }
    
    // Generiere eine eindeutige Datei-ID
    const fileId = generateImageId();
    
    // Bestimme die Dateiendung basierend auf dem Inhaltstyp
    let fileExtension = '.jpg'; // Standard für Bilder
    
    if (isVideo) {
      if (contentType === 'video/webm') fileExtension = '.webm';
      else if (contentType === 'video/mp4') fileExtension = '.mp4';
      else if (contentType === 'video/quicktime') fileExtension = '.mov';
    }
    
    const finalFilename = `${fileId}${fileExtension}`;
    const thumbnailFilename = `thumb_${fileId}.jpg`; // Thumbnails sind immer JPG
    
    // Pfade festlegen
    const originalPath = join(UPLOAD_DIRS.original, finalFilename);
    const thumbnailPath = join(UPLOAD_DIRS.thumbnails, thumbnailFilename);
    
    // Speichere die Originaldatei
    await writeFile(originalPath, file, { mode: 0o644 });
    console.log(`Original file saved to: ${originalPath}`);
    
    // Erstelle Thumbnail
    if (isVideo) {
      try {
        // Für Videos: Verwende ffmpeg, um ein Thumbnail zu erstellen
        console.log(`Generating thumbnail for video: ${thumbnailPath}`);
        await generateVideoThumbnail(originalPath, thumbnailPath);
      } catch (thumbError) {
        console.error('Error generating video thumbnail:', thumbError);
        // Versuche einen Fallback mit einem Standard-Video-Thumbnail
        const fallbackThumbPath = join(process.cwd(), 'public', 'images', 'video-placeholder.jpg');
        try {
          const fallbackThumb = await fs.readFile(fallbackThumbPath);
          await fs.writeFile(thumbnailPath, fallbackThumb);
          console.log(`Used fallback thumbnail for ${thumbnailPath}`);
        } catch (fallbackError) {
          console.error('Fallback thumbnail also failed:', fallbackError);
        }
      }
    } else {
      // Für Bilder: Verwende sharp wie bisher
      try {
        console.log(`Generating thumbnail for image: ${thumbnailPath}`);
        const image = sharp(file);
        await image
          .resize(400, 400, {
            fit: 'cover',
            position: 'centre'
          })
          .toFile(thumbnailPath);
        console.log(`Thumbnail successfully saved to ${thumbnailPath}`);
      } catch (thumbError) {
        console.error('Error generating thumbnail:', thumbError);
        // Verwende die alternative Methode wie bisher
        try {
          const image = sharp(file);
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
    }
    
    // Aktualisiere den Post mit den Dateipfaden
    post.imageUrl = `/uploads/original/${finalFilename}`;
    post.thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
    await post.save();
    console.log(`Saved file paths to database: ${post.imageUrl}, ${post.thumbnailUrl}`);
    
    return {
      id: post.id,
      filename: finalFilename,
      originalPath: post.imageUrl,
      thumbnailPath: post.thumbnailUrl,
      contentType,
      size: file.length,
      dimensions: {
        width: width,
        height: height
      },
      tags: processedTags,
      contentRating: validContentRating,
      uploadDate: new Date(),
      userId,
      isVideo: isVideo
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