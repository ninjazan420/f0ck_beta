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
    
    // Log the requested path for debugging
    console.log('Requested image path:', imagePath);
    
    // Konstruiere den Pfad zur Datei in public/uploads mit Fehlerbehandlung
    let filePath;
    try {
      filePath = join(process.cwd(), 'public', 'uploads', imagePath);
      console.log('Full file path:', filePath);
    } catch (error) {
      console.error('Error constructing file path:', error);
      return new NextResponse('Invalid path', { status: 400 });
    }
    
    // Read the image file
    try {
      const data = await readFile(filePath);
      
      // Return the image with no-cache headers
      return new NextResponse(data, {
        headers: {
          'Content-Type': imageType,
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Cross-Origin-Resource-Policy': 'cross-origin'
        }
      });
    } catch (error) {
      console.error(`Error reading file at ${filePath}:`, error);
      return new NextResponse('Image not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error loading image:', error);
    return new NextResponse('Image not found', { status: 404 });
  }
} 