import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    await dbConnect();
    
    // Verwende eine Aggregation, um die Statistiken korrekt zu berechnen
    const users = await User.aggregate([
      { $match: { username } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'author',
          as: 'userComments'
        }
      },
      {
        $project: {
          username: 1,
          email: 1,
          bio: 1,
          createdAt: 1,
          lastSeen: 1,
          role: 1,
          premium: { $eq: ["$role", "premium"] },
          avatar: 1,
          stats: {
            uploads: { $size: { $ifNull: ["$uploads", []] } },
            comments: { $size: { $ifNull: ["$userComments", []] } },
            favorites: { $size: { $ifNull: ["$favorites", []] } },
            likes: { $size: { $ifNull: ["$likes", []] } },
            dislikes: { $size: { $ifNull: ["$dislikes", []] } },
            tags: { $size: { $ifNull: ["$tags", []] } }
          }
        }
      }
    ]);

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Update lastSeen silently
    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

    return NextResponse.json({
      username: user.username,
      bio: user.bio || '',
      createdAt: user.createdAt,
      lastSeen: user.lastSeen,
      role: user.role,
      premium: user.premium,
      avatar: user.avatar,
      stats: user.stats,
      isModerator: user.role === 'moderator',
      isAdmin: user.role === 'admin'
    });

  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
