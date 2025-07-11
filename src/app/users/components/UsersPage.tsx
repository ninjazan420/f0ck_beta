'use client';
import { useState } from 'react';
import { UserList } from './UserList';
import { UserFilterModern } from './UserFilterModern';
import { Footer } from "@/components/Footer";

export type UserRole = 'member' | 'premium' | 'moderator' | 'admin' | 'banned';
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
    roles: ['member', 'premium', 'moderator', 'admin', 'banned'],
    isPremium: null,
    sortBy: 'most_active',
    timeRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(20);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}

      <div className="container mx-auto px-4 flex-grow space-y-6 pb-6">
        <UserFilterModern filters={filters} onFilterChange={setFilters} />
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
