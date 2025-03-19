import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tag from '../models/Tag';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function migrateTagCreators() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Alle Tags ohne Ersteller finden
    const tagsWithoutCreator = await Tag.find({ creator: null });
    console.log(`Found ${tagsWithoutCreator.length} tags without creator`);
    
    // Standardbenutzer für bestehende Tags (z.B. Admin)
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('Admin user not found');
      return;
    }
    
    // Jedem Tag den Admin als Ersteller zuweisen
    for (const tag of tagsWithoutCreator) {
      tag.creator = adminUser._id;
      await tag.save();
      console.log(`Updated tag ${tag.name} with creator ${adminUser.username}`);
    }
    
    console.log('Migration completed');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateTagCreators(); 