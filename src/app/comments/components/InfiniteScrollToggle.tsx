'use client';

export function InfiniteScrollToggle({ 
  enabled, 
  onToggle 
}: { 
  enabled: boolean; 
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">∞ Scroll</span>
      <div className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          onChange={e => onToggle(e.target.checked)}
        />
        <div className="w-7 h-4 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
      </div>
    </div>
  );
}