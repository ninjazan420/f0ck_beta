import { AuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './db/mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rateLimit';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username?: string;
      role: string;
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
          // Validate request origin
          const origin = req?.headers?.origin;
          const allowedOrigins = [process.env.NEXTAUTH_URL];
          if (!origin || !allowedOrigins.includes(origin)) {
            throw new Error('Invalid request origin');
          }

          // Apply rate limiting
          const ip = req?.headers?.['x-forwarded-for'] || 'anonymous';
          const rateLimitResult = rateLimit(`login_${ip}`, 5, 60);
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
            // Use same timing as successful login to prevent timing attacks
            await bcrypt.compare('dummy', '$2a$10$DUMMY_HASH_FOR_TIMING');
            throw new Error('Invalid credentials');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid credentials');
          }

          // For admin/mod routes, check if user has required role
          const path = req?.url || '';
          if ((path.includes('/admin') || path.includes('/moderation')) && 
              (!user.role || !['admin', 'moderator'].includes(user.role))) {
            throw new Error('Insufficient permissions');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email || undefined;
        session.user.role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};
