import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();

    // Webhook-Secret aus den Umgebungsvariablen abrufen
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing Stripe webhook secret');
      return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
    }

    // Request-Body als Text abrufen
    const rawBody = await req.text();

    // Stripe-Signature aus den Headers abrufen
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Stripe-Event konstruieren und verifizieren
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Verbindung zur Datenbank herstellen
    await dbConnect();

    // Event-Typ verarbeiten
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Benutzer-ID aus den Metadaten abrufen
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan || 'monthly';

        if (!userId) {
          console.error('No userId in session metadata');
          return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 });
        }

        // Benutzer finden
        const user = await User.findById(userId);
        if (!user) {
          console.error(`User not found: ${userId}`);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Unterschiedliche Verarbeitung für Einmalzahlung vs. Abonnement
        if (plan === 'onetime') {
          // Bei Einmalzahlung: Setze Premium für einen Monat
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1); // Ein Monat ab jetzt

          // Premium-Status aktualisieren
          user.role = 'premium';
          user.premium = {
            isActive: true,
            customerId: session.customer as string,
            plan,
            startDate,
            endDate,
            cancelAtPeriodEnd: true, // Läuft automatisch ab
            invoices: user.premium?.invoices || []
          };

          // Rechnung hinzufügen, wenn vorhanden
          if (session.payment_intent) {
            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);

            if (paymentIntent.latest_charge) {
              const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);

              const newInvoice = {
                id: charge.id,
                amount: charge.amount,
                currency: charge.currency,
                status: charge.status,
                created: new Date(charge.created * 1000),
                receiptUrl: charge.receipt_url
              };

              user.premium.invoices = [...(user.premium.invoices || []), newInvoice];
            }
          }
        } else {
          // Bei Abonnement: Normale Verarbeitung
          // Abonnement-Details abrufen
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Ablaufdatum berechnen
          const startDate = new Date(subscription.current_period_start * 1000);
          const endDate = new Date(subscription.current_period_end * 1000);

          // Premium-Status aktualisieren
          user.role = 'premium';
          user.premium = {
            isActive: true,
            subscriptionId,
            customerId: session.customer as string,
            plan,
            startDate,
            endDate,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            invoices: user.premium?.invoices || []
          };
        }

        await user.save();
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
          console.error('No subscription ID in invoice');
          return NextResponse.json({ error: 'No subscription ID' }, { status: 400 });
        }

        // Abonnement-Details abrufen
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = subscription.customer as string;

        // Benutzer finden
        const user = await User.findOne({ 'premium.customerId': customerId });
        if (!user) {
          console.error(`User not found for customer: ${customerId}`);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Rechnung zu den Benutzerinformationen hinzufügen
        const newInvoice = {
          id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          created: new Date(invoice.created * 1000),
          invoiceUrl: invoice.hosted_invoice_url,
          receiptUrl: invoice.receipt_url
        };

        // Premium-Status aktualisieren
        user.premium = {
          ...user.premium,
          isActive: true,
          startDate: new Date(subscription.current_period_start * 1000),
          endDate: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          invoices: [...(user.premium?.invoices || []), newInvoice]
        };

        await user.save();
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Benutzer finden
        const user = await User.findOne({ 'premium.customerId': customerId });
        if (!user) {
          console.error(`User not found for customer: ${customerId}`);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Premium-Status aktualisieren
        user.premium = {
          ...user.premium,
          isActive: subscription.status === 'active',
          startDate: new Date(subscription.current_period_start * 1000),
          endDate: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        };

        await user.save();
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Benutzer finden
        const user = await User.findOne({ 'premium.customerId': customerId });
        if (!user) {
          console.error(`User not found for customer: ${customerId}`);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Premium-Status deaktivieren
        user.role = 'user';
        user.premium = {
          ...user.premium,
          isActive: false,
          endDate: new Date()
        };

        await user.save();
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Webhook-Anfragen von Stripe haben einen Raw-Body, der nicht automatisch geparst werden sollte
export const config = {
  api: {
    bodyParser: false
  }
};
