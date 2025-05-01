'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PREMIUM_PLANS } from '@/lib/stripe';
import PremiumButton from '@/components/PremiumButton';

interface StripeCheckoutProps {
  selectedPlan: 'onetime' | 'monthly' | 'yearly';
}

export function StripeCheckout({ selectedPlan }: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      // Checkout-Session erstellen
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Zu Stripe Checkout weiterleiten
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <PremiumButton
        text="Get Premium Now 💎"
        onClick={handleCheckout}
        isLoading={isLoading}
        disabled={isLoading}
      />
    </div>
  );
}
