import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Erstelle Discord OAuth URL mit spezieller State für Account-Verknüpfung
  const discordClientId = process.env.AUTH_DISCORD_ID;
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  const redirectUri = `${baseUrl}/api/auth/callback/discord`;
  
  // Spezielle State für Account-Verknüpfung
  const state = `link-account-${session.user.id}-${Date.now()}`;
  
  const discordAuthUrl = new URL('https://discord.com/oauth2/authorize');
  discordAuthUrl.searchParams.set('client_id', discordClientId!);
  discordAuthUrl.searchParams.set('redirect_uri', redirectUri);
  discordAuthUrl.searchParams.set('response_type', 'code');
  discordAuthUrl.searchParams.set('scope', 'identify email');
  discordAuthUrl.searchParams.set('state', state);
  
  return NextResponse.redirect(discordAuthUrl.toString());
}