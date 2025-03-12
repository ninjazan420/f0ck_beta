import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { hash } from 'bcryptjs';

class CustomError extends Error {
  status?: number;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, email, password } = await req.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Optional email validation
    if (email && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [
        { username },
        ...(email ? [{ email }] : [])
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Registration not possible with provided details' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hash(password, 12);
    const user = await User.create({
      username,
      ...(email && { email }), // Email nur hinzufügen wenn vorhanden
      password: hashedPassword
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        ...(user.email && { email: user.email })
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