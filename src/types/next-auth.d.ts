import type { DefaultSession } from "next-auth"
import NextAuth from "next-auth"

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    email?: string | null;
    role: string;
    avatar?: string | null;
    bio?: string | null;
    stayLoggedIn?: boolean;
    discordId?: string | null;
    discordUsername?: string | null;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      email?: string | null;
      role: string;
      avatar?: string | null;
      name?: string | null;
      image?: string | null;
      bio?: string | null;
      discordId?: string | null;
      discordUsername?: string | null;
    } & DefaultSession['user'];
    maxAge?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    email?: string | null;
    role: string;
    avatar?: string | null;
    bio?: string | null;
    stayLoggedIn?: boolean;
    discordId?: string | null;
    discordUsername?: string | null;
    exp?: number; // Ablaufzeit des Tokens
  }
}
