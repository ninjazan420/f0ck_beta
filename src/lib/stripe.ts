import Stripe from 'stripe';

// Singleton-Pattern für Stripe-Client
let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe => {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('Missing Stripe secret key');
    }
    
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2023-10-16', // Aktuelle API-Version
      appInfo: {
        name: 'f0ck_beta',
        version: '3.4.0',
      },
    });
  }
  
  return stripeInstance;
};

// Client-seitiger Stripe-Instance (für Frontend)
export const getStripePublic = async () => {
  const { loadStripe } = await import('@stripe/stripe-js');
  
  const publicKey = process.env.STRIPE_PUBLIC_KEY;
  
  if (!publicKey) {
    throw new Error('Missing Stripe public key');
  }
  
  return loadStripe(publicKey);
};

// Premium-Pläne
export const PREMIUM_PLANS = {
  monthly: {
    id: process.env.STRIPE_MONTHLY_PLAN_ID || 'price_monthly',
    name: 'Monthly Premium',
    price: '1.99',
    period: 'month',
    interval: 'month',
    savings: ''
  },
  yearly: {
    id: process.env.STRIPE_YEARLY_PLAN_ID || 'price_yearly',
    name: 'Yearly Premium',
    price: '19.99',
    period: 'year',
    interval: 'year',
    savings: 'Save ~17%'
  }
};

// Hilfsfunktion zum Formatieren von Preisen
export const formatPrice = (amount: number, currency: string = 'eur') => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};
