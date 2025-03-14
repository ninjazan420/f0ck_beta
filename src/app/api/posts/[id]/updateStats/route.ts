import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.id;
    
    await dbConnect();
    
    // Find post
    let post;
    if (mongoose.isValidObjectId(postId)) {
      post = await Post.findById(postId);
    }
    
    if (!post) {
      const numericId = parseInt(postId, 10);
      if (!isNaN(numericId)) {
        post = await Post.findOne({ id: numericId });
      }
    }
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Zähle die Kommentare
    const commentCount = await Comment.countDocuments({
      post: post._id,
      status: 'approved',
      isHidden: { $ne: true }
    });
    
    // Initialisiere stats falls nicht vorhanden
    if (!post.stats) {
      post.stats = { likes: 0, views: 0, comments: 0, favorites: 0 };
    }
    
    // Aktualisiere die Kommentaranzahl
    post.stats.comments = commentCount;
    await post.save();
    
    return NextResponse.json({
      success: true,
      stats: post.stats
    });
  } catch (error) {
    console.error('Error updating post stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 