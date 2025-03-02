import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    // Get path parameter (may include subdirectories)
    // Sicherstellen, dass params aufgelöst ist
    const resolvedParams = await Promise.resolve(params);
    const pathParts = resolvedParams.path.split('/');
    const decodedPath = pathParts.map(part => decodeURIComponent(part)).join('/');
    
    // Determine image type
    const imageType = decodedPath.endsWith('.png') 
      ? 'image/png' 
      : decodedPath.endsWith('.jpg') || decodedPath.endsWith('.jpeg') 
        ? 'image/jpeg' 
        : decodedPath.endsWith('.gif') 
          ? 'image/gif' 
          : 'image/jpeg';
    
    // Construct the path to the file in public/uploads
    const filePath = join(process.cwd(), 'public', 'uploads', decodedPath);
    
    // Read the image file
    const data = await readFile(filePath);
    
    // Return the image
    return new NextResponse(data, {
      headers: {
        'Content-Type': imageType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return new NextResponse('Image not found', { status: 404 });
  }
} 