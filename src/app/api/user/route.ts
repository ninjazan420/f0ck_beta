import { withAuth, createErrorResponse } from '@/lib/api-utils';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  return withAuth(async (session: { user: { id: string } }) => {
    await dbConnect();

    // Aggregation statt einfaches Finden verwenden, um die Stats korrekt zu berechnen
    const users = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(session.user.id) } },
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
          name: 1,
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
      return createErrorResponse('Benutzer nicht gefunden', 404);
    }

    const user = users[0];

    // Update lastSeen
    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

    return {
      username: user.username || '',
      email: user.email || '',
      name: user.name || '',
      bio: user.bio || '',
      createdAt: user.createdAt || new Date(),
      lastSeen: user.lastSeen || new Date(),
      role: user.role || 'user',
      premium: user.premium || false,
      stats: user.stats || {
        uploads: 0,
        comments: 0,
        favorites: 0,
        likes: 0,
        dislikes: 0,
        tags: 0
      }
    };
  });
}

export async function PUT(req: Request) {
  return withAuth(async (session: { user: { id: string } }) => {
    const { username, name, bio, email } = await req.json();

    // Nutze auch hier die session.user.id
    let user = await User.findById(session.user.id);

    if (!user) {
      return createErrorResponse('Benutzer nicht gefunden', 404);
    }

    // Prüfe Username-Verfügbarkeit
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return createErrorResponse('Username bereits vergeben', 400);
      }
    }

    // Debug-Ausgabe vor dem Update
    console.log('Updating user bio:', {
      currentBio: user.bio,
      newBio: bio,
      willUpdate: bio !== undefined
    });

    // Update existierenden Benutzer
    user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          username: username || user.username,
          name: name || user.name,
          bio: bio !== undefined ? bio : user.bio,
          email: email || user.email,
          lastSeen: new Date()
        }
      },
      { new: true }
    );

    // Debug-Ausgabe nach dem Update
    console.log('Updated user bio:', user.bio);

    // Erneut mit Aggregation abrufen, um korrekte Stats zu haben
    const updatedUsers = await User.aggregate([
      { $match: { _id: user._id } },
      {
        $project: {
          username: 1,
          email: 1,
          name: 1,
          bio: 1,
          createdAt: 1,
          lastSeen: 1,
          role: 1,
          premium: { $eq: ["$role", "premium"] },
          stats: {
            uploads: { $size: { $ifNull: ["$uploads", []] } },
            comments: { $size: { $ifNull: ["$comments", []] } },
            favorites: { $size: { $ifNull: ["$favorites", []] } },
            likes: { $size: { $ifNull: ["$likes", []] } },
            dislikes: { $size: { $ifNull: ["$dislikes", []] } },
            tags: { $size: { $ifNull: ["$tags", []] } }
          }
        }
      }
    ]);

    const updatedUser = updatedUsers[0];

    // Debug-Ausgabe der Aggregationsergebnisse
    console.log('Aggregation result bio:', updatedUser.bio);

    const response = {
      username: updatedUser.username,
      email: updatedUser.email,
      name: updatedUser.name,
      bio: updatedUser.bio,
      createdAt: updatedUser.createdAt,
      lastSeen: updatedUser.lastSeen,
      role: updatedUser.role,
      premium: updatedUser.premium,
      stats: updatedUser.stats
    };

    // Debug-Ausgabe der Antwort
    console.log('API response bio:', response.bio);

    return response;
  });
}
