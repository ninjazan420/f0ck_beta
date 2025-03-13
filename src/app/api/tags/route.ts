import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Tag from '@/models/Tag';
import Post from '@/models/Post';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'most_used';
    const author = searchParams.get('author') || '';
    const usedBy = searchParams.get('usedBy') || '';
    const timeRange = searchParams.get('timeRange') || 'all';
    const minPosts = parseInt(searchParams.get('minPosts') || '0');
    
    await dbConnect();

    // Aktualisiere die Tag-Statistiken
    await updateTagStats();
    
    // Such- und Sortierparameter
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (minPosts > 0) {
      query.postsCount = { $gte: minPosts };
    }
    
    // Filter nach Autor
    if (author) {
      const authorUser = await User.findOne({ username: { $regex: author, $options: 'i' } });
      if (authorUser) {
        // Finde Posts des Autors
        const authorPosts = await Post.find({ author: authorUser._id });
        const authorTagNames = authorPosts.flatMap(post => post.tags);
        query.name = { ...(query.name || {}), $in: [...new Set(authorTagNames)] };
      } else {
        // Wenn Autor nicht gefunden, leere Ergebnisse zurückgeben
        return NextResponse.json({
          tags: [],
          pagination: { total: 0, page, limit, totalPages: 0 }
        });
      }
    }
    
    // Filter nach Tags, die von bestimmtem User verwendet werden
    if (usedBy) {
      const user = await User.findOne({ username: { $regex: usedBy, $options: 'i' } });
      if (user) {
        // Suche nach favorisierten Tags oder Tags in Likes
        const userPosts = await Post.find({ 
          _id: { $in: [...(user.favorites || []), ...(user.likes || [])] } 
        });
        const userTagNames = userPosts.flatMap(post => post.tags);
        query.name = { ...(query.name || {}), $in: [...new Set(userTagNames)] };
      } else {
        // Wenn User nicht gefunden, leere Ergebnisse zurückgeben
        return NextResponse.json({
          tags: [],
          pagination: { total: 0, page, limit, totalPages: 0 }
        });
      }
    }
    
    // Zeitraum-Filter hinzufügen
    if (timeRange !== 'all') {
      let dateFilter = new Date();
      switch (timeRange) {
        case 'day':
          dateFilter.setDate(dateFilter.getDate() - 1);
          query.newPostsToday = { $gt: 0 };
          break;
        case 'week':
          dateFilter.setDate(dateFilter.getDate() - 7);
          query.newPostsThisWeek = { $gt: 0 };
          break;
        case 'month':
          dateFilter.setMonth(dateFilter.getMonth() - 1);
          // Hier müssten wir ein neues Feld 'newPostsThisMonth' im Schema haben
          // Für jetzt verwenden wir eine Alternative
          const monthTagNames = await getTagsWithPostsInTimeRange(dateFilter);
          query.name = { ...(query.name || {}), $in: monthTagNames };
          break;
        case 'year':
          dateFilter.setFullYear(dateFilter.getFullYear() - 1);
          const yearTagNames = await getTagsWithPostsInTimeRange(dateFilter);
          query.name = { ...(query.name || {}), $in: yearTagNames };
          break;
      }
    }
    
    // Sortieroptionen
    let sortOptions: any = {};
    switch (sortBy) {
      case 'most_used':
        sortOptions = { postsCount: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'alphabetical':
        sortOptions = { name: 1 };
        break;
      case 'trending':
        sortOptions = { newPostsThisWeek: -1, postsCount: -1 };
        break;
      default:
        sortOptions = { postsCount: -1 };
    }
    
    // Tags mit Pagination abrufen
    const skip = (page - 1) * limit;
    const tags = await Tag.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Gesamtanzahl der übereinstimmenden Tags für Pagination
    const totalCount = await Tag.countDocuments(query);
    
    return NextResponse.json({
      tags,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// Funktion zum Aktualisieren der Tag-Statistiken
async function updateTagStats() {
  try {
    // Heute, diese Woche und diesen Monat berechnen
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    // Alle Tags abrufen
    const tags = await Tag.find({});
    
    for (const tag of tags) {
      // Posts heute zählen
      const postsToday = await Post.countDocuments({
        tags: tag.name,
        createdAt: { $gte: today }
      });
      
      // Posts diese Woche zählen
      const postsThisWeek = await Post.countDocuments({
        tags: tag.name,
        createdAt: { $gte: weekStart }
      });
      
      // Gesamtanzahl der Posts
      const totalPosts = await Post.countDocuments({
        tags: tag.name
      });
      
      // Tag aktualisieren
      await Tag.findByIdAndUpdate(tag._id, {
        newPostsToday: postsToday,
        newPostsThisWeek: postsThisWeek,
        postsCount: totalPosts
      });
    }
    
    console.log('Tag statistics updated successfully');
  } catch (error) {
    console.error('Error updating tag statistics:', error);
  }
}

// Hilfsfunktion, um Tags zu finden, die Posts in einem bestimmten Zeitraum haben
async function getTagsWithPostsInTimeRange(startDate: Date) {
  // Finde Posts im gegebenen Zeitraum
  const posts = await Post.find({
    createdAt: { $gte: startDate }
  });
  
  // Extrahiere alle Tags aus diesen Posts
  const tagNames = posts.flatMap(post => post.tags);
  
  // Entferne Duplikate und gib die Liste zurück
  return [...new Set(tagNames)];
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    // Normalize tag name
    const name = body.name.toLowerCase().trim().replace(/\s+/g, '_');
    
    // Check if tag already exists
    const existingTag = await Tag.findOne({ name });
    
    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag already exists', tag: existingTag },
        { status: 409 }
      );
    }
    
    // Create new tag
    const tag = new Tag({
      name,
      aliases: body.aliases || []
    });
    
    await tag.save();
    
    return NextResponse.json({
      message: 'Tag created successfully',
      tag
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
} 