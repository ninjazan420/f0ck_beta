import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    username?: string
    email?: string
    role: 'user' | 'premium' | 'moderator' | 'admin' | 'banned'
  }
  
  interface Session extends DefaultSession {
    user: {
      id: string
      username?: string
      email?: string
      role: 'user' | 'premium' | 'moderator' | 'admin' | 'banned'
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username?: string
    role: 'user' | 'premium' | 'moderator' | 'admin' | 'banned'
  }
}
