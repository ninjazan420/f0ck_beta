import { UserRole, SortBy } from './UsersPage';

interface UserFilterProps {
  filters: {
    search: string;
    roles: UserRole[];
    isPremium: boolean | null;
    sortBy: SortBy;
    timeRange: 'all' | 'day' | 'week' | 'month' | 'year';
  };
  onFilterChange: (filters: UserFilterProps['filters']) => void;
}

export function UserFilter({ filters, onFilterChange }: UserFilterProps) {
  const handleRoleToggle = (role: UserRole) => {
    const newRoles = filters.roles.includes(role)
      ? filters.roles.filter(r => r !== role)
      : [...filters.roles, role];
    onFilterChange({ ...filters, roles: newRoles });
  };

  const timeRangeOptions = [
    { value: 'all', label: '🕒 All Time', description: 'Show all users' },
    { value: 'day', label: '📅 Today', description: 'Joined in the last 24 hours' },
    { value: 'week', label: '📆 This Week', description: 'Joined in the last 7 days' },
    { value: 'month', label: '📅 This Month', description: 'Joined in the last 30 days' },
    { value: 'year', label: '📅 This Year', description: 'Joined this year' }
  ] as const;

  const sortOptions = [
    { value: 'most_active', label: '🔥 Most Active', description: 'Sort by recent activity' },
    { value: 'newest', label: '✨ Newest Members', description: 'Sort by join date' },
    { value: 'most_posts', label: '📝 Top Posters', description: 'Sort by number of posts' },
    { value: 'most_likes', label: '❤️ Most Liked', description: 'Sort by received likes' }
  ] as const;

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
              placeholder="Search users..."
              className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Role Filters */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              User Roles
            </label>
            <div className="flex flex-wrap gap-2">
              {(['member', 'premium', 'moderator', 'admin', 'banned'] as UserRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleToggle(role)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.roles.includes(role)
                      ? role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : role === 'moderator' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : role === 'premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : role === 'banned' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {role.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range with Labels */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              Registration Period
            </label>
            <div className="flex flex-wrap gap-2">
              {timeRangeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange({ ...filters, timeRange: option.value })}
                  className={`group relative px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.timeRange === option.value
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span>{option.label}</span>
                  {/* Tooltip */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Sort Options with Labels */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange({ ...filters, sortBy: option.value })}
                  className={`group relative px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.sortBy === option.value
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span>{option.label}</span>
                  {/* Tooltip */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Premium Filter */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              Account Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onFilterChange({ ...filters, isPremium: null })}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  filters.isPremium === null
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, isPremium: true })}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  filters.isPremium === true
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Premium Only
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, isPremium: false })}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  filters.isPremium === false
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Standard Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
