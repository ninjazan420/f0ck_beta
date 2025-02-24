'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filters } from './UsersPage';

export interface UserListProps {
  filters: Filters;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface User {
  username: string;
  bio: string;
  createdAt: string;
  lastSeen: string;
  premium?: boolean;
  role: 'user' | 'moderator' | 'admin' | 'banned';
  stats: {
    uploads?: number;
    comments?: number;
    favorites?: number;
    likes?: number;
    tags?: number;
  };
}

export function UserList({ filters, page, totalPages, onPageChange }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          search: filters.search,
          sortBy: filters.sortBy,
          roles: filters.roles.join(','),
          isPremium: filters.isPremium?.toString() || ''
        });

        const response = await fetch(`/api/users?${searchParams}`);
        if (!response.ok) throw new Error('Fehler beim Laden der Benutzer');
        
        const data = await response.json();
        setUsers(data.users);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters, page]);

  if (loading) {
    return <div className="animate-pulse">Lade Benutzer...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => (
          <Link
            key={user.username}
            href={`/user/${user.username}`}
            className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xl">{user.username[0].toUpperCase()}</span>
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{user.username}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    user.role === 'admin' ? 'bg-red-500/40 text-white border border-red-500/50' :
                    user.role === 'moderator' ? 'bg-blue-500/40 text-white border border-blue-500/50' :
                    user.role === 'banned' ? 'bg-gray-900/80 text-white border border-gray-700/50' :
                    user.role === 'premium' ? 'bg-purple-500/40 text-white border border-purple-500/50' :
                    'bg-gray-500/40 text-white border border-gray-500/50'
                  }`}>
                    {user.role === 'admin' ? 'ADMIN' :
                     user.role === 'moderator' ? 'MOD' :
                     user.role === 'banned' ? 'BANNED' :
                     user.role === 'premium' ? 'PREMIUM' : 'MEMBER'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {user.bio || "No bio yet"}
                </p>
                
                {/* Stats Grid */}
                <div className="mt-2 grid grid-cols-5 gap-2 text-xs text-gray-400">
                  <div>
                    <span className="block">uploads</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {user.stats?.uploads || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block">favorites</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {user.stats?.favorites || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block">likes</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {user.stats?.likes || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block">comments</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {user.stats?.comments || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block">tags</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {user.stats?.tags || 0}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 space-y-0.5 text-xs text-gray-400">
                  <div>Member since: {new Date(user.createdAt).toLocaleDateString()}</div>
                  <div>Last seen: {new Date(user.lastSeen).toLocaleDateString()}</div>
                </div>

              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <button 
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 ${
            page <= 1 ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          ← Previous
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 rounded-lg ${
                  pageNum === page
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 ${
            page >= totalPages ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
