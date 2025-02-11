import { UserRole, Filters } from './UsersPage'; // SortBy entfernt, da nicht direkt verwendet
import Link from 'next/link';
import Image from 'next/image';

const DEFAULT_AVATAR = '/images/defaultavatar.png';

interface User {
  id: string;
  name: string;
  avatar: string | null;
  joinDate: string;
  isPremium: boolean;
  role: UserRole;
  stats: {
    posts: number;
    comments: number;
    likes: number;
    followers: number;
  };
  lastActive: string;
  style?: {
    type: string;
    gradient?: string[];
    animate?: boolean;
  };
}

// Deterministisches Mock-Data Array
const MOCK_USERS: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  name: `User${i + 1}`,
  avatar: null,
  joinDate: new Date(2024, 0, 1 + i).toISOString(),
  isPremium: i < 10,
  role: i === 0 ? 'admin' : i < 3 ? 'moderator' : 'member',
  stats: {
    posts: 1000 - i * 20,        // Deterministisch absteigend
    comments: 2000 - i * 40,     // Deterministisch absteigend
    likes: 5000 - i * 100,       // Deterministisch absteigend
    followers: 300 - i * 6       // Deterministisch absteigend
  },
  lastActive: new Date(2024, 0, 30 - i).toISOString(), // Deterministisch absteigend
  ...(i < 10 ? {
    style: {
      type: 'gradient',
      gradient: ['purple-400', 'pink-600'],
      animate: i < 5
    }
  } : {})
}));

interface UserListProps {
  filters: Filters;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function UserList({ filters, page, totalPages, onPageChange }: UserListProps) {
  const startIdx = (page - 1) * 16;
  const currentUsers = MOCK_USERS
    .filter(user =>
      (filters.search === '' || user.name.toLowerCase().includes(filters.search.toLowerCase())) &&
      filters.roles.includes(user.role) &&
      (filters.isPremium === null || user.isPremium === filters.isPremium)
    )
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        case 'most_active':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        case 'most_posts':
          return b.stats.posts - a.stats.posts;
        case 'most_likes':
          return b.stats.likes - a.stats.likes;
        default:
          return 0;
      }
    })
    .slice(startIdx, startIdx + 16);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentUsers.map(user => (
          <Link
            key={user.id}
            href={`/user/${user.name.toLowerCase()}`}
            className="block p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="space-y-3">
              {/* Avatar & Name */}
              <div className="flex flex-col items-center text-center">
                <div className={`w-24 h-24 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 mb-2
                  ${user.isPremium ? 'ring-2 ring-purple-400 dark:ring-purple-600' : ''}`}
                >
                  <Image
                    src={user.avatar || DEFAULT_AVATAR}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className={`font-medium ${
                    user.isPremium
                      ? 'bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {user.name}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {user.isPremium && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/40 text-white border border-purple-500/50">
                        PRO
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      user.role === 'admin' ? 'bg-red-500/40 text-white border border-red-500/50' :
                      user.role === 'moderator' ? 'bg-blue-500/40 text-white border border-blue-500/50' :
                      'bg-gray-500/40 text-white border border-gray-500/50'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-1 rounded bg-gray-100/50 dark:bg-gray-800/50">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{user.stats.posts}</div>
                  <div className="text-gray-500">Posts</div>
                </div>
                <div className="p-1 rounded bg-gray-100/50 dark:bg-gray-800/50">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{user.stats.followers}</div>
                  <div className="text-gray-500">Followers</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
