import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import dbConnect from './db/mongodb';
import { cookies } from 'next/headers';

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
};

export async function withAuth(handler) {
  return async (req) => {
    try {
      // Session-Authentifizierung
      const session = await getServerSession(authOptions);
      
      if (!session || !session.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Rufe den Handler mit der Session auf
      return handler(session);
    } catch (error) {
      console.error('Auth error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

export async function withModeratorAuth<T>(
  handler: (session: Awaited<ReturnType<typeof getServerSession>>) => Promise<T>
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Prüfen, ob Benutzer Admin oder Moderator ist
    if (!['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    const result = await handler(session);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// Für Admin-spezifische Endpoints 
export async function withAdminAuth<T>(
  handler: (session: Awaited<ReturnType<typeof getServerSession>>) => Promise<T>
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Prüfen, ob Benutzer Admin ist
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    const result = await handler(session);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return { data };
}

export function createErrorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

// Hilfsfunktion zur CSRF-Validierung
export function validateCsrfToken(req: Request): boolean {
  try {
    const csrfToken = req.headers.get('x-csrf-token');
    if (!csrfToken) return false;
    
    const cookieStore = cookies();
    const csrfCookie = cookieStore.get('next-auth.csrf-token');
    if (!csrfCookie?.value) return false;
    
    return csrfCookie.value.includes(csrfToken);
  } catch (error) {
    console.error('Error validating CSRF token:', error);
    return false;
  }
}
