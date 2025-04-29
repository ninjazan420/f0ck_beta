import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Session-Authentifizierung
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Finde den Benutzer
    const user = await User.findById(session.user.id).lean();

    if (!user) {
      console.error('User not found with ID:', session.user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

    // Berechne Statistiken
    const stats = {
      uploads: Array.isArray(user.uploads) ? user.uploads.length : 0,
      comments: Array.isArray(user.comments) ? user.comments.length : 0,
      favorites: Array.isArray(user.favorites) ? user.favorites.length : 0,
      likes: Array.isArray(user.likes) ? user.likes.length : 0,
      dislikes: Array.isArray(user.dislikes) ? user.dislikes.length : 0,
      tags: Array.isArray(user.tags) ? user.tags.length : 0
    };

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

    // Calculate stats
    const stats = {
      uploads: Array.isArray(user.uploads) ? user.uploads.length : 0,
      comments: Array.isArray(user.comments) ? user.comments.length : 0,
      favorites: Array.isArray(user.favorites) ? user.favorites.length : 0,
      likes: Array.isArray(user.likes) ? user.likes.length : 0,
      dislikes: Array.isArray(user.dislikes) ? user.dislikes.length : 0,
      tags: Array.isArray(user.tags) ? user.tags.length : 0
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
