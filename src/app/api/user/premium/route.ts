import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { getStripe } from '@/lib/stripe';

export async function GET() {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Verbindung zur Datenbank herstellen
    await dbConnect();
    
    // Benutzer aus der Datenbank abrufen
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Premium-Informationen zurückgeben
    return NextResponse.json({
      isPremium: user.role === 'premium',
      premium: user.premium || {
        isActive: false
      }
    });
  } catch (error) {
    console.error('Error fetching premium status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch premium status' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Request-Body parsen
    const { action } = await req.json();
    
    // Verbindung zur Datenbank herstellen
    await dbConnect();
    
    // Benutzer aus der Datenbank abrufen
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Stripe-Client initialisieren
    const stripe = getStripe();
    
    // Aktion ausführen
    switch (action) {
      case 'cancel': {
        // Prüfen, ob der Benutzer ein aktives Abonnement hat
        if (!user.premium?.isActive || !user.premium?.subscriptionId) {
          return NextResponse.json(
            { error: 'No active subscription' },
            { status: 400 }
          );
        }
        
        // Abonnement bei Stripe kündigen
        await stripe.subscriptions.update(user.premium.subscriptionId, {
          cancel_at_period_end: true
        });
        
        // Benutzer aktualisieren
        user.premium.cancelAtPeriodEnd = true;
        await user.save();
        
        return NextResponse.json({
          success: true,
          message: 'Subscription will be canceled at the end of the billing period'
        });
      }
      
      case 'reactivate': {
        // Prüfen, ob der Benutzer ein gekündigtes Abonnement hat
        if (!user.premium?.subscriptionId || !user.premium?.cancelAtPeriodEnd) {
          return NextResponse.json(
            { error: 'No canceled subscription' },
            { status: 400 }
          );
        }
        
        // Abonnement bei Stripe reaktivieren
        await stripe.subscriptions.update(user.premium.subscriptionId, {
          cancel_at_period_end: false
        });
        
        // Benutzer aktualisieren
        user.premium.cancelAtPeriodEnd = false;
        await user.save();
        
        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated'
        });
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error managing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}
