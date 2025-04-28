import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postIds } = body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty postIds array' }, { status: 400 });
    }

    console.log('Requested post IDs for stats:', postIds);

    await dbConnect();

    // Konvertiere String-IDs in ObjectIds, falls sie gültig sind
    const objectIds = [];
    const numericIds = [];

    for (const id of postIds) {
      if (mongoose.isValidObjectId(id)) {
        objectIds.push(new mongoose.Types.ObjectId(id));
      } else {
        const numId = parseInt(id, 10);
        if (!isNaN(numId)) {
          numericIds.push(numId);
        }
      }
    }

    // Erstelle eine OR-Abfrage für beide ID-Typen
    const query = {
      $or: []
    };

    if (objectIds.length > 0) {
      query.$or.push({ _id: { $in: objectIds } });
    }

    if (numericIds.length > 0) {
      query.$or.push({ id: { $in: numericIds } });
    }

    // Wenn keine gültigen IDs vorhanden sind, leere Antwort zurückgeben
    if (query.$or.length === 0) {
      console.log('No valid post IDs found, returning empty result');
      return NextResponse.json({});
    }

    // Hole Posts
    const posts = await Post.find(query).select('_id id stats');
    console.log(`Found ${posts.length} posts for stats`);

    // Hole die Post-MongoDB-IDs für die Kommentarabfrage
    const postMongoIds = posts.map(p => p._id);

    // Get comment counts per post with proper error handling
    let commentCounts = [];
    try {
      commentCounts = await Comment.aggregate([
        {
          $match: {
            post: { $in: postMongoIds },
            status: 'approved'
          }
        },
        { $group: { _id: '$post', count: { $sum: 1 } } }
      ]);

      console.log(`Found comment counts for ${commentCounts.length} posts`);
    } catch (commentError) {
      console.error('Error fetching comment counts:', commentError);
      // Wenn Kommentare nicht abgerufen werden können, leeres Array verwenden
      commentCounts = [];
    }

    // Create a map of post ID to comment count
    const commentCountMap = new Map();
    commentCounts.forEach(item => {
      commentCountMap.set(item._id.toString(), item.count);
    });

    // Build the response with stats for each post
    const result = posts.reduce((acc, post) => {
      // Verwende numerische ID wenn vorhanden, sonst MongoDB ID
      const postId = (post.id !== undefined && post.id !== null) ? post.id.toString() : post._id.toString();
      const commentCount = commentCountMap.get(post._id.toString()) || 0;

      // Stelle sicher, dass alle Stats-Felder initialisiert sind
      const stats = post.stats || {};

      acc[postId] = {
        likes: stats.likes || 0,
        comments: commentCount,
        favorites: stats.favorites || 0,
        dislikes: stats.dislikes || 0
      };

      // Aktualisiere auch die Post-Statistiken in der Datenbank
      if (!stats.comments || stats.comments !== commentCount) {
        Post.updateOne(
          { _id: post._id },
          { $set: { 'stats.comments': commentCount } }
        ).catch(err => console.error(`Error updating comment stats for post ${post._id}:`, err));
      }

      return acc;
    }, {} as Record<string, { likes: number; comments: number; favorites: number; dislikes?: number }>);

    console.log('Returning batch stats for', Object.keys(result).length, 'posts');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in batch-stats route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}