import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const { postIds } = await request.json();
    
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid post IDs' },
        { status: 400 }
      );
    }
    
    // Limit the number of posts to prevent abuse
    const limitedPostIds = postIds.slice(0, 50);
    
    await dbConnect();
    
    // Trenne numerische IDs und ObjectIDs
    const numericIds = [];
    const objectIds = [];
    
    for (const id of limitedPostIds) {
      // Versuche, die ID als Zahl zu parsen
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        numericIds.push(numericId);
      } 
      // Versuche, die ID als ObjectId zu validieren
      else if (mongoose.isValidObjectId(id)) {
        objectIds.push(id);
      }
    }
    
    // Führe die Abfrage mit beiden ID-Typen durch
    const posts = await Post.find({
      $or: [
        { _id: { $in: objectIds } },
        { id: { $in: numericIds } }
      ]
    }, { 
      'stats.likes': 1, 
      'stats.comments': 1, 
      'stats.favorites': 1,
      'id': 1 
    });
    
    // Format the result as an object keyed by post ID (use the original ID format)
    const result = {};
    
    posts.forEach(post => {
      // Wenn wir die numerische ID kennen, nutzen wir sie als Schlüssel
      // sonst verwenden wir die MongoDB ObjectID
      const idToUse = post.id ? post.id.toString() : post._id.toString();
      
      // Wenn der Client eine numerische ID gesendet hat, aber wir eine ObjectID haben,
      // führen wir eine zusätzliche Zuordnung durch
      const clientIds = limitedPostIds.filter(id => {
        if (parseInt(id) === post.id) return true;
        if (id === post._id.toString()) return true;
        return false;
      });
      
      // Füge für jeden möglichen Client-ID-Schlüssel einen Eintrag hinzu
      clientIds.forEach(clientId => {
        result[clientId] = {
          likes: post.stats?.likes || 0,
          comments: post.stats?.comments || 0,
          favorites: post.stats?.favorites || 0,
          // Füge beide ID-Typen hinzu, damit der Client sie kennt
          _id: post._id.toString(),
          id: post.id
        };
      });
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching batch stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 