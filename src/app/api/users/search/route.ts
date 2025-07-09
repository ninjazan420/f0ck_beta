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

    // Establish database connection
    await dbConnect();
    
    let users;
    
    if (!query || query.length < 1) {
      // Return active users for empty query
      users = await User.find({
        role: { $ne: 'banned' }
      })
      .sort({ lastSeen: -1 }) // Recently active users first
      .select('username name avatar')
      .limit(limit);
    } else {
      // Search by username or display name for query
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

    // Prepare data for response
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