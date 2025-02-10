'use client';
import { useState } from 'react';
import Link from 'next/link'; // Added Link import
import { UserList } from './UserList';
import { UserFilter } from './UserFilter';
import { Footer } from "@/components/Footer";

export type UserRole = 'member' | 'moderator' | 'admin';
export type SortBy = 'newest' | 'most_active' | 'most_posts' | 'most_likes';

interface Filters {
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
  const [totalPages, setTotalPages] = useState(20);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Path Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-200">Users</span>
        </div>
      </div>

      <div className="container mx-auto px-4 flex-grow space-y-6 pb-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
            Browse Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and connect with our community members
          </p>
        </div>

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
