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
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
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

    // Get user session (if authenticated)
    const userId = session.user.id;
    console.log('User ID from session:', userId);
    
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
      const validFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxFileSize = 20 * 1024 * 1024; // 20MB
      
      // Prüfe das Upload-Limit für jede Datei
      for (const file of files) {
        const limitResult = checkUploadLimit(userId, file.size);
        if (limitResult) {
          return limitResult; // Dies gibt den NextResponse mit dem Fehler zurück
        }
        
        // Buffer erstellen
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Tatsächlichen Dateityp aus dem Inhalt ermitteln
        const detectedType = await fileTypeFromBuffer(buffer);
        if (!detectedType || !validFileTypes.includes(detectedType.mime)) {
          return NextResponse.json(
            { error: `Unsupported or manipulated file type: ${file.type}` },
            { status: 400 }
          );
        }
        
        if (file.size > maxFileSize) {
          return NextResponse.json(
            { error: 'File size exceeds the maximum limit of 20MB' },
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
          
          // Pfad normalisieren - wir prüfen, woher der Pfad kommt
          let fullPath;
          
          // Absoluter Windows-Pfad (C:\...)
          if (tempFilePath.match(/^[a-zA-Z]:\\/)) {
            fullPath = tempFilePath;
          } 
          // URL-Pfad (/uploads/...)
          else if (tempFilePath.startsWith('/uploads/')) {
            fullPath = join(process.cwd(), 'public', tempFilePath);
          }
          // Relativer Pfad im Projektverzeichnis
          else {
            fullPath = join(process.cwd(), tempFilePath);
          }
          
          console.log('Resolved temporary file path:', fullPath);
          
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