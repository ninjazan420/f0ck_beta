import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    await dbConnect();
    
    // Suche erst nach Email, dann nach Username
    const user = await User.findOne({
      $or: [
        { email: session.user.email },
        { username: session.user.name }
      ]
    }).select('username email name bio createdAt lastSeen stats');

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Update lastSeen
    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

    // Stelle sicher, dass alle Werte definiert sind
    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const { username, name, bio, email } = await req.json();
    await dbConnect();
    
    // Finde Benutzer basierend auf Session
    let user = await User.findOne({
      $or: [
        { email: session.user.email },
        { username: session.user.name }
      ]
    });

    // Wenn kein Benutzer gefunden, erstelle einen neuen
    if (!user) {
      user = await User.create({
        email: email || session.user.email,
        username: username || session.user.name,
        name: name || session.user.name,
        bio: bio || '',
        role: 'user',
        createdAt: new Date(),
        lastSeen: new Date(),
        stats: {
          uploads: 0,
          comments: 0,
          favorites: 0,
          likes: 0,
          tags: 0
        }
      });
    } else {
      // Prüfe Username-Verfügbarkeit
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return NextResponse.json(
            { error: 'Username bereits vergeben' },
            { status: 400 }
          );
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
    }

    return NextResponse.json({
      username: user.username,
      email: user.email,
      name: user.name,
      bio: user.bio,
      createdAt: user.createdAt,
      lastSeen: user.lastSeen,
      stats: user.stats
    });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
