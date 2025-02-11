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
    
    const user = await User.findOne({ username })
      .select('username email bio createdAt lastSeen role');

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Update lastSeen silently
    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

    return NextResponse.json({
      username: user.username,
      bio: user.bio || '',
      createdAt: user.createdAt,
      lastSeen: user.lastSeen,
      role: user.role,
      isPremium: user.role === 'premium',
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
