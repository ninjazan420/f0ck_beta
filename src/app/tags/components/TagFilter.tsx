import { TagType, SortBy } from './TagsPage';

interface TagFilterProps {
  filters: {
    search: string;
    types: TagType[];
    minPosts: number;
    sortBy: SortBy;
    author: string;
    usedBy: string;
    timeRange: 'all' | 'day' | 'week' | 'month' | 'year';
  };
  onFilterChange: (filters: any) => void;
}

export function TagFilter({ filters, onFilterChange }: TagFilterProps) {
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
              placeholder="Search tags..."
              className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {(['general', 'character', 'copyright', 'artist', 'meta'] as TagType[]).map(type => (
              <button
                key={type}
                onClick={() => {
                  const newTypes = filters.types.includes(type)
                    ? filters.types.filter(t => t !== type)
                    : [...filters.types, type];
                  onFilterChange({ ...filters, types: newTypes });
                }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filters.types.includes(type)
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
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
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Sort Options */}
          <div className="flex flex-wrap gap-2">
            {([
              { value: 'most_used', label: '🔥 Most Used' },
              { value: 'newest', label: '✨ Newest' },
              { value: 'alphabetical', label: '📝 A-Z' },
              { value: 'trending', label: '📈 Trending' }
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

          {/* Additional Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Author
              </label>
              <input
                type="text"
                value={filters.author}
                onChange={(e) => onFilterChange({ ...filters, author: e.target.value })}
                placeholder="Filter by author"
                className="w-full px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Used by user
              </label>
              <input
                type="text"
                value={filters.usedBy}
                onChange={(e) => onFilterChange({ ...filters, usedBy: e.target.value })}
                placeholder="Filter by user"
                className="w-full px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm"
              />
            </div>
          </div>

          {/* Min Posts Compact Version */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Min. posts:
            </label>
            <select
              value={filters.minPosts}
              onChange={(e) => onFilterChange({ ...filters, minPosts: Number(e.target.value) })}
              className="flex-1 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm"
            >
              <option value="0">Any</option>
              <option value="10">10+</option>
              <option value="100">100+</option>
              <option value="1000">1,000+</option>
              <option value="10000">10,000+</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
