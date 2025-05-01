'use client';
import { Footer } from "@/components/Footer";
import { RandomLogo } from "@/components/RandomLogo";
import { useState, useEffect } from 'react';
import { StripeCheckout } from './components/StripeCheckout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PREMIUM_PLANS } from '@/lib/stripe';
import PremiumCard from '@/components/PremiumCard';
import PlanSelector from './components/PlanSelector';

export default function PremiumClient() {
  const [selectedPlan, setSelectedPlan] = useState<'onetime' | 'monthly' | 'yearly'>('monthly');
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  const plans = PREMIUM_PLANS;

  // Premium-Status abrufen
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/user/premium');

        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.isPremium);
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPremiumStatus();
  }, [session]);

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
            Upgrade to Premium 💎
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
             (not live yet, do not pay or buy) Unlock the full potential of f0ck.org
          </p>
        </div>

        {/* Pricing Section */}
        <div className="mb-12">
          <div className="max-w-md mx-auto">
            <PremiumCard title="Upgrade to Premium 💎" subtitle="Unlock all premium features and benefits">
              <PlanSelector
                selectedPlan={selectedPlan}
                onSelectPlan={setSelectedPlan}
              />

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-white">
                    ${plans[selectedPlan].price}
                  </span>
                  <span className="text-bd89ff">
                    /{plans[selectedPlan].period}
                  </span>
                </div>
                {plans[selectedPlan].savings && (
                  <span className="text-sm text-green-400">
                    {plans[selectedPlan].savings}
                  </span>
                )}
              </div>

              {isPremium ? (
                <div className="flex justify-center">
                  <button
                    disabled
                    className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium"
                  >
                    You already have Premium 💎
                  </button>
                </div>
              ) : (
                <StripeCheckout selectedPlan={selectedPlan} />
              )}
            </PremiumCard>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-100">
                <span className="font-[family-name:var(--font-geist-mono)] inline-flex items-center gap-1">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent font-semibold">
                    Custom Styling
                  </span>
                  <span className="text-yellow-500 animate-pulse">⭐</span>
                </span>
              </h3>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Colored nickname with gradients</li>
              <li>• Animated avatar frames</li>
              <li>• Custom profile design</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📤</span>
              <h3 className="text-xl font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-100">
                Enhanced Uploads
              </h3>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• GIFs up to 50MB (instead of 10MB)</li>
              <li>• Videos in original quality</li>
              <li>• Unlimited uploads per day</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🗂️</span>
              <h3 className="text-xl font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-100">
                Advanced Features
              </h3>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Unlimited private pools</li>
              <li>• Unlimited tag favorites</li>
              <li>• Custom tag categories</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🚀</span>
              <h3 className="text-xl font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-100">
                Premium Perks
              </h3>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Completely ad-free</li>
              <li>• Early access to new features</li>
              <li>• Premium support</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-6 text-black dark:text-gray-400">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We accept all major credit cards, PayPal, and cryptocurrency.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes, you can cancel your premium subscription at any time. Benefits will remain active until the end of your billing period.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Is there a money-back guarantee?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We offer a 7-day money-back guarantee if you&apos;re not satisfied with your premium experience.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Can I switch between monthly and yearly plans?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes, you can switch plans at any time. If you switch to yearly, we&apos;ll prorate your existing subscription.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                What happens to my uploaded content if I cancel?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All your uploaded content remains accessible, but new uploads will be subject to free tier limitations.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Do you offer team or family plans?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Currently, we only offer individual premium subscriptions. Team plans are coming soon!
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Is premium available worldwide?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes, our premium features are available to users worldwide with region-adjusted pricing.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                How fast is premium support?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Premium members receive priority support with guaranteed response times within 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center space-y-4 max-w-md mx-auto">
          <PremiumCard title="Ready to Upgrade?" subtitle="Join thousands of premium users and unlock all features today.">
            {isPremium ? (
              <div className="flex justify-center">
                <button
                  disabled
                  className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium"
                >
                  You already have Premium 💎
                </button>
              </div>
            ) : (
              <StripeCheckout selectedPlan={selectedPlan} />
            )}
          </PremiumCard>
        </div>
      </div>

      <Footer />
    </div>
  );
}