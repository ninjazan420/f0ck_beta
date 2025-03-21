import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface VideoMetadata {
  width: number;
  height: number;
  durationSeconds: number;
  bitrate: number;
  codec: string;
}

/**
 * Extrahiert Metadaten aus einer Video-Datei mit FFprobe
 */
export async function getVideoMetadata(buffer: Buffer): Promise<VideoMetadata> {
  // Temporäre Datei für den Buffer erstellen
  const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
  const tempFilePath = path.join(tempDir, `temp_${uuidv4()}.mp4`);
  
  try {
    // Stelle sicher, dass das temporäre Verzeichnis existiert
    await fs.mkdir(tempDir, { recursive: true });
    
    // Schreibe den Buffer in eine temporäre Datei
    await fs.writeFile(tempFilePath, buffer);
    
    return new Promise((resolve, reject) => {
      // FFprobe verwenden, um Video-Metadaten zu extrahieren
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,codec_name,duration,bit_rate',
        '-of', 'json',
        tempFilePath
      ]);
      
      let stdout = '';
      let stderr = '';
      
      ffprobe.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      ffprobe.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      ffprobe.on('close', (code) => {
        // Temporäre Datei löschen
        fs.unlink(tempFilePath).catch(err => {
          console.error('Failed to delete temp file:', err);
        });
        
        if (code === 0) {
          try {
            const data = JSON.parse(stdout);
            const stream = data.streams[0];
            
            if (!stream) {
              return reject(new Error('No video stream found'));
            }
            
            const metadata: VideoMetadata = {
              width: stream.width || 0,
              height: stream.height || 0,
              durationSeconds: parseFloat(stream.duration || '0'),
              bitrate: parseInt(stream.bit_rate || '0', 10),
              codec: stream.codec_name || 'unknown'
            };
            
            resolve(metadata);
          } catch (error) {
            reject(new Error(`Failed to parse ffprobe output: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        } else {
          reject(new Error(`ffprobe exited with code ${code}: ${stderr}`));
        }
      });
    });
  } catch (error) {
    // Temporäre Datei löschen bei Fehler
    try {
      await fs.unlink(tempFilePath);
    } catch {
      // Ignorieren wenn die Datei nicht existiert
    }
    
    throw new Error(`Failed to analyze video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 