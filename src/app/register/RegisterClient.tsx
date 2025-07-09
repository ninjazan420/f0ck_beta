'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { RandomLogo } from "@/components/RandomLogo";
import DiscordButton from '@/components/DiscordButton';

export default function RegisterClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get('username'),
      password: formData.get('password'),
      email: formData.get('email') || undefined
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Ein Fehler ist aufgetreten');
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      {/* Logo Section */}
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Registration Form */}
            <div className="space-y-4">
              <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-6 text-black dark:text-gray-400">
                Create Account
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username (3-16 characters)"
                    required
                    maxLength={16}
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Allowed characters: letters, numbers, underscore, hyphen
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password (8+ Characters)"
                    required
                    minLength={5}
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                  />
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">
                    <p className="mb-1">🔒 Password requirements:</p>
                    <ul className="list-disc pl-5 text-xs">
                      <li>Minimum 8 characters</li>
                      <li>No maximum length restriction</li>
                      <li>At least one special character</li>
                      <li>All characters allowed</li>
                      <li>Case sensitive</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email (optional)"
                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                  />
                  <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/20 p-2 rounded border border-amber-100 dark:border-amber-900/30">
                    ⚠️ Warning: Without an email address, there is absolutely no
                    way to recover your password or account if lost - no
                    exceptions! You can add an email address later in your
                    account settings while logged in.
                  </p>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

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
                      {loading ? "Register..." : "Register"}
                    </span>
                  </div>
                  <div className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 group-hover:opacity-100 rounded-lg"></div>
                </button>

                {/* Discord Register Button */}
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">or</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <DiscordButton text="Register with Discord" variant="register" disabled={loading} />
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column - Features List */}
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-6 text-black dark:text-gray-400">
                Registered users can:
              </h2>
              <ul className="space-y-2 text-gray-800 dark:text-gray-400">
                <li>• Access your own uploads</li>
                <li>• Create favorites</li>
                <li>• Write comments</li>
                <li>• Delete your own comments</li>
                <li>• Up/downvoting of posts</li>
                <li>• History of up- and downvoted posts</li>
                <li>• Create and edit tags</li>
              </ul>
            </div>
          </div>

          {/* Agreement Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              By creating an account, you are agreeing to the{" "}
              <Link
                href="/rules"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Rules
              </Link>
              {" "}•{" "}
              <Link
                href="/terms"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Terms
              </Link>
              {" "}•{" "}
              <Link
                href="/help"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Help
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
