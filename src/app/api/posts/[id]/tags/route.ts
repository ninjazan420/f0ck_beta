import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Post from '@/models/Post';
import Tag from '@/models/Tag';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get post ID from params - WICHTIG: params muss zuerst aufgelöst werden
    const resolvedParams = await Promise.resolve(params);
    const postId = resolvedParams.id;
    
    const { tags } = await request.json();

    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Tags must be an array' },
        { status: 400 }
      );
    }

    // Find the post (either by MongoDB ID or numeric ID)
    let post;
    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findById(postId);
    }

    if (!post) {
      // Try as numeric ID
      post = await Post.findOne({ id: parseInt(postId, 10) });
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Process tags
    const processedTags = [];
    for (const tagName of tags) {
      if (!tagName || typeof tagName !== 'string' || tagName.trim() === '') {
        continue;
      }

      // Normalize tag name
      const normalizedTagName = tagName.toLowerCase().trim().replace(/\s+/g, '_');
      
      console.log('Normalized tag name:', normalizedTagName);
      
      // Find or create tag
      let tag;
      try {
        // Zuerst versuchen, den Tag zu finden
        tag = await Tag.findOne({ name: normalizedTagName });
        
        // Wenn nicht gefunden, einen neuen erstellen
        if (!tag) {
          tag = await Tag.create({
            id: normalizedTagName,
            name: normalizedTagName,
            postsCount: 1,
            newPostsToday: 1,
            newPostsThisWeek: 1
          });
          console.log('Created new tag:', tag.name);
        } else {
          // Falls der Tag schon existiert, aber noch nicht am Post ist
          if (!post.tags.includes(tag.name)) {
            // Zähler erhöhen
            tag.postsCount = (tag.postsCount || 0) + 1;
            tag.newPostsToday = (tag.newPostsToday || 0) + 1;
            tag.newPostsThisWeek = (tag.newPostsThisWeek || 0) + 1;
            await tag.save();
            console.log('Updated tag stats:', tag.name, 'Posts:', tag.postsCount);
          }
        }
      } catch (error) {
        console.error('Error finding/creating tag:', error);
        continue;
      }
      
      if (tag) {
        processedTags.push(tag.name);
      }
    }

    // Get removed tags to update their counts
    const removedTags = post.tags.filter(tag => !processedTags.includes(tag));
    
    // Update removed tags counts
    for (const tagName of removedTags) {
      try {
        const tag = await Tag.findOne({ name: tagName });
        if (tag && tag.postsCount > 0) {
          tag.postsCount -= 1;
          await tag.save();
          console.log('Decreased tag count for:', tag.name, 'New count:', tag.postsCount);
        }
      } catch (error) {
        console.error('Error updating removed tag:', error);
      }
    }

    // Update post tags
    post.tags = processedTags;
    await post.save();

    // Manuell Tag-Statistiken für alle hinzugefügten Tags aktualisieren
    const updatedTags = await Promise.all(processedTags.map(async (tagName) => {
      const tag = await Tag.findOne({ name: tagName });
      if (tag) {
        const actualPostCount = await Post.countDocuments({ tags: tagName });
        if (tag.postsCount !== actualPostCount) {
          tag.postsCount = actualPostCount;
          await tag.save();
          console.log('Fixed tag count for:', tagName, 'to:', actualPostCount);
        }
        return {
          id: tag.id || tag._id?.toString(),
          name: tag.name,
          count: tag.postsCount
        };
      }
      return null;
    }));

    return NextResponse.json({
      success: true,
      message: 'Tags updated successfully',
      tags: updatedTags.filter(Boolean)
    });
  } catch (error) {
    console.error('Error updating tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 