'use client';

import { useState } from 'react';
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { RandomLogo } from "@/components/RandomLogo";


export default function ForgotPasswordClient() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-lg flex-grow">
        <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-xs border border-gray-100 dark:border-gray-800">
          {!sent ? (
            <>
              <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-6 text-black dark:text-gray-400">
                Reset Password
              </h2>
              
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Enter your email address and we will send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    required
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                  />
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
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </span>
                  </div>
                  <div className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 group-hover:opacity-100 rounded-lg"></div>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-6 text-black dark:text-gray-400">
                Check Your Email
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400">
                If an account exists with that email address, we have sent instructions to reset your password.
              </p>
              
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Did not receive the email? Check your spam folder or try again.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
