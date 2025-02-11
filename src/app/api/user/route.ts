import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User'; // lowercase 'user' instead of 'User'
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email })
      .select('username email name bio createdAt lastSeen');

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Update lastSeen  
    await User.findOneAndUpdate(
      { email: session.user.email },
      { lastSeen: new Date() }
    );

    return NextResponse.json(user);
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const { username, name, bio, email } = await req.json();
    console.log('Received data:', { username, name, bio, email });

    await dbConnect();
    
    if (username) {
      const existingUser = await User.findOne({
        email: { $ne: session.user.email },
        username
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username bereits vergeben' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: { 
          username, 
          name,
          bio: bio || '',
          email,
          lastSeen: new Date()
        }
      },
      { new: true }
    ).select('username email name bio createdAt lastSeen');

    console.log('Updated user:', updatedUser);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
