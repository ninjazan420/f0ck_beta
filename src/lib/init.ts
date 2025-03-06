import { mkdir } from 'fs/promises';
import { join } from 'path';
import dbConnect from '@/lib/db/mongodb';
import Tag, { TagType } from '@/models/Tag';

// Track initialization status
let uploadDirInitialized = false;
let tagsInitialized = false;
let databaseInitialized = false;

export async function initializeUploadDirectory() {
  if (uploadDirInitialized) {
    console.log('Upload directory already initialized');
    return;
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadDir, { recursive: true });
    console.log('Upload directory created successfully');
    uploadDirInitialized = true;
  } catch (error) {
    console.error('Failed to create upload directory:', error);
    // Don't mark as initialized on failure
  }
}

export async function initializeTags() {
  if (tagsInitialized) {
    console.log('Tags already initialized');
    return;
  }

  try {
    await dbConnect();
    console.log('Tags database initialized');
    
    // Mark as initialized without creating any default tags
    tagsInitialized = true;
  } catch (error) {
    console.error('Failed to initialize tags:', error);
    // Don't mark as initialized on failure
  }
}

export async function initializeDatabase() {
  if (databaseInitialized) {
    console.log('Database already initialized');
    return;
  }

  try {
    console.log('Initializing database and directories...');
    
    // Initialize directories
    await initializeUploadDirectory();
    
    // Initialize database collections
    await initializeTags();
    
    console.log('Database initialization complete');
    databaseInitialized = true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Don't mark as initialized on failure
  }
} 