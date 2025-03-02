import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { initializeUploadDirectory } from './lib/init';

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

// Initialisiere den Upload-Ordner beim Start der Anwendung
initializeUploadDirectory();

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

  // For protected paths: Check token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
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