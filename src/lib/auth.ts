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
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        try {
          // Apply rate limiting - 5 login attempts per minute per IP
          const ip = req?.headers?.['x-forwarded-for'] || 'anonymous';
          const rateLimitResult = rateLimit(`login_${ip}`, 5, 60);
          if (rateLimitResult) {
            throw new Error('Please try again later');
          }

          if (!credentials?.username || !credentials?.password) {
            throw new Error('Invalid credentials');
          }

          await dbConnect();
          
          // Find user and validate password
          const user = await User.findOne({ username: credentials.username });
          
          if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
            throw new Error('Invalid credentials');
          }

          // Only return essential user data
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role
          };
        } catch (error: Error | unknown) {
          // Verwende die tatsächliche Fehlermeldung oder liefere einen Standardfehler
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          throw new Error(errorMessage);
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email || null;
        token.role = user.role;
      }
      if (trigger === "update" && session) {
        token.username = session.username || token.username;
        token.email = session.email || token.email;
        token.role = session.role || token.role;
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
  }
};
