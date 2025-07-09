import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

interface VideoMetadata {
  width: number;
  height: number;
  durationSeconds: number;
  bitrate: number;
  codec: string;
}

/**
 * Find ffprobe binary path
 */
async function findFfprobePath(): Promise<string> {
  const possiblePaths = [
    '/usr/bin/ffprobe',
    '/usr/local/bin/ffprobe',
    '/opt/homebrew/bin/ffprobe',
    'ffprobe' // fallback to PATH
  ];
  
  for (const ffprobePath of possiblePaths) {
    try {
      if (ffprobePath !== 'ffprobe') {
        // Check if file exists for absolute paths
        await fs.access(ffprobePath);
        return ffprobePath;
      } else {
        // Test if ffprobe is in PATH
        await execAsync('which ffprobe');
        return 'ffprobe';
      }
    } catch {
      continue;
    }
  }
  
  throw new Error('ffprobe not found. Please install FFmpeg.');
}

/**
 * Extract metadata from video file using FFprobe
 */
export async function getVideoMetadata(buffer: Buffer): Promise<VideoMetadata> {
  // Create temporary file for the buffer
  const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
  const tempFilePath = path.join(tempDir, `temp_${uuidv4()}.mp4`);
  
  try {
    // Ensure temporary directory exists
    await fs.mkdir(tempDir, { recursive: true });
    
    // Write buffer to temporary file
    await fs.writeFile(tempFilePath, buffer);
    
    // Find ffprobe binary
    const ffprobePath = await findFfprobePath();
    console.log(`Using ffprobe at: ${ffprobePath}`);
    
    return new Promise((resolve, reject) => {
      // Use FFprobe to extract video metadata
      const ffprobe = spawn(ffprobePath, [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,codec_name,duration,bit_rate',
        '-of', 'json',
        tempFilePath
      ], {
        env: {
          ...process.env,
          PATH: process.env.PATH + ':/usr/bin:/usr/local/bin:/opt/homebrew/bin'
        }
      });
      
      let stdout = '';
      let stderr = '';
      
      ffprobe.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      ffprobe.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      ffprobe.on('error', (error) => {
        console.error('FFprobe spawn error:', error);
        reject(new Error(`Failed to spawn ffprobe: ${error.message}`));
      });
      
      ffprobe.on('close', (code) => {
        // Delete temporary file
        fs.unlink(tempFilePath).catch(err => {
          console.error('Failed to delete temp file:', err);
        });
        
        console.log(`FFprobe exited with code: ${code}`);
        console.log(`FFprobe stderr: ${stderr}`);
        
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
    // Delete temporary file on error
    try {
      await fs.unlink(tempFilePath);
    } catch {
      // Ignore if file doesn't exist
    }
    
    throw new Error(`Failed to analyze video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}