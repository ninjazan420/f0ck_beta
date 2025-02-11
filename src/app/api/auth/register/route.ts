import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, email, password } = await req.json();

    // Validierung
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 6 Zeichen lang sein' },
        { status: 400 }
      );
    }

    // Prüfen ob Benutzer bereits existiert
    const existingUser = await User.findOne({ 
      $or: [
        { username },
        ...(email ? [{ email }] : [])
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username oder Email bereits vergeben' },
        { status: 400 }
      );
    }

    // Benutzer erstellen
    const now = new Date();
    const user = await User.create({
      username,
      name: username, // Username als initialer Name
      password, // Wird durch das pre-save Hook in models/User.ts gehasht
      email,
      lastSeen: now,
      createdAt: now,
      bio: '',
    });

    return NextResponse.json({
      message: 'Registrierung erfolgreich',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastSeen: user.lastSeen
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist bei der Registrierung aufgetreten' },
      { status: 500 }
    );
  }
}
