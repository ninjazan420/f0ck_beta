# Discord Integration Setup Guide

This guide explains how to configure Discord OAuth integration for authentication and account linking in your application.

## Overview

The Discord integration provides:
- User registration via Discord OAuth
- Login with existing Discord accounts
- Account linking for existing users
- Automatic avatar synchronization
- Secure token-based authentication
- Prevention of duplicate account linking

## Files Involved

### Core Components:
- `src/components/DiscordButton.tsx` - Discord authentication button with variants
- `src/lib/auth.ts` - NextAuth configuration with Discord provider
- `src/app/api/auth/link-discord/route.ts` - Account linking endpoint
- `src/app/api/user/link-discord/route.ts` - User Discord data management
- `src/models/User.ts` - User model with Discord fields
- `src/types/next-auth.d.ts` - TypeScript definitions

### Integration Points:
- `src/app/login/LoginClient.tsx` - Login page with Discord option
- `src/app/register/RegisterClient.tsx` - Registration page with Discord option
- `src/app/account/components/AccountCard.tsx` - Account linking interface

## Discord Application Setup

### 1. Create Discord Application

1. **Go to Discord Developer Portal**: https://discord.com/developers/applications
2. **Click "New Application"**
3. **Enter application name** (e.g., "YourApp Auth")
4. **Save the application**

### 2. Configure OAuth2 Settings

1. **Go to OAuth2 → General**
2. **Add Redirect URIs**:
   - Development: `http://localhost:3001/api/auth/callback/discord`
   - Production: `https://yourdomain.com/api/auth/callback/discord`
3. **Set OAuth2 Scopes**: `identify` and `email`
4. **Save changes**

### 3. Get Application Credentials

1. **Copy Client ID** from General Information
2. **Copy Client Secret** from General Information
3. **Keep these secure** - never commit to version control

## Environment Configuration

### Development Setup (.env.local)

```bash
# Discord OAuth Configuration
AUTH_DISCORD_ID=your_discord_client_id_here
AUTH_DISCORD_SECRET=your_discord_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret_here

# Database
MONGODB_URI=mongodb://localhost:27017/yourapp
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yourapp
```

### Production Setup (.env.production)

```bash
# Discord OAuth Configuration
AUTH_DISCORD_ID=your_production_discord_client_id
AUTH_DISCORD_SECRET=your_production_discord_client_secret

# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_strong_production_secret

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yourapp
```

## Domain Configuration

### Development Domains
- **Application URL**: `http://localhost:3001`
- **Discord Redirect**: `http://localhost:3001/api/auth/callback/discord`
- **Test with**: `localhost:3001` or `127.0.0.1:3001`

### Production Domains
- **Application URL**: `https://yourdomain.com`
- **Discord Redirect**: `https://yourdomain.com/api/auth/callback/discord`
- **SSL Required**: Yes (HTTPS only)

## Authentication Flow

### 1. New User Registration via Discord

```
User clicks "Register with Discord"
↓
Redirect to Discord OAuth
↓
User authorizes application
↓
Discord returns to callback with code
↓
System fetches Discord user data
↓
Check if Discord ID already exists
↓
If not exists: Create new user with Discord data
↓
If email exists: Link Discord to existing account
↓
User logged in with full account access
```

### 2. Existing User Login via Discord

```
User clicks "Login with Discord"
↓
Redirect to Discord OAuth
↓
User authorizes application
↓
System finds existing user by Discord ID
↓
User logged in immediately
```

### 3. Account Linking (Existing Users)

```
Logged-in user clicks "Link Discord" in account settings
↓
Redirect to special Discord linking endpoint
↓
System generates linking state token
↓
Discord OAuth with linking state
↓
System detects linking attempt
↓
Verify user session and link Discord account
↓
User can now login with Discord or credentials
```

## User Data Structure

Discord users get the following data automatically:

```typescript
{
  username: string,           // Discord username
  email: string,             // Discord email
  discordId: string,         // Discord user ID
  discordUsername: string,   // Discord display name
  avatar: string | null,     // Discord avatar URL
  role: 'user',             // Default role
  password: undefined        // No password for Discord-only users
}
```

## Security Features

### 1. Duplicate Prevention
- Discord accounts can only be linked to one user
- Email conflicts are handled by linking to existing accounts
- State tokens prevent CSRF attacks during linking

### 2. Account Integrity
- Discord-only users can add passwords later
- Existing users keep all their data when linking Discord
- Avatar updates are optional and user-controlled

### 3. Session Management
- JWT tokens include Discord information
- Sessions persist Discord linking status
- Secure token refresh and validation

## Testing the Integration

### 1. Test New User Registration

1. Go to `/register`
2. Click "Register with Discord"
3. Authorize on Discord
4. Verify new account creation
5. Check database for Discord fields

### 2. Test Existing User Login

1. Register a user via Discord
2. Logout
3. Go to `/login`
4. Click "Login with Discord"
5. Verify immediate login

### 3. Test Account Linking

1. Create account with email/password
2. Login and go to `/account`
3. Click "Link Discord"
4. Authorize on Discord
5. Verify Discord info appears in account
6. Test login with Discord

### 4. Test Edge Cases

1. **Email Conflict**: Register with email, then try Discord with same email
2. **Double Linking**: Try linking same Discord to multiple accounts
3. **Unlinking**: Remove Discord link and verify functionality

## Troubleshooting

### Common Issues

1. **"Invalid Client" Error**
   - Check Discord Client ID is correct
   - Verify redirect URI matches exactly
   - Ensure application is not deleted

2. **"Redirect URI Mismatch"**
   - Check NEXTAUTH_URL matches redirect URI
   - Verify protocol (http vs https)
   - Ensure no trailing slashes

3. **"User Creation Failed"**
   - Check MongoDB connection
   - Verify User model schema
   - Check for required field validation

4. **"Account Linking Failed"**
   - Verify user is logged in
   - Check session token validity
   - Ensure Discord account not already linked

### Debug Mode

Enable debug logging:

```bash
# Add to .env.local
NEXTAUTH_DEBUG=true
NODE_ENV=development
```

### Check Database

Verify user records:

```javascript
// In MongoDB shell or Compass
db.users.find({ discordId: { $exists: true } })
db.users.find({ email: "user@example.com" })
```

## Production Deployment

### 1. Environment Setup

- Use strong, unique NEXTAUTH_SECRET
- Set correct production domain
- Use production Discord application
- Enable HTTPS/SSL

### 2. Discord Application

- Create separate production Discord app
- Set production redirect URIs
- Use production credentials
- Monitor usage and rate limits

### 3. Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Rate limiting configured
- [ ] Error logging enabled
- [ ] Session security configured

## API Endpoints

### Authentication Endpoints
- `GET /api/auth/signin` - NextAuth sign in page
- `GET /api/auth/callback/discord` - Discord OAuth callback
- `GET /api/auth/link-discord` - Account linking redirect

### User Management
- `POST /api/user/link-discord` - Link Discord account
- `DELETE /api/user/link-discord` - Unlink Discord account

## Component Usage

### DiscordButton Variants

```tsx
// Login page
<DiscordButton text="Login with Discord" variant="login" />

// Register page
<DiscordButton text="Register with Discord" variant="register" />

// Account linking
<DiscordButton text="Link Discord" variant="link" />
```

## Support

If you encounter issues:

1. Check Discord Developer Portal for application status
2. Verify environment variables are set correctly
3. Check browser network tab for API errors
4. Review server logs for authentication errors
5. Test with different browsers/incognito mode

The Discord integration is now fully configured and ready for use!