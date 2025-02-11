import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

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
    const user = await User.create({
      username,
      name: username, // Username als initialer Name
      password, // Wird durch das pre-save Hook in models/User.ts gehasht
      ...(email && { email })
    });

    return NextResponse.json({
      message: 'Registrierung erfolgreich',
      user: {
        id: user._id,
        username: user.username,
        ...(user.email && { email: user.email })
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email })
      .select('username email name');

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('GET user error:', error);
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

    const { username, name } = await req.json();

    await dbConnect();
    
    // Prüfen ob Username bereits existiert (außer beim eigenen User)
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
      { $set: { username, name } },
      { new: true }
    ).select('username email name');

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('PUT user error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
