import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Tag from '@/models/Tag';
import Post from '@/models/Post';
import User from '@/models/User';
import { withAuth, createErrorResponse } from '@/lib/api-utils';

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
    const creator = searchParams.get('creator') || '';
    
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
    
    // Filter für den Ersteller
    if (creator) {
      // Finde zuerst den Benutzer anhand des Benutzernamens
      const creatorUser = await User.findOne({ username: creator }).select('_id');
      if (creatorUser) {
        query.creator = creatorUser._id;
      } else {
        // Wenn kein Benutzer gefunden wurde, gib leere Ergebnisse zurück
        return NextResponse.json({
          tags: [],
          totalTags: 0,
          currentPage: page,
          totalPages: 0
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

    // Erste Option: strictPopulate auf false setzen
    const [tags, totalCount] = await Promise.all([
      Tag.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate({ 
          path: 'creator', 
          select: 'username', 
          strictPopulate: false  // Diese Option erlaubt das Populieren von nicht im Schema definierten Pfaden
        })
        .lean(),
      Tag.countDocuments(query)
    ]);

    // Alternative, falls obige Lösung nicht funktioniert:
    // Tags ohne populate abrufen und dann manuell anreichern
    /*
    const [tags, totalCount] = await Promise.all([
      Tag.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Tag.countDocuments(query)
    ]);

    // Ersteller-IDs sammeln und in einem separaten Schritt abfragen
    const creatorIds = tags
      .filter(tag => tag.creator)
      .map(tag => tag.creator);

    if (creatorIds.length > 0) {
      const creators = await User.find({ _id: { $in: creatorIds } })
        .select('_id username')
        .lean();
      
      // Ersteller-Map erstellen
      const creatorMap = {};
      creators.forEach(creator => {
        creatorMap[creator._id.toString()] = creator.username;
      });
      
      // Tags mit Erstellernamen anreichern
      tags.forEach(tag => {
        if (tag.creator && creatorMap[tag.creator.toString()]) {
          tag.creatorUsername = creatorMap[tag.creator.toString()];
        } else {
          tag.creatorUsername = null;
        }
      });
    }
    */
    
    return NextResponse.json({
      tags: tags,
      pagination: {
        total: totalCount,
        page: page,
        perPage: limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
  console.log("POST /api/tags - Anfrage erhalten");
  
  return withAuth(async (request, session) => {
    console.log("withAuth erfolgreich, User-ID:", session.user.id);
    try {
      await dbConnect();
      
      // Hier den Request-Body loggen
      const requestBody = await request.json();
      console.log("Request body:", requestBody);
      
      const { name, aliases } = requestBody;
      
      if (!name || typeof name !== 'string') {
        return createErrorResponse('Valid tag name is required');
      }
      
      // Überprüfen, ob das Tag bereits existiert
      const existingTag = await Tag.findOne({ 
        $or: [
          { name: name.toLowerCase() },
          { aliases: name.toLowerCase() }
        ]
      });
      
      if (existingTag) {
        return createErrorResponse('Tag already exists');
      }
      
      // Den aktuellen Benutzer als Ersteller hinzufügen
      const user = await User.findById(session.user.id);
      
      console.log("Creating tag with creator:", session.user.id, "User found:", !!user);
      
      if (!user) {
        return createErrorResponse('User not found');
      }
      
      // Tag erstellen
      const newTag = new Tag({
        id: name.toLowerCase(),
        name: name.toLowerCase(),
        creator: user._id, // Benutzer als Ersteller speichern
        aliases: aliases || []
      });
      
      await newTag.save();
      
      // Tag-ID zum Benutzer hinzufügen
      user.tags = user.tags || [];
      user.tags.push(newTag._id);
      await user.save();
      
      return NextResponse.json({
        success: true,
        tag: {
          id: newTag.id,
          name: newTag.name,
          creator: user.username,
          aliases: newTag.aliases,
          createdAt: newTag.createdAt
        }
      });
      
    } catch (error) {
      console.error('Error creating tag:', error);
      return createErrorResponse('Internal server error');
    }
  });
} 