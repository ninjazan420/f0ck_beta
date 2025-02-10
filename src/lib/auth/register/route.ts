import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

class CustomError extends Error {
  status?: number;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, email, password } = await req.json();

    // Check ob User existiert
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username bereits vergeben' },
        { status: 400 }
      );
    }

    // Neuen User erstellen
    const user = await User.create({
      username,
      email,
      password
    });

    return NextResponse.json({
      message: 'User erfolgreich erstellt',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err: unknown) {
    const error = err as CustomError;
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Server Error' },
      { status: error.status || 500 }
    );
  }
}