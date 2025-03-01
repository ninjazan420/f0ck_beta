'use client';

export function RecentActivity() {
  return (
    <div className="settings-card p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30">
      <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
        Recent Activity
      </h2>
      <div className="space-y-3">
        <div className="p-3 rounded bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/30">
          <p className="text-sm text-gray-600 dark:text-gray-400">No activities available</p>
        </div>
      </div>
    </div>
  );
} 