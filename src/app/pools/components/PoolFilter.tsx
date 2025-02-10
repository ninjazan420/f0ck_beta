import { PoolContentRating, SortBy } from './PoolsPage';

interface PoolFilterProps {
  filters: {
    search: string;
    creator: string;
    contributor: string;
    contentRating: PoolContentRating[];
    minItems: number;
    sortBy: SortBy;
    timeRange: 'all' | 'day' | 'week' | 'month' | 'year';
  };
  onFilterChange: (filters: any) => void;
}

export function PoolFilter({ filters, onFilterChange }: PoolFilterProps) {
  const handleRatingToggle = (rating: PoolContentRating) => {
    const newRatings = filters.contentRating.includes(rating)
      ? filters.contentRating.filter(r => r !== rating)
      : [...filters.contentRating, rating];
    onFilterChange({ ...filters, contentRating: newRatings });
  };

  return (
    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Search pools..."
              className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Content Rating */}
          <div className="flex flex-wrap gap-2">
            {(['safe', 'sketchy', 'unsafe'] as PoolContentRating[]).map(rating => (
              <button
                key={rating}
                onClick={() => handleRatingToggle(rating)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filters.contentRating.includes(rating)
                    ? rating === 'safe' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : rating === 'sketchy' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {rating.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2">
            {([
              { value: 'newest', label: '✨ Newest' },
              { value: 'most_viewed', label: '👁️ Most Viewed' },
              { value: 'most_items', label: '📚 Most Items' },
              { value: 'recently_updated', label: '🔄 Recently Updated' }
            ] as const).map(option => (
              <button
                key={option.value}
                onClick={() => onFilterChange({ ...filters, sortBy: option.value })}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filters.sortBy === option.value
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Creator/Contributor Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Created by
              </label>
              <input
                type="text"
                value={filters.creator}
                onChange={(e) => onFilterChange({ ...filters, creator: e.target.value })}
                placeholder="Filter by creator"
                className="w-full px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Contributed to by
              </label>
              <input
                type="text"
                value={filters.contributor}
                onChange={(e) => onFilterChange({ ...filters, contributor: e.target.value })}
                placeholder="Filter by contributor"
                className="w-full px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm"
              />
            </div>
          </div>

          {/* Time Range */}
          <div className="flex flex-wrap gap-2">
            {([
              { value: 'all', label: '🕒 All Time' },
              { value: 'day', label: '📅 Today' },
              { value: 'week', label: '📆 This Week' },
              { value: 'month', label: '📅 This Month' },
              { value: 'year', label: '📅 This Year' }
            ] as const).map(option => (
              <button
                key={option.value}
                onClick={() => onFilterChange({ ...filters, timeRange: option.value })}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filters.timeRange === option.value
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Min Items Select */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Min. items:
            </label>
            <select
              value={filters.minItems}
              onChange={(e) => onFilterChange({ ...filters, minItems: Number(e.target.value) })}
              className="px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm"
            >
              <option value="0">Any</option>
              <option value="5">5+</option>
              <option value="10">10+</option>
              <option value="25">25+</option>
              <option value="50">50+</option>
              <option value="100">100+</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
