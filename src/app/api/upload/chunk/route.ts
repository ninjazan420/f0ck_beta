import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { join } from 'path';
import fs from 'fs/promises';
import { validateAndSanitizePath } from '@/lib/path-utils';
import { checkStorageQuota } from '@/lib/storage-quota';

// Speicherort für Chunks
const CHUNKS_DIR = join(process.cwd(), 'public', 'uploads', 'chunks');

export async function POST(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Formular-Daten extrahieren
    const formData = await request.formData();
    const chunkIndex = formData.get('chunkIndex') as string;
    const totalChunks = formData.get('totalChunks') as string;
    const fileId = formData.get('fileId') as string;
    const chunkFile = formData.get('chunk') as File;
    const totalFileSize = parseInt(formData.get('totalFileSize') as string, 10);
    
    // Validierung der Parameter
    if (!chunkIndex || !totalChunks || !fileId || !chunkFile || !totalFileSize) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Speicherplatzkontingent überprüfen (nur beim ersten Chunk)
    if (parseInt(chunkIndex) === 0) {
      const quotaCheck = await checkStorageQuota(userId, totalFileSize);
      if (!quotaCheck.allowed) {
        return NextResponse.json({ 
          error: quotaCheck.errorMessage || 'Storage quota exceeded' 
        }, { status: 400 });
      }
    }
    
    // Sanitize fileId to prevent directory traversal
    const sanitizedFileId = validateAndSanitizePath(fileId);
    if (!sanitizedFileId) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }
    
    // Stelle sicher, dass das Chunk-Verzeichnis existiert
    const userChunkDir = join(CHUNKS_DIR, userId, sanitizedFileId);
    await fs.mkdir(userChunkDir, { recursive: true });
    
    // Speichere den Chunk
    const chunkBuffer = Buffer.from(await chunkFile.arrayBuffer());
    const chunkPath = join(userChunkDir, `chunk-${chunkIndex}`);
    await fs.writeFile(chunkPath, chunkBuffer);
    
    console.log(`Chunk ${chunkIndex}/${totalChunks} saved for file ${fileId}`);
    
    // Wenn dies der letzte Chunk ist, vermerke das
    const isLastChunk = parseInt(chunkIndex) === parseInt(totalChunks) - 1;
    
    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      fileId,
      isLastChunk,
      message: isLastChunk 
        ? 'All chunks received. Ready for assembly.' 
        : `Chunk ${chunkIndex} received successfully.`
    });
  } catch (error) {
    console.error('Error processing chunk:', error);
    return NextResponse.json({
      error: `Failed to process chunk: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // URL-Parameter extrahieren
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId parameter' }, { status: 400 });
    }
    
    // Sanitize fileId
    const sanitizedFileId = validateAndSanitizePath(fileId);
    if (!sanitizedFileId) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }
    
    // Prüfe, ob das Verzeichnis für diese Datei existiert
    const userChunkDir = join(CHUNKS_DIR, userId, sanitizedFileId);
    try {
      await fs.access(userChunkDir);
    } catch (error) {
      return NextResponse.json({ 
        status: 'not_started', 
        receivedChunks: 0,
        totalChunks: 0 
      });
    }
    
    // Zähle die Anzahl der empfangenen Chunks
    const files = await fs.readdir(userChunkDir);
    const receivedChunks = files.filter(f => f.startsWith('chunk-')).length;
    
    // Versuche, die Gesamtzahl der Chunks aus der Metadatei zu lesen, wenn vorhanden
    let totalChunks = 0;
    try {
      const metaPath = join(userChunkDir, 'meta.json');
      const metaContent = await fs.readFile(metaPath, 'utf8');
      const meta = JSON.parse(metaContent);
      totalChunks = meta.totalChunks || 0;
    } catch (error) {
      // Wenn keine Metadatei gefunden wird, können wir die Gesamtzahl nicht bestimmen
    }
    
    return NextResponse.json({
      status: receivedChunks > 0 ? 'in_progress' : 'not_started',
      fileId,
      receivedChunks,
      totalChunks,
      progress: totalChunks > 0 ? (receivedChunks / totalChunks) * 100 : 0
    });
  } catch (error) {
    console.error('Error getting upload status:', error);
    return NextResponse.json({
      error: `Failed to get upload status: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
} 