'use client';
import { useState } from 'react';
import { PoolList } from './PoolList';
import { PoolFilter } from './PoolFilter';
import { Footer } from "@/components/Footer";

export type PoolContentRating = 'safe' | 'sketchy' | 'unsafe';
export type SortBy = 'newest' | 'most_viewed' | 'most_items' | 'recently_updated';

interface Filters {
  search: string;
  creator: string;
  contributor: string;
  contentRating: PoolContentRating[];
  minItems: number;
  sortBy: SortBy;
  timeRange: 'all' | 'day' | 'week' | 'month' | 'year';
}

export function PoolsPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    creator: '',
    contributor: '',
    contentRating: ['safe'],
    minItems: 0,
    sortBy: 'newest',
    timeRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(20); // Mock value

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 flex-grow space-y-6 pb-6">
        <PoolFilter filters={filters} onFilterChange={setFilters} />
        <PoolList 
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
