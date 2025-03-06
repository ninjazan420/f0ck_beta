import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

interface UserQuery {
  $and?: Array<Record<string, unknown>>; // Statt any einen spezifischeren Typ verwenden
  $or?: Array<Record<string, unknown>>;  // Statt any einen spezifischeren Typ verwenden
}

// Optimierte Query-Building
const buildQuery = (search: string, roles: string[], isPremium: string | null, timeRange: string | null): UserQuery => {
  const query: UserQuery = { $and: [] };
  
  if (search) {
    query.$and!.push({
      $or: [
        { username: { $regex: new RegExp(search, 'i') } },
        { bio: { $regex: new RegExp(search, 'i') } }
      ]
    });
  }

  const roleMapping = {
    member: 'user',
    premium: 'premium',
    moderator: 'moderator',
    admin: 'admin',
    banned: 'banned'
  };

  if (roles.length > 0) {
    query.$and!.push({
      $or: roles.map(role => ({ role: roleMapping[role as keyof typeof roleMapping] }))
    });
  }

  if (isPremium) {
    query.$and!.push({ role: isPremium === 'true' ? 'premium' : { $ne: 'premium' } });
  }

  // Filter by registration period (createdAt)
  if (timeRange && timeRange !== 'all') {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1); // Last 24 hours
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7); // Last 7 days
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1); // Last 30 days
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1); // Last year
        break;
    }
    
    query.$and!.push({ createdAt: { $gte: startDate } });
  }

  return query.$and!.length ? query : {};
};

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'lastSeen';
    const roles = searchParams.get('roles')?.split(',') || [];
    const isPremium = searchParams.get('isPremium');
    const timeRange = searchParams.get('timeRange') || 'all';

    const query = buildQuery(search, roles, isPremium, timeRange);

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

    const [users, total] = await Promise.all([
      User.aggregate([
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
              $mergeObjects: {
                uploads: { $size: { $ifNull: ["$uploads", []] } },
                comments: { $size: { $ifNull: ["$comments", []] } },
                favorites: { $size: { $ifNull: ["$favorites", []] } },
                likes: { $size: { $ifNull: ["$likes", []] } },
                tags: { $size: { $ifNull: ["$tags", []] } }
              }
            }
          }
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: pageSize }
      ]),
      User.countDocuments(query)
    ]);

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
