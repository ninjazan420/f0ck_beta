import { AuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './db/mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rateLimit';
import { getServerSession } from 'next-auth/next';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username?: string;
      role: string;
      avatar?: string | null;
    } & DefaultSession['user']
  }
}

// Extend the built-in JWT types
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string;
    email?: string | null;
    role: string;
    avatar?: string | null;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { 
          label: 'Username', 
          type: 'text',
          placeholder: 'Username'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: '••••••••'
        }
      },
      async authorize(credentials, req) {
        try {
          // Validate request origin with more flexibility
          const origin = req?.headers?.origin;
          
          // Temporarily disable origin validation
          // Log the origin for debugging purposes
          console.log(`Auth request from IP: ${req?.headers?.['x-forwarded-for']?.substring(0, 7) || 'anonymous'}***`);
          
          // Skip origin validation for now
          
          // Apply rate limiting
          const ip = req?.headers?.['x-forwarded-for'] || 'anonymous';
          const rateLimitKey = `login_${ip}_${credentials?.username || 'unknown'}`;
          const rateLimitResult = rateLimit(rateLimitKey, 5, 60);
          if (rateLimitResult) {
            throw new Error('Too many attempts. Please try again later');
          }

          if (!credentials?.username || !credentials?.password) {
            throw new Error('Invalid credentials');
          }

          // Validate input length
          if (credentials.username.length > 50 || credentials.password.length > 100) {
            throw new Error('Invalid input length');
          }

          await dbConnect();
          
          // Find user and validate password with timing-safe comparison
          const user = await User.findOne({ username: credentials.username });
          
          if (!user) {
            // Konstante Zeit für Hash-Vergleich, unabhängig davon, ob Benutzer existiert
            await bcrypt.compare('dummy_password', '$2a$10$dummyHashForTimingAttackPrevention');
            throw new Error('Invalid credentials');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid credentials');
          }

          // For admin/mod routes, check if user has required role
          const path = req?.headers?.referer || '';
          if ((path.includes('/admin') || path.includes('/moderation')) && 
              (!user.role || !['admin', 'moderator'].includes(user.role))) {
            throw new Error('Insufficient permissions');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            avatar: user.avatar || null
          };
        } catch (error: Error | unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          throw new Error(errorMessage);
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow API routes
      if (url.startsWith('/api/')) {
        return url;
      }

      // If no callback URL is provided, redirect to home
      if (url.includes('/login') && !url.includes('callbackUrl')) {
        return baseUrl;
      }

      // For relative URLs, add the base URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // For absolute URLs, check if they belong to the same domain
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email || null;
        token.role = user.role;
        token.avatar = user.avatar || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email || undefined;
        session.user.role = token.role;
        session.user.avatar = token.avatar || null;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 Stunden statt 24 Stunden
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 Stunden statt 24 Stunden
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.f0ck.org' : undefined
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.f0ck.org' : undefined
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};

export const withModeratorAuth = async (handler: Function) => {
  return async (req: Request) => {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!['admin', 'moderator'].includes(session.user?.role)) {
      return new Response('Forbidden', { status: 403 });
    }

    return handler(req);
  };
};
