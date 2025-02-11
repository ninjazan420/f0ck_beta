import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string;
    username?: string;
    email?: string;
    bio?: string; // Bio-Feld hinzufügen
  }
  
  interface Session extends DefaultSession {
    user: {
      id: string;
      username?: string;
      email?: string;
      bio?: string; // Bio-Feld hinzufügen
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
  }
}
