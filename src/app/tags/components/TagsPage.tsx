'use client';
import { useState } from 'react';
import { TagList } from './TagList';
import { TagFilter } from './TagFilter';
import { Footer } from "@/components/Footer";

export type TagType = 'general' | 'character' | 'copyright' | 'artist' | 'meta';
export type SortBy = 'most_used' | 'newest' | 'alphabetical' | 'trending';

interface Filters {
  search: string;
  types: TagType[];
  minPosts: number;
  sortBy: SortBy;
}

export function TagsPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    types: ['general', 'character', 'copyright', 'artist', 'meta'],
    minPosts: 0,
    sortBy: 'most_used'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 20; // Mock value

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 flex-grow space-y-6 pb-6">
        <TagFilter filters={filters} onFilterChange={setFilters} />
        <TagList filters={filters} page={currentPage} />
        
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 text-sm"
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage + i - 2;
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm ${
                    currentPage === pageNum
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {currentPage < totalPages - 2 && <span className="text-gray-500">...</span>}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 text-sm"
          >
            Next →
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
