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

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if this is a protected path
  const isProtectedPath = PROTECTED_PATHS.some(protectedPath => 
    path.startsWith(protectedPath)
  );

  // If not protected, allow access
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  console.log(`Checking auth for protected path: ${path}`);
  
  // For protected paths: Check token with debugging
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    console.log(`Auth token check result: ${token ? 'Token found' : 'No token'}`);

    // If no token, redirect to login
    if (!token) {
      console.log(`No auth token, redirecting to login`);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }

    console.log(`User authenticated, proceeding to: ${path}`);
    return NextResponse.next();
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
    '/dashboard/:path*'
  ]
} 