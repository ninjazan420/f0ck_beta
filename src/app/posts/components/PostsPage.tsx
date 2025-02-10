'use client';
import { useState } from 'react';
import { Footer } from "@/components/Footer";
import { PostFilter } from "./PostFilter";
import { PostGrid } from "./PostGrid";

export type ContentRating = 'safe' | 'sketchy' | 'unsafe';

export function PostsPage() {
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchText: '',
    tags: [] as string[],
    uploader: '',
    commenter: '',
    minLikes: 0,
    contentRating: ['safe'] as ContentRating[], // Default to safe content
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest' as 'newest' | 'oldest' | 'most_liked' | 'most_commented'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10; // Mock value, should come from API

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 flex-grow space-y-4 pb-4">
        <PostFilter 
          filters={filters} 
          onFilterChange={setFilters}
          infiniteScroll={infiniteScroll}
          onToggleInfiniteScroll={setInfiniteScroll}
        />

        <PostGrid 
          loading={loading}
          filters={filters} 
          infiniteScroll={infiniteScroll} 
          page={currentPage}
        />

        {/* Pagination */}
        {!infiniteScroll && (
          <div className="flex justify-center items-center gap-2 pt-2">
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
        )}
      </div>
      
      <Footer />
    </div>
  );
}
