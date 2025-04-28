import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    await dbConnect();

    // Verwende eine Aggregation, um die Statistiken korrekt zu berechnen
    // Case-insensitive Suche nach dem Benutzernamen
    const users = await User.aggregate([
      {
        $match: {
          username: { $regex: new RegExp(`^${username}$`, 'i') }
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

    // Hole die aktuelle Session
    const session = await getServerSession(authOptions);

    // Update lastSeen nur, wenn der Benutzer sein eigenes Profil aufruft
    if (session?.user && session.user.username?.toLowerCase() === user.username.toLowerCase()) {
      await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });
    }

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
