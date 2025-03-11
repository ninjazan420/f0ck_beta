import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processUpload, downloadImageFromUrl } from '@/lib/upload';
import { initializeUploadDirectory } from '@/lib/init';
import { initializeUploadDirectories } from '@/lib/upload';
import fs from 'fs/promises';
import { join } from 'path';
// Kommentiere den Rate Limiter aus
// import { rateLimit } from '@/lib/rateLimit';
import dbConnect from '@/lib/db/mongodb';
import { revalidatePath } from 'next/cache';

// Initialize upload directories
initializeUploadDirectory().catch(console.error);
initializeUploadDirectories().catch(console.error);

// Kommentiere den Rate Limiter aus
// Initialize rate limiter
// const limiter = rateLimit({
//   interval: 60 * 1000, // 1 minute
//   uniqueTokenPerInterval: 500
// });

export async function POST(request: NextRequest) {
  try {
    console.log('Starting upload process...');
    
    // Initialisiere die Upload-Verzeichnisse am Anfang
    try {
      await initializeUploadDirectories().catch(error => {
        console.error('Failed to initialize upload directories:', error);
        throw error;
      });
    } catch (error) {
      console.error('Critical error initializing directories:', error);
      return NextResponse.json(
        { error: 'Server configuration error: Failed to initialize upload directories' },
        { status: 500 }
      );
    }

    // Connect to database
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
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    console.log('User ID from session:', userId);
    
    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const imageUrl = formData.get('imageUrl') as string;
    const tempFilePath = formData.get('tempFilePath') as string;
    const rating = formData.get('rating') as 'safe' | 'sketchy' | 'unsafe' || 'safe';
    
    console.log('Upload request received:', {
      filesCount: files.length,
      imageUrl: imageUrl ? 'present' : 'not present',
      tempFilePath: tempFilePath ? 'present' : 'not present',
      rating
    });
    
    // Get tags if provided
    let tags: string[] = [];
    const tagsData = formData.get('tags');
    if (tagsData) {
      try {
        tags = JSON.parse(tagsData as string);
        console.log('🏷️ Parsed tags from request:', tags);
        console.log('🧪 Tags type:', typeof tags, Array.isArray(tags));
      } catch (e) {
        console.error('❌ Error parsing tags:', e);
        console.log('📄 Raw tags data:', tagsData);
      }
    }
    
    // Check if we have either files or imageUrl
    if (!files.length && !imageUrl) {
      return NextResponse.json(
        { error: 'No file or image URL provided' },
        { status: 400 }
      );
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
      files: results,
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
    return NextResponse.json(
      { error: 'Failed to process upload: ' + (error.message || 'Unknown error') },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}