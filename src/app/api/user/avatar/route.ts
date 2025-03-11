import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import path from 'path';
import { writeFile, mkdir, unlink, access } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';

// Process form data with file
async function processFormData(req: NextRequest) {
  const formData = await req.formData();
  const avatarFile = formData.get('avatar') as File;
  
  if (!avatarFile) {
    return { error: 'No avatar file provided' };
  }
  
  const buffer = Buffer.from(await avatarFile.arrayBuffer());
  return { buffer, fileType: avatarFile.type };
}

// Utility function to verify file exists
async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated', success: false },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { buffer, fileType, error } = await processFormData(req);
    
    if (error) {
      return NextResponse.json(
        { error, success: false },
        { status: 400 }
      );
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, GIF or WEBP', success: false },
        { status: 400 }
      );
    }
    
    // Create avatar directory if it doesn't exist
    const avatarsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(avatarsDir, { recursive: true });
    
    // Generate unique filename with timestamp to prevent caching issues
    const timestamp = Date.now();
    const uniqueId = uuidv4().replace(/-/g, '');
    const filename = `avatar_${userId}_${uniqueId}_${timestamp}.png`;
    const filePath = path.join(avatarsDir, filename);
    
    // Save file - make sure it's written completely before returning
    await writeFile(filePath, buffer);
    
    // Verify the file was written correctly
    const fileWasWritten = await fileExists(filePath);
    if (!fileWasWritten) {
      throw new Error('Failed to write avatar file to disk');
    }
    
    // Update avatar path in database
    await dbConnect();
    const avatarUrl = `/uploads/avatars/${filename}`;
    
    // Delete old avatar if exists
    const user = await User.findById(userId);
    if (user?.avatar && !user.avatar.includes('defaultavatar')) {
      const oldAvatarPath = path.join(process.cwd(), 'public', user.avatar);
      // Don't delete the old file immediately to prevent 404s during transition
      setTimeout(async () => {
        try {
          if (await fileExists(oldAvatarPath)) {
            await unlink(oldAvatarPath);
            console.log('Deleted old avatar:', oldAvatarPath);
          }
        } catch (error) {
          console.error('Could not delete old avatar:', error);
        }
      }, 5000); // 5 second delay before deleting old file
    }
    
    // Update database with new avatar URL
    await User.findByIdAndUpdate(userId, { avatar: avatarUrl });
    
    return NextResponse.json({ 
      success: true, 
      avatarUrl
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading avatar', success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated', success: false },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get user and current avatar
    await dbConnect();
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', success: false },
        { status: 404 }
      );
    }
    
    // If user has a custom avatar, delete it
    if (user.avatar && !user.avatar.includes('defaultavatar')) {
      const avatarPath = path.join(process.cwd(), 'public', user.avatar);
      try {
        await unlink(avatarPath);
      } catch (error) {
        console.error('Could not delete avatar file:', error);
        // Continue even if delete fails
      }
    }
    
    // Update user to remove avatar reference
    await User.findByIdAndUpdate(userId, { avatar: null });
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { error: 'Error deleting avatar', success: false },
      { status: 500 }
    );
  }
} 