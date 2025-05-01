import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getStripe, PREMIUM_PLANS } from '@/lib/stripe';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Request-Body parsen
    const { plan = 'monthly' } = await req.json();

    // Stripe-Client initialisieren
    const stripe = getStripe();

    // Verbindung zur Datenbank herstellen
    await dbConnect();

    // Benutzer aus der Datenbank abrufen
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prüfen, ob der Benutzer bereits ein aktives Premium-Abonnement hat
    if (user.premium?.isActive && user.premium?.subscriptionId) {
      return NextResponse.json(
        { error: 'User already has an active premium subscription' },
        { status: 400 }
      );
    }

    // Stripe-Kunde erstellen oder abrufen
    let customerId = user.premium?.customerId;

    if (!customerId) {
      // Neuen Stripe-Kunden erstellen
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: {
          userId: user.id
        }
      });

      customerId = customer.id;

      // Kunden-ID in der Datenbank speichern
      user.premium = {
        ...user.premium,
        customerId
      };

      await user.save();
    }

    // Checkout-Session erstellen
    let session_data: any = {
      customer: customerId,
      payment_method_types: ['card'],
      success_url: `${process.env.PUBLIC_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_URL}/premium`,
      metadata: {
        userId: user.id,
        plan
      }
    };

    // Unterschiedliche Konfiguration für Einmalzahlung vs. Abonnement
    if (plan === 'onetime') {
      session_data.mode = 'payment';
      session_data.line_items = [
        {
          price: PREMIUM_PLANS.onetime.id,
          quantity: 1
        }
      ];
    } else {
      session_data.mode = 'subscription';
      session_data.line_items = [
        {
          price: PREMIUM_PLANS[plan as 'monthly' | 'yearly'].id,
          quantity: 1
        }
      ];
    }

    const checkoutSession = await stripe.checkout.sessions.create(session_data);

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
