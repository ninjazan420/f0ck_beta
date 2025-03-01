import mongoose from 'mongoose';
import Post from '@/models/Post';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function seedInitialData() {
  try {
    // Lösche alle vorhandenen Posts
    await Post.deleteMany({});

    // Erstelle oder finde den Admin-User
    const adminId = '1';
    let admin = await User.findById(adminId);

    if (!admin) {
      // Erstelle den Admin-User, falls er nicht existiert
      admin = await User.create({
        _id: adminId,
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin', 12),
        role: 'admin',
        bio: 'Administrator'
      });
    }

    // Erstelle den initialen Post
    const initialPost = await Post.create({
      _id: '1',
      title: 'Willkommen!',
      content: 'Dies ist der erste Post.',
      author: adminId
    });

    console.log('✅ Initiale Daten wurden erfolgreich erstellt');
    return { success: true };
  } catch (error) {
    console.error('❌ Fehler beim Erstellen der initialen Daten:', error);
    return { success: false, error };
  }
} 