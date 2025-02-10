'use client';

import { useState } from 'react';

interface FilterProps {
  filters: {
    username: string;
    searchText: string;
    dateFrom: string;
    dateTo: string;
    minLikes: number;
  };
  onFilterChange: (filters: FilterProps['filters']) => void;
}

export function CommentFilter({ filters, onFilterChange, infiniteScroll, onToggleInfiniteScroll }: FilterProps & {
  infiniteScroll: boolean;
  onToggleInfiniteScroll: (enabled: boolean) => void;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400">
          Comment Filter
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">all fields optional</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="👤 Username"
            value={filters.username}
            onChange={e => onFilterChange({ ...filters, username: e.target.value })}
            className="w-32 p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
          />
          
          <input
            type="text"
            placeholder="🔍 Search in comments..."
            value={filters.searchText}
            onChange={e => onFilterChange({ ...filters, searchText: e.target.value })}
            className="w-48 p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
          />
          
          <input
            type="number"
            min="0"
            placeholder="❤️ Min likes"
            value={filters.minLikes || ''}
            onChange={e => onFilterChange({ ...filters, minLikes: parseInt(e.target.value) || 0 })}
            className="w-24 p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
          />
          
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="inline-flex items-center gap-1 p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300"
          >
            📅 {filters.dateFrom || filters.dateTo ? 'Date filtered' : 'Date filter'}
          </button>

          {showDatePicker && (
            <div className="absolute mt-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-10">
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={e => onFilterChange({ ...filters, dateFrom: e.target.value })}
                  className="p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={e => onFilterChange({ ...filters, dateTo: e.target.value })}
                  className="p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700 cursor-pointer whitespace-nowrap">
            <span className="text-sm text-gray-500 dark:text-gray-400">Infinite Scroll</span>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={infiniteScroll}
                onChange={e => onToggleInfiniteScroll(e.target.checked)}
              />
              <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
