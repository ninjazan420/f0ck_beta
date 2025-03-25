import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Protected paths that require authentication
const PROTECTED_PATHS = [
  // Admin and moderation
  '/moderation',      // Moderation area
  '/admin',          // Admin area
  
  // Account-related paths
  '/settings',       // User settings
  '/account',        // Account management
  '/profile/edit',   // Profile editing
  '/dashboard'       // User dashboard
];

// Neue Arrays für rollenbasierte Pfade
const ADMIN_PATHS = [
  '/admin'
];

const MODERATOR_PATHS = [
  '/moderation'
];

export async function middleware(request: NextRequest) {
  // Blockieren von direkten Subrequest-Anfragen nur in Produktion
  // oder mit Ausnahmen für bestimmte Entwicklungsumgebungen
  if (request.headers.get('x-middleware-subrequest')) {
    // Erlaube Subrequests in der Entwicklungsumgebung
    if (process.env.NODE_ENV === 'development') {
      console.log('Allowing middleware subrequest in development mode');
      const path = request.nextUrl.pathname;
      
      // Optional: Prüfe, ob der Pfad für bestimmte kritische Routen ist
      if (path.startsWith('/api/auth') || path.includes('/admin')) {
        console.warn('Blocking sensitive subrequest even in development:', path);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // In der Produktion alle Subrequests blockieren
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const path = request.nextUrl.pathname;

  // CORS für API-Routen konfigurieren
  if (path.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  // Check if this is a protected path
  const isProtectedPath = PROTECTED_PATHS.some(protectedPath => 
    path.startsWith(protectedPath)
  );
  
  // Prüfen, ob es ein Admin- oder Moderator-Pfad ist
  const isAdminPath = ADMIN_PATHS.some(adminPath => 
    path.startsWith(adminPath)
  );
  
  const isModeratorPath = MODERATOR_PATHS.some(modPath => 
    path.startsWith(modPath)
  );

  // Wenn kein geschützter Pfad, freien Zugriff erlauben
  if (!isProtectedPath && !isAdminPath && !isModeratorPath) {
    return NextResponse.next();
  }

  console.log(`Checking auth for path: ${path}`);
  
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    // Wenn kein Token vorhanden ist, zur Login-Seite umleiten
    if (!token) {
      console.log(`No auth token, redirecting to login`);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }
    
    // Rollenprüfung für Admin-Bereiche
    if (isAdminPath && token.role !== 'admin') {
      console.log(`User is not an admin, access denied to: ${path}`);
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Rollenprüfung für Moderator-Bereiche
    if (isModeratorPath && !['admin', 'moderator'].includes(token.role)) {
      console.log(`User is not a moderator or admin, access denied to: ${path}`);
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log(`User authenticated, proceeding to: ${path}`);

    // Im Middleware CSRF-Validierung überprüfen
    if (path.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      // CSRF-Token aus Header oder Cookie prüfen
      const csrfToken = request.headers.get('x-csrf-token');
      const csrfCookie = request.cookies.get('next-auth.csrf-token');
      const expectedToken = csrfCookie?.value;
      
      // Nur wenn cookies und header existieren
      if (csrfCookie && !csrfToken) {
        console.warn('CSRF token missing in request headers');
        return NextResponse.json(
          { error: 'CSRF token required' },
          { status: 403 }
        );
      }
      
      if (csrfCookie && csrfToken && !expectedToken?.includes(csrfToken)) {
        console.warn('Invalid CSRF token');
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
      }
    }

    // CSP-Header hinzufügen
    const response = NextResponse.next();
    response.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "connect-src 'self';"
    );

    return response;
  } catch (error) {
    console.error(`Error checking auth token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    loginUrl.searchParams.set('error', 'AuthCheckError');
    return NextResponse.redirect(loginUrl);
  }
}

// Configure middleware for all protected paths
export const config = {
  matcher: [
    '/moderation/:path*',
    '/admin/:path*',
    '/settings/:path*',
    '/account/:path*',
    '/profile/edit/:path*',
    '/dashboard/:path*',
    '/api/:path*' // Hinzugefügt für CORS-Behandlung
  ]
} 