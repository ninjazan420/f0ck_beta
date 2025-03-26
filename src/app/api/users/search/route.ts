import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5');

    // Verbindung zur Datenbank herstellen
    await dbConnect();
    
    let users;
    
    if (!query || query.length < 1) {
      // Bei leerem Query aktive Benutzer zurückgeben
      users = await User.find({
        role: { $ne: 'banned' }
      })
      .sort({ lastActive: -1 }) // Kürzlich aktive Benutzer zuerst
      .select('username name avatar')
      .limit(limit);
    } else {
      // Bei Query nach Benutzernamen oder Anzeigenamen suchen
      users = await User.find({
        $or: [
          { username: { $regex: new RegExp(query, 'i') } },
          { name: { $regex: new RegExp(query, 'i') } }
        ],
        role: { $ne: 'banned' }
      })
      .select('username name avatar')
      .limit(limit);
    }
    
    // Bereite die Daten für die Antwort vor
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      name: user.name || user.username,
      avatar: user.avatar
    }));
    
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
} 