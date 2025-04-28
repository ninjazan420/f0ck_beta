# Authentication

This document outlines the authentication system used in the f0ck.org platform.

## Authentication Strategy

The platform uses NextAuth.js with a JWT-based credentials authentication strategy. This allows for:

- Username/password authentication
- Session persistence
- Role-based access control
- Protected API routes and pages

## Key Features

- **Optional Authentication**: Users can browse and upload anonymously
- **Enhanced Features for Registered Users**: Registered users get additional features
- **Role-Based Permissions**: Different access levels based on user roles
- **Secure Password Handling**: Passwords are hashed using bcrypt
- **Protected Routes**: Middleware protection for sensitive areas
- **Rate Limiting**: Protection against brute force attacks
- **Persistent Sessions**: "Stay logged in" option for longer sessions
- **Last Seen Tracking**: Records user's last activity timestamp

## User Roles

The platform supports the following user roles:

- **user**: Standard registered user
- **premium**: User with premium features
- **moderator**: User with content moderation abilities
- **admin**: Full administrative access
- **banned**: User prohibited from certain actions

## Authentication Flow

1. **Registration**: Users register with username and password (email optional)
2. **Login**: Users authenticate with username and password
3. **JWT Creation**: Server creates a JWT containing user data and role
4. **Session Management**: JWT is used to maintain session state
5. **Authorization Checks**: Middleware and server components check permissions

## Implementation Details

### NextAuth Configuration

The main NextAuth configuration is in `src/lib/auth.ts` and includes:

- Credentials provider setup
- JWT handling and token creation
- Session callbacks
- Cookie configuration
- Security settings

### Middleware Protection

The `src/middleware.ts` file provides route protection for sensitive areas:

```typescript
// Protected paths that require authentication
const PROTECTED_PATHS = [
  // Admin and moderation
  '/moderation',      // Moderation area
  '/admin',          // Admin area

  // Account-related paths
  '/settings',       // User settings
  '/account',        // Account management
  '/profile/edit',   // Profile editing
  '/dashboard'       // User dashboard
];
```

Requests to these paths are intercepted and checked for valid authentication.

### Registration

User registration (`/api/auth/register`) includes:

- Input validation (username format, password strength)
- Duplicate checking
- Password hashing
- User creation

### Login Rate Limiting

The authentication system implements rate limiting to prevent brute force attacks:

```typescript
const ip = req?.headers?.['x-forwarded-for'] || 'anonymous';
const rateLimitResult = rateLimit(`login_${ip}`, 5, 60);
if (rateLimitResult) {
  throw new Error('Too many attempts. Please try again later');
}
```

### Session Structure

The JWT session includes the following user information:

```typescript
{
  id: string       // MongoDB user ID
  username: string // User's username
  email?: string   // User's email (if provided)
  role: string     // User's role
  avatar?: string  // Path to user's avatar
}
```

## Using Authentication in Code

### Client-Side

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session } = useSession();

  if (session) {
    // User is authenticated
    return <div>Welcome, {session.user.username}!</div>;
  }

  // User is not authenticated
  return <div>Please log in</div>;
}
```

### Server-Side

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function ServerComponent() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === 'admin') {
    // Admin-only content
    return <AdminPanel />;
  }

  // Regular content
  return <RegularContent />;
}
```

### API Routes

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Process authenticated request
}
```

## Security Considerations

- JWT secret is stored in environment variables
- Passwords are hashed using bcrypt with 12 rounds of salting
- Rate limiting is applied to authentication endpoints
- Sessions expire after 24 hours by default (configurable with "Stay logged in")
- Secure cookies are used in production
- HTTP-only flags are set on sensitive cookies

## "Stay Logged In" Functionality

The platform implements a "Stay logged in" option during authentication:

### Implementation

```typescript
// In the login form component
const [stayLoggedIn, setStayLoggedIn] = useState(false);

// In the login handler
const result = await signIn('credentials', {
  username,
  password,
  redirect: false,
  callbackUrl: '/',
  stayLoggedIn // Pass this to the backend
});
```

### Session Duration

- **Standard Session**: 24 hours (1 day)
- **Extended Session**: 30 days when "Stay logged in" is selected

### Technical Details

The session duration is controlled in the NextAuth configuration:

```typescript
// In auth.ts
callbacks: {
  jwt: async ({ token, user, account, trigger, session }) => {
    // ... other code ...

    // Set expiration based on stayLoggedIn flag
    if (account?.stayLoggedIn) {
      token.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      token.expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    }

    return token;
  }
}
```

This implementation provides users with the flexibility to choose between convenience (longer sessions) and security (shorter sessions).