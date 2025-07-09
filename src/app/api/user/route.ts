import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Session-Authentifizierung
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Use aggregation to get accurate statistics like in /api/users/[username]
    const users = await User.aggregate([
      {
        $match: { _id: new Types.ObjectId(session.user.id) }
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
          username: 1,
          email: 1,
          bio: 1,
          createdAt: 1,
          lastSeen: 1,
          role: 1,
          avatar: 1,
          favorites: 1,
          likes: 1,
          dislikes: 1,
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

    if (!users || users.length === 0) {
      console.error('User not found with ID:', session.user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Fallback if stats are missing
    if (!user.stats) {
      console.warn('Stats missing from aggregation, using fallback');
      user.stats = {
        uploads: 0,
        comments: 0,
        favorites: Array.isArray(user.favorites) ? user.favorites.length : 0,
        likes: Array.isArray(user.likes) ? user.likes.length : 0,
        dislikes: Array.isArray(user.dislikes) ? user.dislikes.length : 0,
        tags: 0
      };
    }

    // Debug-Ausgabe
    console.log('Found user:', {
      id: user._id,
      username: user.username,
      bioExists: !!user.bio,
      bioLength: user.bio?.length || 0
    });

    // Update lastSeen in einem separaten Aufruf
    User.findByIdAndUpdate(user._id, { lastSeen: new Date() })
      .then(() => console.log('Updated lastSeen for user:', user.username))
      .catch(err => console.error('Error updating lastSeen:', err));

    // Use the calculated stats from aggregation
    const stats = user.stats;

    console.log('User stats from aggregation:', stats);

    // Bereite die Antwort vor
    const response = {
      username: user.username || '',
      email: user.email || '',
      name: user.name || '',
      bio: user.bio || '', // Stelle sicher, dass bio immer einen String-Wert hat
      createdAt: user.createdAt || new Date(),
      lastSeen: user.lastSeen || new Date(),
      role: user.role || 'user',
      premium: user.role === 'premium',
      avatar: user.avatar || null,
      hasPassword: !!user.password,
      discordId: user.discordId || null,
      stats
    };

    // Debug-Ausgabe der Antwort
    console.log('API response:', {
      username: response.username,
      bioLength: response.bio?.length || 0
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/user:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    // Session-Authentifizierung
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parsen der Anfrage
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request' },
        { status: 400 }
      );
    }

    const { username, name, bio, email } = requestData;

    await dbConnect();

    // Finde den Benutzer
    let user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prüfe Username-Verfügbarkeit
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Debug-Ausgabe vor dem Update
    console.log('Updating user profile:', {
      id: session.user.id,
      currentUsername: user.username,
      newUsername: username,
      currentBio: user.bio,
      newBio: bio,
      willUpdateBio: bio !== undefined
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
    try {
      user = await User.findByIdAndUpdate(
        session.user.id,
        { $set: updateFields },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Error updating user' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found after update' },
        { status: 404 }
      );
    }

    // Debug-Ausgabe nach dem Update
    console.log('Updated user bio:', user.bio);

    // Calculate stats using aggregation for consistency
    const userWithStats = await User.aggregate([
      {
        $match: { _id: user._id }
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

    const stats = userWithStats[0]?.stats || {
      uploads: 0,
      comments: 0,
      favorites: 0,
      likes: 0,
      dislikes: 0,
      tags: 0
    };

    // Prepare response
    const response = {
      username: user.username || '',
      email: user.email || '',
      name: user.name || '',
      bio: user.bio || '',
      createdAt: user.createdAt || new Date(),
      lastSeen: user.lastSeen || new Date(),
      role: user.role || 'user',
      premium: user.role === 'premium',
      avatar: user.avatar || null,
      hasPassword: !!user.password,
      discordId: user.discordId || null,
      stats
    };

    // Debug-Ausgabe der Antwort
    console.log('API response:', {
      username: response.username,
      bioLength: response.bio?.length || 0,
      bio: response.bio
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in PUT /api/user:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
