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

    // Prepare update object with only fields that should be updated
    const updateFields: Record<string, any> = {
      lastSeen: new Date() // Always update lastSeen
    };

    // Only include fields that were provided in the request
    if (username) updateFields.username = username;
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    // Special handling for bio - allow empty string
    if (bio !== undefined) {
      updateFields.bio = bio;
      console.log('Setting bio to:', bio);
    }

    // Update existing user
    user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateFields },
      { new: true }
    );

    // Debug-Ausgabe nach dem Update
    console.log('Updated user bio:', user.bio);

    // Fetch the updated user directly to ensure we have the most accurate data
    const updatedUser = await User.findById(user._id).lean();

    if (!updatedUser) {
      return createErrorResponse('User not found after update', 404);
    }

    // Calculate stats manually to ensure accuracy
    const stats = {
      uploads: Array.isArray(updatedUser.uploads) ? updatedUser.uploads.length : 0,
      comments: Array.isArray(updatedUser.comments) ? updatedUser.comments.length : 0,
      favorites: Array.isArray(updatedUser.favorites) ? updatedUser.favorites.length : 0,
      likes: Array.isArray(updatedUser.likes) ? updatedUser.likes.length : 0,
      dislikes: Array.isArray(updatedUser.dislikes) ? updatedUser.dislikes.length : 0,
      tags: Array.isArray(updatedUser.tags) ? updatedUser.tags.length : 0
    };

    // Add stats to the user object
    const userWithStats = {
      ...updatedUser,
      premium: updatedUser.role === 'premium',
      stats
    };

    // Debug-Ausgabe der Ergebnisse
    console.log('Updated user bio:', userWithStats.bio);

    const response = {
      username: userWithStats.username,
      email: userWithStats.email,
      name: userWithStats.name,
      bio: userWithStats.bio,
      createdAt: userWithStats.createdAt,
      lastSeen: userWithStats.lastSeen,
      role: userWithStats.role,
      premium: userWithStats.premium,
      stats: userWithStats.stats
    };

    // Debug-Ausgabe der Antwort
    console.log('API response bio:', response.bio);

    return response;
  });
}
