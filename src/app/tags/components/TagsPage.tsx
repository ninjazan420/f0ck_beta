'use client';
import { useState, useEffect } from 'react';
import { TagList } from './TagList';
import { TagFilter } from './TagFilter';
import { Footer } from "@/components/Footer";

export type SortBy = 'most_used' | 'newest' | 'alphabetical' | 'trending';

interface Filters {
  search: string;
  minPosts: number;
  sortBy: SortBy;
  author: string;
  usedBy: string;
  timeRange: 'all' | 'day' | 'week' | 'month' | 'year';
}

interface Tag {
  id: string;
  name: string;
  postsCount: number;
  newPostsToday: number;
  newPostsThisWeek: number;
  createdAt: string;
  updatedAt: string;
}

export function TagsPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    minPosts: 0,
    sortBy: 'most_used',
    author: '',
    usedBy: '',
    timeRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);

  // Zurücksetzen der Seite bei Filteränderungen
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Fetch live data
  useEffect(() => {
    async function fetchTags() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        params.append('page', currentPage.toString());
        params.append('sortBy', filters.sortBy);
        
        // Weitere Filter hinzufügen
        if (filters.author) params.append('author', filters.author);
        if (filters.usedBy) params.append('usedBy', filters.usedBy);
        if (filters.timeRange !== 'all') params.append('timeRange', filters.timeRange);
        if (filters.minPosts > 0) params.append('minPosts', filters.minPosts.toString());
        
        const response = await fetch(`/api/tags?${params.toString()}`);
        const data = await response.json();
        
        if (data.tags) {
          setTags(data.tags);
          setTotalPages(data.pagination.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        setTags([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTags();
  }, [filters, currentPage]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 flex-grow space-y-6 pb-6">
        <TagFilter filters={filters} onFilterChange={setFilters} />
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <TagList tags={tags} filters={filters} page={currentPage} />
        )}
        
        {/* Pagination */}
        {totalPages > 0 && (
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
        )}
      </div>
      
      <Footer />
    </div>
  );
}
