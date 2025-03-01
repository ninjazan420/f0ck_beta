'use client';

import { RandomLogo } from "@/components/RandomLogo";
import { ModerationStats } from './ModerationStats';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import { CommentModeration } from './CommentModeration';

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ModerationStats />
          <QuickActions />
          <RecentActivity />
        </div>

        {/* Kommentarmoderation */}
        <div className="mt-8">
          <CommentModeration />
        </div>
      </div>
    </div>
  );
} 