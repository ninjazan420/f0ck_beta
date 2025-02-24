import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

interface UserQuery {
  $and?: Array<any>;
  $or?: Array<any>;
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'lastSeen';
    const roles = searchParams.get('roles')?.split(',') || [];
    const isPremium = searchParams.get('isPremium');

    // Query bauen
    const query: UserQuery = { $and: [] };
    
    // Suchfilter
    if (search) {
      query.$and!.push({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Rollenfilter
    if (roles.length > 0) {
      const roleConditions = [];
      
      if (roles.includes('member')) {
        roleConditions.push({ role: 'user' });
      }
      if (roles.includes('premium')) {
        roleConditions.push({ role: 'premium' });  // Geändert von isPremium zu role: 'premium'
      }
      if (roles.includes('moderator')) {
        roleConditions.push({ role: 'moderator' });
      }
      if (roles.includes('admin')) {
        roleConditions.push({ role: 'admin' });
      }
      
      if (roleConditions.length > 0) {
        query.$and!.push({ $or: roleConditions });
      }
    }

    // Premium Filter anpassen
    if (isPremium === 'true') {
      query.$and!.push({ role: 'premium' });  // Geändert von isPremium zu role: 'premium'
    } else if (isPremium === 'false') {
      query.$and!.push({ role: { $ne: 'premium' } });  // Geändert, um nicht-Premium Rollen zu finden
    }

    // Leeres $and entfernen wenn keine Filter gesetzt
    if (query.$and!.length === 0) {
      delete query.$and;
    }

    // Sortierung bestimmen
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'most_active':
        sort = { lastSeen: -1 };
        break;
      case 'most_posts':
        sort = { 'stats.uploads': -1 };
        break;
      case 'most_likes':
        sort = { 'stats.likes': -1 };
        break;
      default:
        sort = { lastSeen: -1 };
    }

    const skip = (page - 1) * pageSize;

    // Benutzer und Gesamtanzahl laden
    const users = await User.aggregate([
      { $match: query },
      {
        $project: {
          username: 1,
          bio: 1,
          createdAt: 1,
          lastSeen: 1,
          role: 1,
          premium: '$isPremium',
          stats: {
            uploads: { $size: { $ifNull: ["$uploads", []] } },
            comments: { $size: { $ifNull: ["$comments", []] } },
            favorites: { $size: { $ifNull: ["$favorites", []] } },
            likes: { $size: { $ifNull: ["$likes", []] } },
            tags: { $size: { $ifNull: ["$tags", []] } }
          }
        }
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: pageSize }
    ]);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / pageSize),
        page,
        limit: pageSize
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
