import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // params auflösen
    const resolvedParams = await params;
    // Join path segments
    const path = resolvedParams.path.join('/');
    console.log('Requested upload path:', path);
    
    // Construct full file path
    const filePath = join(process.cwd(), 'public', 'uploads', path);
    console.log('Full file path:', filePath);
    
    // Check if file exists
    try {
      const stats = await stat(filePath);
      console.log('File exists:', filePath);
      console.log('File size:', stats.size);
    } catch (err) {
      console.error('File not found:', filePath);
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (path.endsWith('.png')) contentType = 'image/png';
    else if (path.endsWith('.gif')) contentType = 'image/gif';
    
    // Read the file
    const data = await readFile(filePath);
    
    // Return the file with appropriate headers
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Error serving file', { status: 500 });
  }
} 