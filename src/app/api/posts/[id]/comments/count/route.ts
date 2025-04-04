import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Comment from '@/models/Comment';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    let { id } = params;
    const numericId = parseInt(id, 10);
    
    // Finde den Post über ID oder numerische ID
    const postIds = await mongoose.connection.collection('posts').find({
      $or: [
        { id: id },
        { numericId: numericId },
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null }
      ]
    }).map(post => post._id).toArray();
    
    if (!postIds || postIds.length === 0) {
      return NextResponse.json({ count: 0 });
    }
    
    // Zähle die Kommentare für diesen Post
    const count = await Comment.countDocuments({ 
      post: { $in: postIds },
      isHidden: { $ne: true }
    });
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting comments:', error);
    return NextResponse.json({ count: 0 });
  }
} 