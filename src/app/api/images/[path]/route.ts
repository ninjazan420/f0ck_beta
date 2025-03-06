import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    // Get path parameter (may include subdirectories)
    // Stelle sicher, dass das pfad-Parameter aufgelöst wird
    const resolvedParams = await Promise.resolve(params);
    
    // Da wir jetzt den Pfad direkt ohne URL-Kodierung verwenden, müssen wir 
    // sicherstellen, dass der Pfad korrekt ist und keine unerlaubten Zugriffe ermöglicht
    let imagePath = resolvedParams.path;
    
    // Sicherheitscheck: Verhindere Directory Traversal Angriffe
    if (imagePath.includes('..') || imagePath.startsWith('/') || imagePath.startsWith('\\')) {
      return new NextResponse('Invalid path', { status: 400 });
    }
    
    // Determine image type
    const imageType = imagePath.endsWith('.png') 
      ? 'image/png' 
      : imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg') 
        ? 'image/jpeg' 
        : imagePath.endsWith('.gif') 
          ? 'image/gif' 
          : 'image/jpeg';
    
    // Construct the path to the file in public/uploads
    const filePath = join(process.cwd(), 'public', 'uploads', imagePath);
    
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