'use client';

export function ModerationStats() {
  return (
    <div className="settings-card p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30">
      <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
        Statistics
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Pending Comments</span>
          <span className="px-2 py-0.5 rounded-sm text-sm font-medium bg-yellow-500/40 text-white border border-yellow-500/50">0</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Reported Posts</span>
          <span className="px-2 py-0.5 rounded text-sm font-medium bg-red-500/40 text-white border border-red-500/50">0</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
          <span className="px-2 py-0.5 rounded text-sm font-medium bg-green-500/40 text-white border border-green-500/50">0</span>
        </div>
      </div>
    </div>
  );
} 