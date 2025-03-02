import { mkdir } from 'fs/promises';
import { join } from 'path';

export async function initializeUploadDirectory() {
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadDir, { recursive: true });
    console.log('Upload directory created successfully');
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
} 