import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { rateLimit } from '@/lib/rateLimit';

// Username validation regex - updated to limit to 16 characters max
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,16}$/;
// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = rateLimit(`register_${ip}`, 5, 60);
    if (rateLimitResult) return rateLimitResult;

    await dbConnect();
    const body = await req.json();
    
    // Input validation
    const { username, email, password } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate username format
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8 || 
        !/[A-Z]/.test(password) || 
        !/[a-z]/.test(password) || 
        !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password does not meet requirements' },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check existing user (without revealing specific reason)
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

    // Create user
    const now = new Date();
    const user = await User.create({
      username,
      name: username,
      password,
      email,
      lastSeen: now,
      createdAt: now,
      bio: '',
    });

    // Return minimal success response
    return NextResponse.json({
      message: 'Registration successful',
      userId: user._id
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
        { status: 500 }
    );
  }
}
