'use client';
import { useState } from 'react';
import { ContentRating } from './PostsPage';

const SORT_OPTIONS = {
  newest: 'Newest First',
  oldest: 'Oldest First',
  most_liked: 'Most Liked',
  most_commented: 'Most Commented'
} as const;

interface FilterState {
  searchText: string;
  tags: string[];  // Hinzugefügt
  uploader: string;
  commenter: string;
  sortBy: keyof typeof SORT_OPTIONS;
  minLikes: number;
  dateFrom: string;
  dateTo: string;
  contentRating: ContentRating[];
}

interface PostFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  infiniteScroll: boolean;
  onToggleInfiniteScroll: (enabled: boolean) => void;
}

export function PostFilter({ filters, onFilterChange, infiniteScroll, onToggleInfiniteScroll }: PostFilterProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleRating = (rating: ContentRating) => {
    const newRatings = filters.contentRating.includes(rating)
      ? filters.contentRating.filter(r => r !== rating)
      : [...filters.contentRating, rating];
    onFilterChange({ ...filters, contentRating: newRatings });
  };

  return (
    <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400">
          Post Filter
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">all fields optional</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 flex flex-wrap items-center gap-2 min-w-[300px]">
          <input
            type="text"
            placeholder="🔍 Search titles, tags, descriptions..."
            value={filters.searchText}
            onChange={e => onFilterChange({ ...filters, searchText: e.target.value })}
            className="w-60 p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
          />

          <input
            type="text"
            placeholder="👤 Uploader"
            value={filters.uploader}
            onChange={e => onFilterChange({ ...filters, uploader: e.target.value })}
            className="w-32 p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
          />

          <input
            type="text"
            placeholder="💭 Commenter"
            value={filters.commenter}
            onChange={e => onFilterChange({ ...filters, commenter: e.target.value })}
            className="w-32 p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
          />
          
          <select
            value={filters.sortBy}
            onChange={e => onFilterChange({ ...filters, sortBy: e.target.value as keyof typeof SORT_OPTIONS })}
            className="p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
          >
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

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
            className="p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
          >
            📅 {filters.dateFrom || filters.dateTo ? 'Date filtered' : 'Date range'}
          </button>

          {showDatePicker && (
            <div className="absolute mt-32 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-10">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={e => onFilterChange({ ...filters, dateFrom: e.target.value })}
                  className="p-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={e => onFilterChange({ ...filters, dateTo: e.target.value })}
                  className="p-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-2">
          <button
            onClick={() => toggleRating('safe')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors
              ${filters.contentRating.includes('safe')
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
          >
            Safe
          </button>
          <button
            onClick={() => toggleRating('sketchy')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors
              ${filters.contentRating.includes('sketchy')
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
          >
            Sketchy
          </button>
          <button
            onClick={() => toggleRating('unsafe')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors
              ${filters.contentRating.includes('unsafe')
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
          >
            Unsafe
          </button>
        </div>

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
  );
}
