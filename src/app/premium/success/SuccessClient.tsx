'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Footer } from "@/components/Footer";
import { RandomLogo } from "@/components/RandomLogo";
import Link from 'next/link';
import { Loader2, CheckCircle } from 'lucide-react';

export default function SuccessClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Wenn kein Session-ID vorhanden ist, zur Premium-Seite zurückkehren
    if (!sessionId) {
      router.push('/premium');
      return;
    }

    // Kurze Verzögerung, um sicherzustellen, dass der Webhook verarbeitet wurde
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [sessionId, router]);

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-[family-name:var(--font-geist-mono)] text-black dark:text-gray-400">
            {isLoading ? 'Activating Premium...' : 'Premium Activated! 💎'}
          </h1>
          
          <div className="flex justify-center my-8">
            {isLoading ? (
              <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
            ) : (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
          </div>
          
          <div className="max-w-md mx-auto">
            {isLoading ? (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Please wait while we activate your premium membership...
              </p>
            ) : (
              <>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Your premium membership has been successfully activated! You now have access to all premium features.
                </p>
                
                <div className="space-y-4">
                  <Link
                    href="/account"
                    className="inline-block px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all"
                  >
                    View Your Account
                  </Link>
                  
                  <div>
                    <Link
                      href="/"
                      className="inline-block px-6 py-3 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Return to Homepage
                    </Link>
                  </div>
                </div>
              </>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
