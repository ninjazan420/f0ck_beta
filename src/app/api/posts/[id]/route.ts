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

    // Post finden und Autor mit notwendigen Feldern laden
    const post = await Post.findOne({ id: id })
      .populate({
        path: 'author',
        select: 'username avatar bio role premium lastSeen createdAt uploads comments likes favorites tags'
      })
      .select('+hasCommentsDisabled +isPinned +isAd');

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

    // Füge das Upload-Datum und Status-Felder hinzu
    serializedPost.uploadDate = post.createdAt;
    serializedPost.hasCommentsDisabled = post.hasCommentsDisabled || false;
    serializedPost.isPinned = post.isPinned || false;
    serializedPost.isAd = post.isAd || false;

    // Wenn ein Autor existiert, populate die Autor-Daten mit einheitlicher Aggregation
    if (post.author) {
      // Verwende die gleiche Aggregation wie in anderen APIs für konsistente Stats
      const userStats = await User.aggregate([
        {
          $match: { _id: post.author._id }
        },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'author',
            as: 'userPosts'
          }
        },
        {
          $lookup: {
            from: 'comments',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$author', '$$userId'] },
                  status: 'approved'
                }
              }
            ],
            as: 'userComments'
          }
        },
        {
          $lookup: {
            from: 'tags',
            localField: '_id',
            foreignField: 'creator',
            as: 'userTags'
          }
        },
        {
          $project: {
            stats: {
              uploads: { $size: { $ifNull: ["$userPosts", []] } },
              comments: { $size: { $ifNull: ["$userComments", []] } },
              favorites: { $size: { $ifNull: ["$favorites", []] } },
              likes: { $size: { $ifNull: ["$likes", []] } },
              dislikes: { $size: { $ifNull: ["$dislikes", []] } },
              tags: { $size: { $ifNull: ["$userTags", []] } }
            }
          }
        }
      ]);

      const stats = userStats[0]?.stats || {
        uploads: 0,
        comments: 0,
        favorites: 0,
        likes: 0,
        dislikes: 0,
        tags: 0
      };

      serializedPost.author = post.author;
      serializedPost.uploader = {
        name: post.author.username,
        avatar: post.author.avatar,
        bio: post.author.bio,
        premium: post.author.premium || post.author.role === 'premium',
        admin: post.author.role === 'admin',
        moderator: post.author.role === 'moderator',
        joinDate: post.author.createdAt,
        stats: {
          uploads: stats.uploads,
          comments: stats.comments,
          likes: stats.likes,
          favorites: stats.favorites,
          tags: stats.tags,
          // Zusätzliche Felder für Kompatibilität
          totalPosts: stats.uploads,
          totalLikes: stats.likes,
          totalViews: 0,
          level: 1,
          xp: 0,
          xpNeeded: 100
        }
      };
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
      serializedPost.uploader = {
        name: 'Anonymous',
        stats: {}
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