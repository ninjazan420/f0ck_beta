'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialisiere Filter aus URL-Parametern
  useEffect(() => {
    const author = searchParams.get('author');
    const search = searchParams.get('search');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const minLikes = searchParams.get('min_likes');
    
    // Nur aktualisieren, wenn sich mindestens ein Parameter geändert hat
    const hasChanges = author !== filters.username || 
                     search !== filters.searchText ||
                     from !== filters.dateFrom ||
                     to !== filters.dateTo ||
                     (minLikes && parseInt(minLikes) !== filters.minLikes);
    
    if (hasChanges) {
      onFilterChange({
        username: author || '',
        searchText: search || '',
        dateFrom: from || '',
        dateTo: to || '',
        minLikes: minLikes ? parseInt(minLikes) : 0
      });
    }
  }, [searchParams]);
  
  // Aktualisiere URL wenn sich die Filter ändern
  const updateURLParams = (newFilters: FilterProps['filters']) => {
    const params = new URLSearchParams();
    
    if (newFilters.username) params.set('author', newFilters.username);
    if (newFilters.searchText) params.set('search', newFilters.searchText);
    if (newFilters.dateFrom) params.set('from', newFilters.dateFrom);
    if (newFilters.dateTo) params.set('to', newFilters.dateTo);
    if (newFilters.minLikes > 0) params.set('min_likes', newFilters.minLikes.toString());
    
    // Aktualisiere URL
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Benachrichtige die übergeordnete Komponente
    onFilterChange(newFilters);
  };

  return (
    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search comments..."
            value={filters.searchText}
            onChange={e => updateURLParams({ ...filters, searchText: e.target.value })}
            className="w-full px-4 py-2 text-sm rounded-lg border-0 bg-white/50 dark:bg-gray-800/50 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all"
          />
        </div>
        
        {/* Username Input */}
        <input
          type="text"
          placeholder="Username"
          value={filters.username}
          onChange={e => updateURLParams({ ...filters, username: e.target.value })}
          className="px-4 py-2 text-sm rounded-lg border-0 bg-white/50 dark:bg-gray-800/50 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all min-w-[140px]"
        />
        
        {/* Min Likes Input */}
        <input
          type="number"
          min="0"
          placeholder="Min likes"
          value={filters.minLikes || ''}
          onChange={e => updateURLParams({ ...filters, minLikes: parseInt(e.target.value) || 0 })}
          className="px-4 py-2 text-sm rounded-lg border-0 bg-white/50 dark:bg-gray-800/50 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all min-w-[120px]"
        />
          
        {/* Date Range Toggle */}
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className={`px-4 py-2 text-sm font-normal rounded-lg transition-all ${
            showDatePicker || filters.dateFrom || filters.dateTo
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          📅 Date Range
        </button>
        
        {/* Infinite Scroll Button */}
        <button
          onClick={() => onToggleInfiniteScroll(!infiniteScroll)}
          className={`px-4 py-2 text-sm font-normal rounded-lg transition-all ${
            infiniteScroll
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          ♾️ Infinite Scroll
        </button>
      </div>
      
      {/* Date Range Picker */}
      {showDatePicker && (
        <div className="mt-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal text-gray-600 dark:text-gray-400 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => updateURLParams({ ...filters, dateFrom: e.target.value })}
                className="w-full px-4 py-2 text-sm rounded-lg border-0 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-normal text-gray-600 dark:text-gray-400 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => updateURLParams({ ...filters, dateTo: e.target.value })}
                className="w-full px-4 py-2 text-sm rounded-lg border-0 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
