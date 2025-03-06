import { NextRequest, NextResponse } from 'next/server';
import { downloadImageFromUrl } from '@/lib/upload';
import { join } from 'path';
import { writeFile } from 'fs/promises';

export async function GET(request: NextRequest) {
  // Get URL parameter
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    // Download the image from the URL
    const imageData = await downloadImageFromUrl(url);
    
    // Return the image as a response
    return new NextResponse(imageData.file, {
      headers: {
        'Content-Type': imageData.contentType,
        'Content-Length': imageData.file.length.toString(),
        'Cache-Control': 'public, max-age=86400',
        'Content-Disposition': `filename="${encodeURIComponent(imageData.filename)}"`,
      }
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    return NextResponse.json(
      { error: 'Failed to download image' },
      { status: 500 }
    );
  }
} 