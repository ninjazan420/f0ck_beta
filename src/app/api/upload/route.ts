import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processUpload, downloadImageFromUrl, initializeUploadDirectories, ContentRating, DEFAULT_CONTENT_RATING } from '@/lib/upload';
// Kommentiere den Rate Limiter aus
// import { rateLimit } from '@/lib/rateLimit';
import dbConnect from '@/lib/db/mongodb';
import { revalidatePath } from 'next/cache';
import { fileTypeFromBuffer } from 'file-type';
import { checkUploadLimit } from '@/lib/upload-limit';
import { createErrorResponse, ApplicationError } from '@/lib/error-handling';
import fs from 'fs/promises';
import { join } from 'path';
import { withAuth } from '@/lib/api-utils';
import { validateAndSanitizePath, isPathWithinBase } from '@/lib/path-utils';
import { getVideoMetadata } from '@/lib/video-utils';

// Kommentiere den Rate Limiter aus
// Initialize rate limiter
// const limiter = rateLimit({
//   interval: 60 * 1000, // 1 minute
//   uniqueTokenPerInterval: 500
// });

// Funktion zum Extrahieren von Tags aus FormData
function extractTags(formData: FormData): string[] {
  const tagsData = formData.get('tags');
  if (!tagsData) {
    return [];
  }
  
  try {
    // Sicherstellen, dass wir einen String haben
    const tagsString = typeof tagsData === 'string' 
      ? tagsData
      : tagsData instanceof Blob 
        ? 'Blob data not supported for tags'
        : String(tagsData);
    
    // Nur parsen, wenn es ein nicht-leerer String ist
    if (tagsString && tagsString.trim()) {
      const parsed = JSON.parse(tagsString);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('Failed to parse tags:', e);
    console.log('Raw tags data:', tagsData);
  }
  
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('Anonymous upload request received');
    } else {
      console.log('User ID from session:', session.user.id);
    }
    
    // Der userId wird weiterhin aus der Session genommen, falls vorhanden
    const userId = session?.user?.id || null;
    
    console.log('Starting upload process...');
    
    await initializeUploadDirectories();
    await dbConnect();
    
    // Kommentiere Rate Limiting aus
    // Rate limiting
    // try {
    //   await limiter.check(10, 'UPLOAD_RATE_LIMIT');
    // } catch {
    //   return NextResponse.json(
    //     { error: 'Rate limit exceeded. Please try again later.' },
    //     { status: 429 }
    //   );
    // }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const imageUrl = formData.get('imageUrl') as string;
    const tempFilePath = formData.get('tempFilePath') as string;
    const rating = (formData.get('rating') as ContentRating) || DEFAULT_CONTENT_RATING;
    
    console.log('Upload request received:', {
      filesCount: files.length,
      imageUrl: imageUrl ? 'present' : 'not present',
      tempFilePath: tempFilePath ? 'present' : 'not present',
      rating
    });
    
    // Get tags if provided
    const tags = extractTags(formData);
    
    // Check if we have either files or imageUrl
    if (!files.length && !imageUrl) {
      return NextResponse.json(
        { error: 'No file or image URL provided' },
        { status: 400 }
      );
    }

    // Stärkere Validierung der Uploads
    if (files && files.length > 0) {
      // Validiere die Dateitypen und -größen
      const validFileTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
        'video/webm', 'video/mp4', 'video/quicktime'
      ];
      const maxFileSize = 100 * 1024 * 1024; // 100MB für Videos
      
      for (const file of files) {
        const limitResult = checkUploadLimit(userId, file.size);
        if (limitResult) {
          return limitResult;
        }
        
        // Buffer erstellen
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Tatsächlichen Dateityp aus dem Inhalt ermitteln
        const detectedType = await fileTypeFromBuffer(buffer);
        if (!detectedType) {
          return NextResponse.json(
            { error: `Could not determine file type` },
            { status: 400 }
          );
        }
        
        // Zusätzliche Prüfung für Video-Dateien
        if (detectedType.mime.startsWith('video/')) {
          try {
            // Video-Metadaten extrahieren mit ffprobe (erfordert FFmpeg-Installation)
            const videoMetadata = await getVideoMetadata(buffer);
            
            // Maximale Video-Dauer (5 Minuten)
            const maxDurationSeconds = 300;
            if (videoMetadata.durationSeconds > maxDurationSeconds) {
              return NextResponse.json(
                { error: `Video duration exceeds the maximum limit of ${maxDurationSeconds} seconds` },
                { status: 400 }
              );
            }
            
            // Maximale Auflösung (4K)
            const maxResolution = 3840 * 2160;
            if (videoMetadata.width * videoMetadata.height > maxResolution) {
              return NextResponse.json(
                { error: `Video resolution exceeds the maximum limit of 4K` },
                { status: 400 }
              );
            }
          } catch (error) {
            console.error('Error validating video metadata:', error);
            return NextResponse.json(
              { error: `Failed to validate video: ${error instanceof Error ? error.message : 'Unknown error'}` },
              { status: 400 }
            );
          }
        }
        
        // MIME-Typ-Überprüfung gegen die Whitelist
        if (!validFileTypes.includes(detectedType.mime)) {
          return NextResponse.json(
            { error: `Unsupported file type: ${detectedType.mime}` },
            { status: 400 }
          );
        }
        
        if (file.size > maxFileSize) {
          return NextResponse.json(
            { error: 'File size exceeds the maximum limit of 100MB' },
            { status: 400 }
          );
        }
      }
    }

    const results = [];

    // Process uploaded files
    for (const file of files) {
      try {
        // Convert file to buffer for processing
        const buffer = Buffer.from(await file.arrayBuffer());
        
        console.log(`Processing file upload: ${file.name}`);
        
        // Process the upload
        const processedUpload = await processUpload(
          buffer,
          file.name,
          file.type,
          userId,
          rating,
          tags
        );

        console.log(`Successfully processed file: ${file.name}`);
        console.log('Paths:', {
          original: processedUpload.originalPath,
          thumbnail: processedUpload.thumbnailPath
        });

        results.push({
          id: processedUpload.id,
          filename: processedUpload.filename,
          url: processedUpload.originalPath,
          thumbnailUrl: processedUpload.thumbnailPath,
          rating: rating,
          uploadDate: new Date().toISOString(),
          tags: tags,
          uploader: userId ? 'User' : 'Anonymous'
        });
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
        throw err;
      }
    }

    // Process image from URL if provided
    if (imageUrl) {
      try {
        let downloadedImage;
        let buffer;
        let contentType;
        let filename;
        
        if (tempFilePath) {
          console.log('Received tempFilePath:', tempFilePath);
          
          // Pfad normalisieren und validieren
          const sanitizedPath = validateAndSanitizePath(tempFilePath);
          if (!sanitizedPath) {
            return NextResponse.json(
              { error: 'Invalid file path' },
              { status: 400 }
            );
          }
          
          // Bestimme den vollständigen Pfad basierend auf dem sanitierten Pfad
          let fullPath;
          const uploadBaseDir = join(process.cwd(), 'public', 'uploads');
          
          // Prüfen, ob der Pfad mit uploads beginnt
          if (sanitizedPath.startsWith('uploads/')) {
            fullPath = join(process.cwd(), 'public', sanitizedPath);
          } else {
            fullPath = join(uploadBaseDir, sanitizedPath);
          }
          
          // Zusätzlich prüfen, ob der resultierende Pfad innerhalb des Upload-Verzeichnisses bleibt
          if (!isPathWithinBase(uploadBaseDir, fullPath)) {
            console.error('Path traversal attempt detected:', { tempFilePath, fullPath });
            return NextResponse.json(
              { error: 'Invalid file path (outside upload directory)' },
              { status: 400 }
            );
          }
          
          // Jetzt ist der Pfad sicher, um damit zu arbeiten
          try {
            // Überprüfen, ob die Datei existiert
            try {
              await fs.access(fullPath);
            } catch (err) {
              console.error('File does not exist at path:', fullPath);
              throw new Error('File not found');
            }
            
            buffer = await fs.readFile(fullPath);
            
            // Get filename from the path
            filename = fullPath.split(/[\/\\]/).pop() || 'image.jpg';
            
            // Try to guess content type from filename
            if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
              contentType = 'image/jpeg';
            } else if (filename.endsWith('.png')) {
              contentType = 'image/png';
            } else if (filename.endsWith('.gif')) {
              contentType = 'image/gif';
            } else if (filename.endsWith('.webp')) {
              contentType = 'image/webp';
            } else {
              contentType = 'image/jpeg'; // Default to jpeg
            }
            
            console.log('Successfully read temporary file:', filename);
            
            // Clean up the temp file after processing
            await fs.unlink(fullPath).catch(err => {
              console.error('Failed to delete temp file:', err);
              console.log('Attempting to delete with absolute path...');
            });
          } catch (error) {
            console.error('Error reading temp file:', error);
            console.log('Falling back to downloading image from URL:', imageUrl);
            downloadedImage = await downloadImageFromUrl(imageUrl);
            buffer = downloadedImage.file;
            contentType = downloadedImage.contentType;
            filename = downloadedImage.filename;
          }
        } else {
          // Download the image from URL
          console.log('Downloading image directly from URL:', imageUrl);
          downloadedImage = await downloadImageFromUrl(imageUrl);
          buffer = downloadedImage.file;
          contentType = downloadedImage.contentType;
          filename = downloadedImage.filename;
        }
        
        // Process the upload with the image
        console.log('Processing upload for:', filename);
        const processedUpload = await processUpload(
          buffer,
          filename,
          contentType,
          userId,
          rating,
          tags
        );

        results.push({
          id: processedUpload.id,
          filename: processedUpload.filename,
          url: processedUpload.originalPath,
          thumbnailUrl: processedUpload.thumbnailPath,
          rating: rating,
          uploadDate: new Date().toISOString(),
          tags: tags,
          uploader: userId ? 'User' : 'Anonymous'
        });
      } catch (error) {
        console.error('Error processing image URL:', error);
        return NextResponse.json(
          { error: 'Failed to process image URL' },
          { status: 500 }
        );
      }
    }

    // Revalidate paths if needed
    if (results.length > 0) {
      revalidatePath('/');
      revalidatePath('/posts');
    }

    return NextResponse.json({ 
      success: true,
      files: results.map(result => ({
        ...result,
        id: result.id
      })),
      file: results[0] // For backward compatibility
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return createErrorResponse(error);
  }
}