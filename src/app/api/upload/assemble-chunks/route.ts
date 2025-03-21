import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { join } from 'path';
import fs from 'fs/promises';
import { validateAndSanitizePath } from '@/lib/path-utils';
import { processUpload } from '@/lib/upload';
import { updateStorageUsage } from '@/lib/storage-quota';
import { fileTypeFromBuffer } from 'file-type';

// Verzeichnisse für Chunks und temporäre Dateien
const CHUNKS_DIR = join(process.cwd(), 'public', 'uploads', 'chunks');
const TEMP_DIR = join(process.cwd(), 'public', 'uploads', 'temp');

export async function POST(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Body-Daten extrahieren
    const data = await request.json();
    const { fileId, fileName } = data;
    
    if (!fileId || !fileName) {
      return NextResponse.json({ error: 'Missing fileId or fileName' }, { status: 400 });
    }
    
    // Sanitize fileId zur Sicherheit
    const sanitizedFileId = validateAndSanitizePath(fileId);
    if (!sanitizedFileId) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }
    
    // Verzeichnis mit den Chunks
    const userChunkDir = join(CHUNKS_DIR, userId, sanitizedFileId);
    
    try {
      // Prüfen, ob das Chunk-Verzeichnis existiert
      await fs.access(userChunkDir);
    } catch (error) {
      return NextResponse.json({ error: 'No chunks found for this file' }, { status: 404 });
    }
    
    // Alle Chunk-Dateien auflisten
    const files = await fs.readdir(userChunkDir);
    const chunkFiles = files.filter(f => f.startsWith('chunk-')).sort((a, b) => {
      const numA = parseInt(a.split('-')[1], 10);
      const numB = parseInt(b.split('-')[1], 10);
      return numA - numB;
    });
    
    if (chunkFiles.length === 0) {
      return NextResponse.json({ error: 'No chunks found for assembly' }, { status: 400 });
    }
    
    console.log(`Found ${chunkFiles.length} chunks for assembly of file ${fileName}`);
    
    // Temporäre Datei für das zusammengeführte Ergebnis erstellen
    await fs.mkdir(TEMP_DIR, { recursive: true });
    const tempFilePath = join(TEMP_DIR, `${sanitizedFileId}_${fileName}`);
    
    // Chunks zusammenführen
    for (const chunkFile of chunkFiles) {
      const chunkPath = join(userChunkDir, chunkFile);
      const chunkData = await fs.readFile(chunkPath);
      
      // Anhängen an die temporäre Datei
      await fs.appendFile(tempFilePath, chunkData);
      
      // Chunk nach dem Zusammenführen löschen
      await fs.unlink(chunkPath);
    }
    
    // Die zusammengeführte Datei einlesen
    const fileBuffer = await fs.readFile(tempFilePath);
    
    // Dateityp überprüfen
    const fileType = await fileTypeFromBuffer(fileBuffer);
    if (!fileType || !fileType.mime.startsWith('video/')) {
      await fs.unlink(tempFilePath);
      return NextResponse.json({ error: 'Assembled file is not a valid video' }, { status: 400 });
    }
    
    // Upload verarbeiten
    console.log(`Processing assembled file: ${fileName} (${fileType.mime})`);
    const processedUpload = await processUpload(
      fileBuffer,
      fileName,
      fileType.mime,
      userId,
      'safe', // Standard-Content-Rating
      [] // Keine Tags
    );
    
    // Speichernutzung aktualisieren
    await updateStorageUsage(userId, fileBuffer.length);
    
    // Temporäre Dateien aufräumen
    await fs.unlink(tempFilePath);
    await fs.rm(userChunkDir, { recursive: true, force: true });
    
    return NextResponse.json({ 
      success: true,
      message: 'File successfully assembled and processed',
      file: {
        id: processedUpload.id,
        filename: processedUpload.filename,
        url: processedUpload.originalPath,
        thumbnailUrl: processedUpload.thumbnailPath,
        rating: processedUpload.contentRating,
        uploadDate: processedUpload.uploadDate.toISOString(),
        tags: processedUpload.tags,
        uploader: userId
      }
    });
  } catch (error) {
    console.error('Error assembling chunks:', error);
    return NextResponse.json({
      error: `Failed to assemble chunks: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
} 