import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import crypto from 'crypto';
import { downloadImageFromUrl } from '@/lib/upload'; // Importiere die Funktion direkt

// Define the temp directory
const TEMP_DIR = join(process.cwd(), 'public', 'uploads', 'temp');

// Generate a unique temporary file ID
function generateTempId(): string {
  const prefix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  const randomHex = crypto.randomBytes(8).toString('hex'); // 16 character hex
  return `temp_${prefix}_${randomHex}`;
}

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
    console.log('Downloading image from URL:', url);
    
    // Verwende die gemeinsame downloadImageFromUrl-Funktion
    const imageData = await downloadImageFromUrl(url);
    
    console.log('Successfully downloaded image and created temp file');
    
    return NextResponse.json({
      success: true,
      tempFilePath: imageData.tempFilePath,
      previewUrl: imageData.previewUrl,
      contentType: imageData.contentType,
      size: imageData.file.length,
      dimensions: imageData.dimensions
    });
  } catch (error) {
    console.error('Error downloading and processing image:', error);
    return NextResponse.json(
      { error: 'Failed to download and process image' },
      { status: 500 }
    );
  }
} 