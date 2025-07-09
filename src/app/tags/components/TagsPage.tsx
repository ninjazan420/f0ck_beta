'use client';
import { useState, useEffect, useCallback } from 'react';
import { TagList } from './TagList';
import { TagFilterModern } from './TagFilterModern';
import { Footer } from "@/components/Footer";

export type SortBy = 'most_used' | 'newest' | 'alphabetical' | 'trending';

export interface Filters {
  search: string;
  minPosts: number;
  sortBy: SortBy;
  creator: string;
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

const ITEMS_PER_PAGE = 20;

export function TagsPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    minPosts: 0,
    sortBy: 'trending',
    creator: '',
    usedBy: '',
    timeRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      params.append('page', page.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      params.append('sortBy', filters.sortBy);

      if (filters.creator) params.append('creator', filters.creator);
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
      setError('An error occurred while fetching tags.');
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setCurrentPage(1);
    fetchTags(1);
  }, [filters, fetchTags]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchTags(currentPage);
    }
  }, [currentPage, fetchTags]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <TagFilterModern
        filters={filters}
        onFilterChange={setFilters}
      />

      <div className="mt-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">No tags found with the current filter criteria.</p>
          </div>
        ) : (
          <>
            <TagList tags={tags} filters={filters} page={currentPage} />

            <div className="mt-6 flex justify-center">
              <nav className="flex space-x-2" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === 1 || loading
                      ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  Next
                </button>

                <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md">
                  {currentPage}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === totalPages || loading
                      ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  Previous
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
