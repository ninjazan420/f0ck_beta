'use client';

import Link from "next/link";
import { Footer } from "@/components/Footer";
import { RandomLogo } from "@/components/RandomLogo";

export default function RegisterClient() {
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
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Password (5+ Characters)"
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Email (optional)"
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                />
              </div>

              {/* Register Button */}
              <button className="relative h-12 w-full mt-6 rounded-lg overflow-hidden transition-all duration-500 group">
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
                    Register
                  </span>
                </div>
                <div className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 group-hover:opacity-100 rounded-lg"></div>
              </button>
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
              By creating an account, you are agreeing to the{' '}
              <Link href="/rules" className="text-blue-600 dark:text-blue-400 hover:underline">
                Rules/ToS
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
