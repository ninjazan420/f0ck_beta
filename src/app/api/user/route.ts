import { withAuth, createErrorResponse } from '@/lib/api-utils';
import User from '@/models/User';

export async function GET() {
  return withAuth(async (session) => {
    const user = await User.findOne({
      $or: [
        { email: session.user.email },
        { username: session.user.name }
      ]
    }).select('username email name bio createdAt lastSeen stats');

    if (!user) {
      return createErrorResponse('Benutzer nicht gefunden', 404);
    }

    // Update lastSeen
    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

    return {
      username: user.username || '',
      email: user.email || '',
      name: user.name || '',
      bio: user.bio || '',
      createdAt: user.createdAt || new Date(),
      lastSeen: user.lastSeen || new Date(),
      stats: user.stats || {
        uploads: 0,
        comments: 0,
        favorites: 0,
        likes: 0,
        tags: 0
      }
    };
  });
}

export async function PUT(req: Request) {
  return withAuth(async (session) => {
    const { username, name, bio, email } = await req.json();

    let user = await User.findOne({
      $or: [
        { email: session.user.email },
        { username: session.user.name }
      ]
    });

    // Prüfe Username-Verfügbarkeit
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return createErrorResponse('Username bereits vergeben', 400);
      }
    }

    // Update existierenden Benutzer
    user = await User.findByIdAndUpdate(
      user._id,
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

    return {
      username: user.username,
      email: user.email,
      name: user.name,
      bio: user.bio,
      createdAt: user.createdAt,
      lastSeen: user.lastSeen,
      stats: user.stats
    };
  });
}
