import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processUpload } from '@/lib/upload';
import { initializeUploadDirectory } from '@/lib/init';
import { initializeUploadDirectories } from '@/lib/upload';
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
    
    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const rating = formData.get('rating') as 'safe' | 'sketchy' | 'unsafe' || 'safe';
    
    // Get tags if provided
    let tags: string[] = [];
    const tagsData = formData.get('tags');
    if (tagsData) {
      try {
        tags = JSON.parse(tagsData as string);
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }
    
    if (!files.length) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const results = [];

    for (const file of files) {
      // Convert file to buffer for processing
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Process the upload
      const processedUpload = await processUpload(
        buffer,
        file.name,
        file.type,
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
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
} 