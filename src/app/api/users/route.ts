import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

interface UserQuery {
  $or?: Array<{
    username?: { $regex: string, $options: string },
    bio?: { $regex: string, $options: string },
    role?: string,
  }>;
  isPremium?: boolean;
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'lastSeen';
    const roles = searchParams.get('roles')?.split(',') || [];
    const isPremium = searchParams.get('isPremium');

    // Query bauen
    const query: UserQuery = {};
    
    // Suchfilter
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Rollenfilter
    if (roles.length > 0) {
      const roleConditions = [];
      
      if (roles.includes('member')) {
        roleConditions.push({ role: 'user' });
      }
      if (roles.includes('moderator')) {
        roleConditions.push({ role: 'moderator' });
      }
      if (roles.includes('admin')) {
        roleConditions.push({ role: 'admin' });
      }
      
      query.$or = query.$or ? [...query.$or, ...roleConditions] : roleConditions;
    }

    // Premium Filter
    if (isPremium === 'true') {
      query.isPremium = true;
    } else if (isPremium === 'false') {
      query.isPremium = false;
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
      default:
        sort = { lastSeen: -1 };
    }

    const skip = (page - 1) * limit;

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
      { $limit: limit }
    ]);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
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
