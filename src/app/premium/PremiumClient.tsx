'use client';
import { Footer } from "@/components/Footer";
import { RandomLogo } from "@/components/RandomLogo";
import { useState } from 'react';

export default function PremiumClient() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const plans = {
    monthly: {
      price: '4.99',
      period: 'month',
      savings: ''
    },
    yearly: {
      price: '49.99',
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
            Unlock the full potential of f0ck.org
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
              <li>• Farbiger Nickname mit Gradienten</li>
              <li>• Animierte Avatarrahmen</li>
              <li>• Custom Profildesign</li>
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
              <li>• GIFs bis 50MB (statt 10MB)</li>
              <li>• Videos in Originalqualität</li>
              <li>• Unbegrenzte Uploads pro Tag</li>
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
              <li>• Unbegrenzte private Pools</li>
              <li>• Unbegrenzte Tag-Favoriten</li>
              <li>• Custom Tag-Kategorien</li>
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
              <li>• Komplett werbefrei</li>
              <li>• Early Access zu neuen Features</li>
              <li>• Premium Support</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-6 text-black dark:text-gray-400">
            Häufige Fragen
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Wie kann ich bezahlen?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Wir akzeptieren alle gängigen Kreditkarten, PayPal und Cryptocurrency.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Kann ich jederzeit kündigen?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ja, du kannst dein Premium-Abo jederzeit kündigen. Die Vorteile bleiben bis zum Ende der Laufzeit erhalten.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Gibt es eine Geld-zurück-Garantie?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Wir bieten eine 7-tägige Geld-zurück-Garantie, falls du mit Premium nicht zufrieden sein solltest.
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