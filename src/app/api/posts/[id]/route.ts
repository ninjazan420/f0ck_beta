import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import Tag from '@/models/Tag';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Richtige Syntax: Warte auf die Auflösung von params, dann greife auf die id zu
    const id = Number((await params).id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Finde den Post ohne populate
    const post = await Post.findOne({ id: id });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Tag-Informationen anreichern
    const tagData = [];
    if (post.tags && post.tags.length > 0) {
      console.log('Post tags before processing:', post.tags);
      
      for (const tagName of post.tags) {
        console.log('Processing tag:', tagName);
        // Robust tag search with fallback
        const tag = await Tag.findOne({ 
          $or: [
            { name: tagName },
            { id: tagName }
          ] 
        });
        
        if (tag) {
          console.log('Found tag:', tag.name, 'with ID:', tag.id, 'and count:', tag.postsCount);
          tagData.push({
            id: tag.id || tag._id?.toString() || tagName,
            name: tag.name,
            type: tag.type || 'general',
            count: tag.postsCount || 0
          });
        } else {
          console.log('Tag not found in database:', tagName);
          // Fallback: Verwende den Tag-Namen direkt, wenn kein Tag gefunden wurde
          tagData.push({
            id: tagName,
            name: tagName,
            type: 'general',
            count: 0
          });
        }
      }
      
      console.log('Processed tag data:', tagData);
      post.tags = tagData;
    } else {
      console.log('No tags found for post:', id);
    }

    // Erstelle ein serializierbares JSON-Objekt für die Antwort
    const serializedPost = post.toObject ? post.toObject() : JSON.parse(JSON.stringify(post));
    
    // Stelle sicher, dass Tags korrekt übertragen werden
    if (tagData && tagData.length > 0) {
      serializedPost.tags = tagData;
      console.log('Final serialized tags:', serializedPost.tags);
    }

    // Wenn ein Autor existiert, populate die Autor-Daten
    if (post.author) {
      await post.populate('author', 'username avatar bio premium role createdAt stats');
      serializedPost.author = post.author;
    } else {
      // Füge Dummy-Autor-Daten für anonyme Posts hinzu
      serializedPost.author = {
        _id: 'anonymous',
        username: 'Anonymous',
        avatar: null,
        bio: '',
        premium: false,
        role: 'member',
        createdAt: new Date(),
        stats: {
          totalPosts: 0,
          totalLikes: 0,
          totalViews: 0,
          level: 1,
          xp: 0,
          xpNeeded: 100
        }
      };
    }

    return NextResponse.json(serializedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 