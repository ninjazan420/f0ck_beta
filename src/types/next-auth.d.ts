import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      email?: string;  // Optional
    }
  }

  interface User {
    id: string;
    username: string;
    email?: string;  // Optional
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
  }
}
