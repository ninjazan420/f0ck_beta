'use client';
import { useState, useEffect } from 'react';
import { Footer } from "@/components/Footer";
import { PostFilter } from "./PostFilter";
import { PostGrid, POSTS_PER_PAGE } from "./PostGrid";
import { useRouter, useSearchParams } from 'next/navigation';

export type ContentRating = 'safe' | 'sketchy' | 'unsafe';

// Konstante für den localStorage-Schlüssel
const CONTENT_RATING_STORAGE_KEY = 'postFilterContentRating';

export function PostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [loading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  
  // Get current page from URL or default to 1
  const initialPage = searchParams.get('offset') 
    ? Math.floor(parseInt(searchParams.get('offset') || '0') / POSTS_PER_PAGE) + 1 
    : 1;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Initialen Zustand mit leeren Werten festlegen
  const [filters, setFilters] = useState({
    searchText: '',
    tags: [] as string[],
    uploader: '',
    commenter: '',
    minLikes: 0,
    contentRating: ['safe'] as ContentRating[], // Default-Wert, wird durch useEffect überschrieben
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest' as 'newest' | 'oldest' | 'most_liked' | 'most_commented'
  });

  // Update URL when page changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !infiniteScroll) {
      const params = new URLSearchParams(window.location.search);
      const offset = (currentPage - 1) * POSTS_PER_PAGE;
      
      if (offset === 0) {
        params.delete('offset');
      } else {
        params.set('offset', offset.toString());
      }
      
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  }, [currentPage, infiniteScroll]);

  // Beim Laden der Komponente die gespeicherten Content-Rating-Einstellungen wiederherstellen
  useEffect(() => {
    try {
      // Prüfen, ob im Browser-Umfeld (nicht SSR)
      if (typeof window !== 'undefined') {
        // Load infinite scroll preference
        const savedInfiniteScroll = localStorage.getItem('infiniteScrollPreference');
        if (savedInfiniteScroll !== null) {
          setInfiniteScroll(savedInfiniteScroll === 'true');
        }
        
        const savedContentRating = localStorage.getItem(CONTENT_RATING_STORAGE_KEY);
        
        if (savedContentRating) {
          const parsedRating = JSON.parse(savedContentRating) as ContentRating[];
          // Nur aktualisieren, wenn die gespeicherten Werte valide sind
          if (Array.isArray(parsedRating) && parsedRating.length > 0) {
            // Nur gültige ContentRating-Werte übernehmen
            const validRatings = parsedRating.filter(
              (rating): rating is ContentRating => 
                rating === 'safe' || rating === 'sketchy' || rating === 'unsafe'
            );
            
            if (validRatings.length > 0) {
              setFilters(prev => ({
                ...prev,
                contentRating: validRatings
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der gespeicherten Einstellungen:', error);
      // Bei Fehlern den Standard verwenden
    }
  }, []);

  // ContentRating speichern, wenn es sich ändert
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    
    // Reset to page 1 when filters change
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      setCurrentPage(1);
    }
    
    // Speichern der ContentRating-Einstellungen im localStorage
    if (typeof window !== 'undefined' && 
        JSON.stringify(newFilters.contentRating) !== JSON.stringify(filters.contentRating)) {
      try {
        localStorage.setItem(CONTENT_RATING_STORAGE_KEY, JSON.stringify(newFilters.contentRating));
      } catch (error) {
        console.error('Fehler beim Speichern der Content-Rating-Einstellungen:', error);
      }
    }
  };

  // Handle infinite scroll toggle with localStorage persistence
  const handleInfiniteScrollToggle = (value: boolean) => {
    setInfiniteScroll(value);
    
    // Save the preference to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('infiniteScrollPreference', value.toString());
      } catch (error) {
        console.error('Fehler beim Speichern der Infinite-Scroll-Einstellung:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 flex-grow space-y-4 pb-4">
        <PostFilter 
          filters={filters} 
          onFilterChange={handleFilterChange}
          infiniteScroll={infiniteScroll}
          onToggleInfiniteScroll={handleInfiniteScrollToggle}
        />

        <PostGrid 
          loading={loading}
          filters={filters} 
          infiniteScroll={infiniteScroll} 
          page={currentPage}
          onTotalPagesChange={setTotalPages}
        />

        {/* Pagination */}
        {!infiniteScroll && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 text-sm"
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-1">
              {/* First page button if not visible in current range */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="w-8 h-8 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="text-gray-500">...</span>}
                </>
              )}
              
              {/* Page number buttons with current page highlighted */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate which page numbers to show
                let pageNum;
                if (currentPage <= 3) {
                  // Near the start, show pages 1-5
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // Near the end, show the last 5 pages
                  pageNum = totalPages - 4 + i;
                } else {
                  // In the middle, show current page and 2 pages on each side
                  pageNum = currentPage - 2 + i;
                }
                
                // Skip if outside valid range
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
              }).filter(Boolean)}
              
              {/* Last page button if not visible in current range */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="text-gray-500">...</span>}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                  >
                    {totalPages}
                  </button>
                </>
              )}
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
