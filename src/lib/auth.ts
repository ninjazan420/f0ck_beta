import { AuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import dbConnect from './db/mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { rateLimitLegacy } from '@/lib/rateLimit';
import { getServerSession } from 'next-auth/next';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username?: string;
      role: string;
      avatar?: string | null;
      bio?: string | null;
    } & DefaultSession['user']
    maxAge?: number;
  }
}

// Extend the built-in JWT types
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    email?: string | null;
    role: string;
    avatar?: string | null;
    bio?: string | null;
    stayLoggedIn?: boolean;
    exp?: number; // Ablaufzeit des Tokens
  }
}

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
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
        },
        stayLoggedIn: {
          label: 'Stay logged in',
          type: 'checkbox'
        }
      },
      async authorize(credentials, req) {
        try {
          // Validate request origin with more flexibility
          const origin = req?.headers?.origin;

          // Log the origin for debugging purposes
          console.log(`Auth request from origin: ${origin || 'unknown'}, IP: ${req?.headers?.['x-forwarded-for']?.substring(0, 7) || 'anonymous'}***`);

          // Aktiviere Origin-Validierung mit Unterstützung für localhost
          if (origin) {
            const allowedOrigins = [
              'https://f0ck.org',
              'https://www.f0ck.org',
              'http://localhost:3000',
              'http://localhost:3001',
              'http://localhost',
              'http://127.0.0.1:3000', 
              'http://127.0.0.1'
            ];

            // Prüfe, ob die Anfrage von einer erlaubten Origin kommt
            const isAllowedOrigin = allowedOrigins.some(allowed =>
              origin.toLowerCase().startsWith(allowed.toLowerCase())
            );

            if (!isAllowedOrigin) {
              console.warn(`Login attempt from unauthorized origin: ${origin}`);
              throw new Error('Unauthorized login attempt');
            }
          }

          // Apply rate limiting
          const ip = req?.headers?.['x-forwarded-for'] || 'anonymous';
          const rateLimitKey = `login_${ip}_${credentials?.username || 'unknown'}`;
          const rateLimitResult = rateLimitLegacy(rateLimitKey, 5, 60);
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

          // Prüfe, ob der Benutzer angemeldet bleiben möchte
          const stayLoggedIn = credentials.stayLoggedIn === 'true';
          console.log('Stay logged in:', stayLoggedIn);

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            avatar: user.avatar || null,
            bio: user.bio || null,
            stayLoggedIn // Füge die Information hinzu, ob der Benutzer angemeldet bleiben möchte
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
      // Spezielle Behandlung für Discord Account-Verknüpfung
      if (url.includes('discord-linked=true') || url.includes('/account')) {
        return `${baseUrl}/account?discord-linked=true`;
      }
      
      // Behandlung für Discord OAuth State (Account-Verknüpfung)
      if (url.includes('state=link-account-')) {
        return `${baseUrl}/account?discord-linked=true`;
      }
      
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
    async jwt({ token, user, trigger, session, account }) {
      // Discord OAuth Login Handling
      if (account?.provider === 'discord' && account.access_token) {
        console.log('Discord OAuth detected, processing...');
        
        try {
          // Hole Discord-Benutzerdaten
          const discordResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          });
          
          if (!discordResponse.ok) {
            console.error('Failed to fetch Discord user data');
            return token;
          }
          
          const discordUser = await discordResponse.json();
          console.log('Discord user data:', discordUser);
          
          // Prüfe, ob dies eine Account-Verknüpfung ist (basierend auf State)
          const isLinkingAccount = typeof account.state === 'string' && account.state.startsWith('link-account-');
          
          if (isLinkingAccount) {
            console.log('Account linking detected');
            // Extrahiere User-ID aus State
            const userId = typeof account.state === 'string' ? account.state.split('-')[2] : undefined;
            
            if (userId && token.id === userId) {
              // Verknüpfe Discord mit bestehendem Account
              const existingUser = await User.findById(userId);
              
              if (existingUser) {
                // Prüfe, ob Discord-Account bereits mit anderem Benutzer verknüpft ist
                const discordAlreadyLinked = await User.findOne({ discordId: discordUser.id, _id: { $ne: userId } });
                
                if (discordAlreadyLinked) {
                  console.error('Discord account already linked to another user');
                  return token;
                }
                
                existingUser.discordId = discordUser.id;
                existingUser.discordUsername = discordUser.username;
                
                // Aktualisiere Avatar falls noch keiner gesetzt ist
                if (!existingUser.avatar && discordUser.avatar) {
                  existingUser.avatar = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`;
                }
                
                await existingUser.save();
                console.log('Discord account linked to existing user');
                
                // Aktualisiere Token
                token.discordId = existingUser.discordId;
                token.discordUsername = existingUser.discordUsername;
                token.avatar = existingUser.avatar;
                
                return token;
              }
            }
            
            console.error('Invalid account linking attempt');
            return token;
          }
          
          // Normale Discord-Anmeldung (nicht Account-Verknüpfung)
          // Prüfe, ob bereits ein Benutzer mit dieser Discord-ID existiert
          const existingUserWithDiscord = await User.findOne({ discordId: discordUser.id });
          
          if (existingUserWithDiscord) {
            console.log('Found existing user with Discord ID:', existingUserWithDiscord._id);
            // Benutzer mit dieser Discord-ID existiert bereits, logge ihn ein
            token.id = existingUserWithDiscord._id.toString();
            token.username = existingUserWithDiscord.username;
            token.email = existingUserWithDiscord.email;
            token.role = existingUserWithDiscord.role;
            token.avatar = existingUserWithDiscord.avatar;
            token.bio = existingUserWithDiscord.bio;
            token.discordId = existingUserWithDiscord.discordId;
            token.discordUsername = existingUserWithDiscord.discordUsername;
            return token;
          }
          
          // Prüfe, ob ein Benutzer mit der Discord-E-Mail bereits existiert
          const existingUserWithEmail = await User.findOne({ email: discordUser.email });
          
          if (existingUserWithEmail) {
            console.log('Found existing user with email, linking Discord account');
            // Verknüpfe Discord-Account mit bestehendem Benutzer
            existingUserWithEmail.discordId = discordUser.id;
            existingUserWithEmail.discordUsername = discordUser.username;
            
            // Aktualisiere Avatar falls noch keiner gesetzt ist
            if (!existingUserWithEmail.avatar && discordUser.avatar) {
              existingUserWithEmail.avatar = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`;
            }
            
            await existingUserWithEmail.save();
            console.log('Successfully linked Discord account to existing user');
            
            token.id = existingUserWithEmail._id.toString();
            token.username = existingUserWithEmail.username;
            token.email = existingUserWithEmail.email;
            token.role = existingUserWithEmail.role;
            token.avatar = existingUserWithEmail.avatar;
            token.bio = existingUserWithEmail.bio;
            token.discordId = existingUserWithEmail.discordId;
            token.discordUsername = existingUserWithEmail.discordUsername;
            return token;
          }
          
          // Erstelle neuen Benutzer aus Discord-Daten
          console.log('Creating new user from Discord data');
          const newUser = new User({
            username: discordUser.username,
            email: discordUser.email,
            discordId: discordUser.id,
            discordUsername: discordUser.username,
            avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
            role: 'user',
            // Kein Passwort für Discord-Benutzer
          });
          
          await newUser.save();
          console.log('New Discord user created:', newUser._id);
          
          token.id = newUser._id.toString();
          token.username = newUser.username;
          token.email = newUser.email;
          token.role = newUser.role;
          token.avatar = newUser.avatar;
          token.bio = newUser.bio;
          token.discordId = newUser.discordId;
          token.discordUsername = newUser.discordUsername;
          
        } catch (error) {
          console.error('Error processing Discord OAuth:', error);
        }
      }
      // Wenn ein neuer Benutzer angemeldet wird (Credentials)
      else if (user) {
        // Debug-Ausgabe für JWT-Token-Aktualisierung
        console.log('JWT update - user bio:', user.bio);

        token.id = user.id;
        token.username = user.username;
        token.email = user.email || null;
        token.role = user.role;
        token.avatar = user.avatar || null;
        token.bio = user.bio || null;

        // Speichere die Information, ob der Benutzer angemeldet bleiben möchte
        if (user.stayLoggedIn !== undefined) {
          token.stayLoggedIn = user.stayLoggedIn;
          console.log('JWT updated - stay logged in:', user.stayLoggedIn);

          // Setze die Ablaufzeit des Tokens basierend auf der "Angemeldet bleiben"-Option
          if (user.stayLoggedIn) {
            // 30 Tage bei "Angemeldet bleiben"
            const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
            // Wir setzen keinen expliziten exp-Wert mehr, da dies von NextAuth.js
            // basierend auf der maxAge-Einstellung in der Session-Konfiguration gehandhabt wird
            console.log('Token configured for 30 days (stay logged in)');
          } else {
            // 8 Stunden bei normalem Login
            const eightHoursInSeconds = 8 * 60 * 60;
            // Wir setzen keinen expliziten exp-Wert mehr, da dies von NextAuth.js
            // basierend auf der maxAge-Einstellung in der Session-Konfiguration gehandhabt wird
            console.log('Token configured for 8 hours (standard login)');
          }
        }

        // Debug-Ausgabe nach JWT-Token-Aktualisierung
        console.log('JWT updated - token bio:', token.bio);
      }

      // Handle session updates (when updateSession is called)
      if (trigger === 'update' && session) {
        console.log('JWT callback triggered by session update');
        
        // Update token with new session data
        if (session.user) {
          if (session.user.avatar !== undefined) {
            token.avatar = session.user.avatar;
            console.log('JWT token avatar updated to:', token.avatar);
          }
          if (session.user.bio !== undefined) {
            token.bio = session.user.bio;
            console.log('JWT token bio updated to:', token.bio);
          }
          if (session.user.username !== undefined) {
            token.username = session.user.username;
          }
          if (session.user.email !== undefined) {
            token.email = session.user.email;
          }
          if (session.user.role !== undefined) {
            token.role = session.user.role;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Debug-Ausgabe für Session-Aktualisierung
        console.log('Session update - token bio:', token.bio);

        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email || undefined;
        session.user.role = token.role;
        session.user.avatar = token.avatar || null;
        session.user.bio = token.bio || null;
        (session.user as any).discordId = token.discordId;
        (session.user as any).discordUsername = token.discordUsername;

        // Setze die Ablaufzeit der Session basierend auf der "Angemeldet bleiben"-Option
        if (token.stayLoggedIn) {
          // Wenn der Benutzer angemeldet bleiben möchte, setze die maximale Dauer auf 30 Tage
          session.maxAge = 30 * 24 * 60 * 60; // 30 Tage in Sekunden
          console.log('Session maxAge set to 30 days');
        } else {
          // Ansonsten setze die maximale Dauer auf 8 Stunden
          session.maxAge = 8 * 60 * 60; // 8 Stunden in Sekunden
          console.log('Session maxAge set to 8 hours');
        }

        // Debug-Ausgabe nach Session-Aktualisierung
        console.log('Session updated - session bio:', session.user.bio);
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    // Setze die maximale Dauer auf 30 Tage als Standard
    // Die tatsächliche Dauer wird in den Callbacks basierend auf stayLoggedIn angepasst
    maxAge: 30 * 24 * 60 * 60, // 30 Tage in Sekunden
  },
  jwt: {
    // Setze die maximale Dauer auf 30 Tage als Standard
    // Die tatsächliche Dauer wird in den Callbacks basierend auf stayLoggedIn angepasst
    maxAge: 30 * 24 * 60 * 60, // 30 Tage in Sekunden
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Keine Domain für localhost setzen, damit Cookies funktionieren
        domain: process.env.NODE_ENV === 'production' ? '.f0ck.org' : undefined
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Keine Domain für localhost setzen, damit Cookies funktionieren
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
        // Keine Domain für CSRF-Token, damit es mit localhost funktioniert
      }
    }
  }
};

export const withModeratorAuth = async (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request) => {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!session.user || !['admin', 'moderator'].includes(session.user.role)) {
      return new Response('Forbidden', { status: 403 });
    }

    return handler(req);
  };
};
