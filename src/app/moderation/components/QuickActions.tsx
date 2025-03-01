'use client';

export function QuickActions() {
  return (
    <div className="settings-card p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30">
      <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
        Quick Actions
      </h2>
      <div className="space-y-3">
        <button className="w-full px-4 py-2 rounded font-[family-name:var(--font-geist-mono)] text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 border border-blue-500/30 transition-colors">
          Review Comments
        </button>
        <button className="w-full px-4 py-2 rounded font-[family-name:var(--font-geist-mono)] text-sm bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300 border border-red-500/30 transition-colors">
          Reported Content
        </button>
        <button className="w-full px-4 py-2 rounded font-[family-name:var(--font-geist-mono)] text-sm bg-green-500/20 hover:bg-green-500/30 text-green-700 dark:text-green-300 border border-green-500/30 transition-colors">
          Manage Users
        </button>
      </div>
    </div>
  );
} 