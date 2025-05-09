'use client';
import { useState, useEffect } from 'react';
import { ContentRating } from './PostsPage';
import { useSearchParams } from 'next/navigation';

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
  author: string;
  likedBy: string;
  favoritedBy: string;
}

interface PostFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  infiniteScroll: boolean;
  onToggleInfiniteScroll: (enabled: boolean) => void;
}

export function PostFilter({ filters, onFilterChange, infiniteScroll, onToggleInfiniteScroll }: PostFilterProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const searchParams = useSearchParams();

  const toggleRating = (rating: ContentRating) => {
    // Kopiere die aktuellen Ratings
    const newRatings = [...filters.contentRating];

    // Prüfe, ob das Rating bereits aktiv ist
    const index = newRatings.indexOf(rating);

    if (index >= 0) {
      // Entferne das Rating nur, wenn mehr als ein Rating aktiv ist
      // Dies verhindert, dass alle Filter deaktiviert werden
      if (newRatings.length > 1) {
        console.log(`Removing rating: ${rating}`);
        newRatings.splice(index, 1);
      } else {
        console.log(`Cannot remove last rating: ${rating}`);
      }
    } else {
      // Füge das Rating hinzu
      console.log(`Adding rating: ${rating}`);
      newRatings.push(rating);
    }

    console.log('New content ratings:', newRatings);

    // Aktualisiere die Filter mit den neuen Ratings
    // Dies löst auch die Speicherung im localStorage und die URL-Aktualisierung aus
    onFilterChange({ ...filters, contentRating: newRatings });
  };

  useEffect(() => {
    const author = searchParams.get('uploader');
    if (author && filters.uploader !== author) {
      onFilterChange({ ...filters, uploader: author });
    }
  }, [searchParams, filters.uploader]);

  return (
    <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400">
          Post Filter
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <input
          type="text"
          placeholder="🔍 Search titles, tags, descriptions..."
          value={filters.searchText}
          onChange={e => onFilterChange({ ...filters, searchText: e.target.value })}
          className="w-52 p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
        />

        <input
          type="text"
          placeholder="👤 Uploader"
          value={filters.uploader}
          onChange={e => onFilterChange({ ...filters, uploader: e.target.value })}
          className="w-28 p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
        />

        <input
          type="text"
          placeholder="💬 Commenter"
          value={filters.commenter}
          onChange={e => onFilterChange({ ...filters, commenter: e.target.value })}
          className="w-28 p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
        />

        <select
          value={filters.sortBy}
          onChange={e => onFilterChange({ ...filters, sortBy: e.target.value as keyof typeof SORT_OPTIONS })}
          className="p-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
        >
          {Object.entries(SORT_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
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
          className={`p-1.5 text-sm rounded-lg border ${showDatePicker ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50'}`}
        >
          📅 {filters.dateFrom || filters.dateTo ? 'Date filtered' : 'Date range'}
        </button>
      </div>

      {/* Date Picker Row - Always visible when toggled */}
      {showDatePicker && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
          <span className="text-sm text-gray-500 dark:text-gray-400">From:</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => onFilterChange({ ...filters, dateFrom: e.target.value })}
            className="p-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-700/90"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">To:</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => onFilterChange({ ...filters, dateTo: e.target.value })}
            className="p-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-700/90"
          />
          <button
            onClick={() => {
              onFilterChange({ ...filters, dateFrom: '', dateTo: '' });
              setShowDatePicker(false);
            }}
            className="ml-auto p-1 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            Clear & Close
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
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

      {/* Fügen Sie eine Anzeige für aktive Tag-Filter hinzu */}
      {filters.tags && filters.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Aktive Tags:</span>
          {filters.tags.map(tag => (
            <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs">
              {tag}
              <button
                onClick={() => {
                  // Entfernen des Tags aus den Filtern
                  const newTags = filters.tags.filter(t => t !== tag);
                  onFilterChange({ ...filters, tags: newTags });

                  // Entfernen aus dem URL-Parameter
                  const url = new URL(window.location.href);
                  const params = new URLSearchParams(url.search);
                  params.delete('tag');
                  newTags.forEach(t => params.append('tag', t));

                  // URL aktualisieren ohne Neuladen der Seite
                  window.history.pushState({}, '', `${url.pathname}?${params.toString()}`);
                  sessionStorage.removeItem('active_tag_filter');
                }}
                className="ml-1 text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-200"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {filters.author && (
        <div className="filter-pill">
          <span>Autor: {filters.author}</span>
          <button onClick={() => onFilterChange({ ...filters, author: '' })} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
        </div>
      )}

      {filters.likedBy && (
        <div className="filter-pill">
          <span>Geliked von: {filters.likedBy}</span>
          <button onClick={() => onFilterChange({ ...filters, likedBy: '' })} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
        </div>
      )}

      {filters.favoritedBy && (
        <div className="filter-pill">
          <span>Favorisiert von: {filters.favoritedBy}</span>
          <button onClick={() => onFilterChange({ ...filters, favoritedBy: '' })} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
        </div>
      )}
    </div>
  );
}
