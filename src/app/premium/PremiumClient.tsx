'use client';
import { Footer } from "@/components/Footer";
import { RandomLogo } from "@/components/RandomLogo";
import { useState } from 'react';

export default function PremiumClient() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const plans = {
    monthly: {
      price: '1.99',
      period: 'month',
      savings: ''
    },
    yearly: {
      price: '19.99',
      period: 'year',
      savings: 'Save ~17%'
    }
  };

  const handlePurchase = () => {
    // TODO: Implement purchase logic
    console.log(`Processing ${selectedPlan} purchase...`);
  };

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
            Unlock the full potential of f0ck.org (not live yet, do not pay)
          </p>
        </div>

        {/* Pricing Section */}
        <div className="mb-12">
          <div className="max-w-md mx-auto p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-100 dark:border-purple-800/20">
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedPlan === 'yearly'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                Yearly
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  ${plans[selectedPlan].price}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  /{plans[selectedPlan].period}
                </span>
              </div>
              {plans[selectedPlan].savings && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  {plans[selectedPlan].savings}
                </span>
              )}
            </div>

            <button
              onClick={handlePurchase}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Upgrade Now
            </button>
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
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
            Ready to Upgrade?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join thousands of premium users and unlock all features today.
          </p>
          <button
            onClick={handlePurchase}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Premium Now 💎
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}