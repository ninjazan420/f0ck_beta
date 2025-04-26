import type { DefaultSession } from "next-auth"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    username?: string
    email?: string
    role: 'user' | 'premium' | 'moderator' | 'admin' | 'banned'
    avatar?: string | null
    bio?: string | null
    stayLoggedIn?: boolean
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      username?: string
      email?: string
      role: 'user' | 'premium' | 'moderator' | 'admin' | 'banned'
      avatar?: string | null
      name?: string | null
      image?: string | null
      bio?: string | null
    } & DefaultSession["user"]
    maxAge?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username?: string
    role: 'user' | 'premium' | 'moderator' | 'admin' | 'banned'
    avatar?: string | null
    bio?: string | null
    stayLoggedIn?: boolean
    exp?: number // Ablaufzeit des Tokens
  }
}
