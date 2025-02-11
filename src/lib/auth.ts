import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './db/mongodb';
import User from '../models/User'; // Korrigierter Pfad mit korrekter Schreibweise
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username und Passwort erforderlich');
        }

        await dbConnect();
        
        // Suche nach Benutzer
        const user = await User.findOne({ username: credentials.username });
        
        if (!user) {
          throw new Error('Benutzer nicht gefunden');
        }

        // Überprüfe Passwort
        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error('Falsches Passwort');
        }

        // Gib nur sichere Benutzerdaten zurück
        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          name: user.name
        };
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
        token.username = user.username;
        token.email = user.email;
      }
      // Update token wenn Session aktualisiert wird
      if (trigger === "update" && session) {
        token.username = session.username || token.username;
        token.email = session.email || token.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.username = token.username;
        session.user.email = token.email;
      }
      return session;
    }
  }
};
