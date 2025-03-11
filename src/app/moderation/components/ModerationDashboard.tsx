'use client';

import { RandomLogo } from "@/components/RandomLogo";
import { CommentModeration } from './CommentModeration';
import { Footer } from "@/components/Footer";
import { RecentActivity } from './RecentActivity';

export default function ModerationDashboard() {
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-6xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center text-black dark:text-gray-400">
          Moderation Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Comments Overview */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/30 p-6 h-full">
            <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-center py-2 rounded-lg bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30">
              Comments
            </h2>
            <div className="space-y-4 overflow-y-auto">
              <CommentModeration />
            </div>
          </div>
          
          {/* Activity Log in the Middle */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/30 p-6 h-full">
            <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-center py-2 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              Moderation Activity Log
            </h2>
            <div className="space-y-4 overflow-y-auto">
              <RecentActivity />
            </div>
          </div>
          
          {/* Reported Content on the Right */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/30 p-6 h-full">
            <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-center py-2 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30">
              Reported Content
            </h2>
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">No reported content available</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 