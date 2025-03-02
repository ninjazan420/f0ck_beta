import { NextResponse } from 'next/server';
import { processUpload, initializeUploadDirectories } from '@/lib/upload';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db/mongodb';

export async function POST(req: Request) {
  try {
    // Stelle sicher, dass wir mit der Datenbank verbunden sind
    await connectToDatabase();

    // Optional: Hole User-Session wenn vorhanden
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const formData = await req.formData();
    const files = formData.getAll('file') as File[];
    const rating = formData.get('rating') as string;
    
    if (!files.length) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Stelle sicher, dass die Upload-Ordner existieren
    await initializeUploadDirectories();

    // Verarbeite jeden Upload sequentiell
    const results = [];
    for (const file of files) {
      try {
        // Konvertiere die File zu einem Buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Verarbeite den Upload (User-ID ist optional)
        const processedUpload = await processUpload(
          buffer, 
          file.name, 
          file.type,
          userId
        );
        
        results.push({
          success: true,
          file: {
            id: processedUpload.id,
            filename: processedUpload.filename,
            originalName: file.name,
            contentType: processedUpload.contentType,
            size: processedUpload.size,
            dimensions: processedUpload.dimensions,
            url: processedUpload.originalPath,
            thumbnailUrl: processedUpload.thumbnailPath,
            rating: rating || 'safe',
            uploadDate: new Date().toISOString(),
            uploader: userId ? 'User' : 'Anonymous'
          }
        });
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        results.push({
          success: false,
          file: file.name,
          error: 'Failed to process file'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      file: results.length === 1 ? results[0].file : undefined,  // Für einzelne Uploads
      files: results.length > 1 ? results : undefined           // Für multiple Uploads
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 