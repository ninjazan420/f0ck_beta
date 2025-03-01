'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CommentList } from '@/app/comments/components/CommentList';

export function CommentModeration() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState<'pending' | 'reported' | 'all'>('all');
  const [loading, setLoading] = useState(true);

  if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
    return (
      <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20">
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
          Access Denied
        </h2>
        <p className="text-red-600 dark:text-red-300">
          You do not have permission to access moderation features.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Comment Moderation
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('reported')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === 'reported'
                  ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Reported
            </button>
          </div>
        </div>

        <CommentList 
          limit={20}
          initialPage={1}
          status={filter}
          showModActions={true}
        />
      </div>
    </div>
  );
} 