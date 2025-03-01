'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { RandomLogo } from "@/components/RandomLogo";
import { StatusBanner } from '@/components/StatusBanner';

interface LoginClientProps {
  registered?: boolean;
}

export default function LoginClient({ registered }: LoginClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;

      // Basic input validation
      if (!username || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Input length validation
      if (username.length > 50 || password.length > 100) {
        setError('Invalid input length');
        setLoading(false);
        return;
      }

      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setShowLoginBanner(true);
        // Clear sensitive form data
        e.currentTarget.reset();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the callback URL from the URL parameters
        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get('callbackUrl');
        
        // Redirect to callback URL or home
        router.push(callbackUrl || '/');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <StatusBanner 
        show={showLoginBanner} 
        message="Logging in..." 
      />
      <StatusBanner 
        show={!!registered} 
        message="Registration successful! Please log in." 
        type="default" 
      />
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-6 text-black dark:text-gray-400">
              Login
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                  required
                  autoComplete="username"
                  maxLength={50}
                />
              </div>
              
              <div className="space-y-2">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                  required
                  autoComplete="current-password"
                  maxLength={100}
                />
              </div>

              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="relative h-12 w-full mt-6 rounded-lg overflow-hidden transition-all duration-500 group"
              >
                <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-b from-[#654358] via-[#17092A] to-[#2F0D64]">
                  <div className="absolute inset-0 bg-[#170928] rounded-lg opacity-90"></div>
                </div>
                <div className="absolute inset-[2px] bg-[#170928] rounded-lg opacity-95"></div>
                <div className="absolute inset-[2px] bg-gradient-to-r from-[#170928] via-[#1d0d33] to-[#170928] rounded-lg opacity-90"></div>
                <div className="absolute inset-[2px] bg-gradient-to-b from-[#654358]/40 via-[#1d0d33] to-[#2F0D64]/30 rounded-lg opacity-80"></div>
                <div className="absolute inset-[2px] bg-gradient-to-br from-[#C787F6]/10 via-[#1d0d33] to-[#2A1736]/50 rounded-lg"></div>
                <div className="absolute inset-[2px] shadow-[inset_0_0_15px_rgba(199,135,246,0.15)] rounded-lg"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <span className="text-lg font-normal bg-gradient-to-b from-[#D69DDE] to-[#B873F8] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(199,135,246,0.4)] tracking-tighter">
                    {loading ? 'Logging in...' : 'Login'}
                  </span>
                </div>
                <div className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 group-hover:opacity-100 rounded-lg"></div>
              </button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Do not have an account?{' '}
                  <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Register here
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By logging in, you agree to the{' '}
                  <Link href="/rules" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Rules/ToS
                  </Link>
                  {' '}•{' '}
                  <Link href="/help" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Help
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
