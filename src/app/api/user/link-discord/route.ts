import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { discordId, discordUsername, avatar } = await request.json();

    if (!discordId || !discordUsername) {
      return NextResponse.json(
        { error: 'Discord ID and username are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if Discord account is already linked to another user
    const existingDiscordUser = await User.findOne({ discordId });
    if (existingDiscordUser && existingDiscordUser._id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'This Discord account is already linked to another user' },
        { status: 409 }
      );
    }

    // Update current user with Discord information
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    user.discordId = discordId;
    user.discordUsername = discordUsername;
    
    // Update avatar if user doesn't have one or if they want to use Discord avatar
    if (avatar && (!user.avatar || user.avatar === '')) {
      user.avatar = avatar;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Discord account linked successfully',
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error('Error linking Discord account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove Discord linking
    user.discordId = undefined;
    user.discordUsername = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Discord account unlinked successfully'
    });
  } catch (error) {
    console.error('Error unlinking Discord account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}