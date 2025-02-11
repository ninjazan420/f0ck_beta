'use client';
import { useState } from 'react';
import { UserList } from './UserList';
import { UserFilter } from './UserFilter';
import { Footer } from "@/components/Footer";
import Link from 'next/link'

export type UserRole = 'member' | 'moderator' | 'admin' | 'banned';
export type SortBy = 'newest' | 'most_active' | 'most_posts' | 'most_likes';

export interface Filters {
  search: string;
  roles: UserRole[];
  isPremium: boolean | null;
  sortBy: SortBy;
  timeRange: 'all' | 'day' | 'week' | 'month' | 'year';
}

export function UsersPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    roles: ['member', 'moderator', 'admin'],
    isPremium: null,
    sortBy: 'most_active',
    timeRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(20);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <div className="border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 h-14">
            <Link 
              href="/posts"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
            >
              <span>🖼️</span>
              <span>Posts</span>
            </Link>
            <Link 
              href="/users"
              className="text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 flex items-center gap-1 h-full"
            >
              <span>👥</span>
              <span>Users</span>
            </Link>
            <Link 
              href="/pools"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
            >
              <span>📑</span>
              <span>Pools</span>
            </Link>
            <Link 
              href="/tags"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
            >
              <span>🏷️</span>
              <span>Tags</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 flex-grow space-y-6 pb-6">
        <UserFilter filters={filters} onFilterChange={setFilters} />
        <UserList 
          filters={filters}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <Footer />
    </div>
  );
}
