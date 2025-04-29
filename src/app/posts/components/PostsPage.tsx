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
  const [showFeedback, setShowFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Get current page from URL or default to 1
  const getPageFromUrl = () => {
    const offsetParam = searchParams.get('offset');
    return offsetParam
      ? Math.floor(parseInt(offsetParam || '0') / POSTS_PER_PAGE) + 1
      : 1;
  };

  const [currentPage, setCurrentPage] = useState(getPageFromUrl());

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

  // Verbesserter useEffect für tag-Parameter
  useEffect(() => {
    const tagParam = searchParams.get('tag');

    if (tagParam) {
      console.log('Tag parameter found in URL:', tagParam);

      // Check if the tag is already in our filters
      const hasTag = filters.tags.includes(tagParam);

      if (!hasTag) {
        console.log('Adding tag to filters:', tagParam);
        // Verzögern Sie die Aktualisierung leicht, um Race Conditions zu vermeiden
        setTimeout(() => {
          setFilters(prev => ({
            ...prev,
            tags: [...prev.tags, tagParam]
          }));
        }, 50);

        // Speichern des Tags im Session Storage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('active_tag_filter', tagParam);
          // Setzen eines Flags, um zu verhindern, dass andere useEffects die Filter überschreiben
          sessionStorage.setItem('tag_filter_applied', 'true');
        }
      }
    }
  }, [searchParams]);

  // Vereinfachte Überwachung von URL-Änderungen für Seitennavigation und Tags
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleRouteChange = () => {
        const params = new URLSearchParams(window.location.search);

        // Überprüfe Tags
        const tagParam = params.get('tag');
        if (tagParam) {
          // Wenn wir einen Tag in der URL haben, stellen Sie sicher, dass er angewendet wird
          console.log('Route changed with tag:', tagParam);

          setFilters(prev => {
            if (!prev.tags.includes(tagParam)) {
              return {
                ...prev,
                tags: [...prev.tags, tagParam]
              };
            }
            return prev;
          });
        } else {
          // Wenn kein Tag in der URL, aber wir haben Tags im Filter, setzen Sie sie zurück
          if (filters.tags.length > 0 && !window.location.href.includes('tag=')) {
            console.log('Clearing tag filters as URL has no tag parameter');
            setFilters(prev => ({
              ...prev,
              tags: []
            }));
            sessionStorage.removeItem('active_tag_filter');
          }
        }
      };

      // Reagiere auf Browser-Navigationsereignisse (zurück/vorwärts)
      window.addEventListener('popstate', handleRouteChange);

      return () => window.removeEventListener('popstate', handleRouteChange);
    }
  }, [filters.tags]);

  // Überwache searchParams für Änderungen der Seite - vereinfacht
  useEffect(() => {
    // Aktualisiere die Seite, wenn sich die URL ändert
    const newPage = getPageFromUrl();
    if (newPage !== currentPage) {
      console.log(`Page changed from searchParams: ${currentPage} -> ${newPage}`);
      setCurrentPage(newPage);
    }
  }, [searchParams]);

  // Update URL when page changes - vereinfacht
  useEffect(() => {
    if (typeof window !== 'undefined' && !infiniteScroll) {
      try {
        // Verhindere unnötige URL-Updates, wenn die Seite bereits in der URL ist
        const currentOffset = searchParams.get('offset');
        const newOffset = (currentPage - 1) * POSTS_PER_PAGE;

        // Nur aktualisieren, wenn sich der Offset tatsächlich geändert hat
        if ((currentOffset === null && newOffset > 0) ||
            (currentOffset !== null && parseInt(currentOffset) !== newOffset)) {

          const params = new URLSearchParams(window.location.search);

          if (newOffset === 0) {
            params.delete('offset');
          } else {
            params.set('offset', newOffset.toString());
          }

          const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;

          // Verwende replaceState statt pushState, um keinen neuen Eintrag in der Browser-Historie zu erstellen
          // Dies verhindert, dass zu viele Einträge in der Historie entstehen
          window.history.replaceState({ path: newUrl }, '', newUrl);

          console.log(`URL updated for page ${currentPage}, offset ${newOffset}`);
        }
      } catch (error) {
        console.error("Error updating URL:", error);
      }
    }
  }, [currentPage, infiniteScroll, searchParams]);

  // Verbesserte Initialisierung der Filter
  useEffect(() => {
    try {
      // Prüfen, ob im Browser-Umfeld (nicht SSR)
      if (typeof window !== 'undefined') {
        // Load infinite scroll preference
        const savedInfiniteScroll = localStorage.getItem('infiniteScrollPreference');
        if (savedInfiniteScroll !== null) {
          setInfiniteScroll(savedInfiniteScroll === 'true');
        }

        // Standardwert festlegen
        let initialContentRating: ContentRating[] = ['safe'];

        // Prüfe zuerst auf URL-Parameter (diese haben höchste Priorität)
        const urlParams = new URLSearchParams(window.location.search);
        const ratingParams = urlParams.getAll('contentRating');

        if (ratingParams.length > 0) {
          // URL-Parameter validieren
          const validRatings = ratingParams.filter(
            (rating): rating is ContentRating =>
              rating === 'safe' || rating === 'sketchy' || rating === 'unsafe'
          );

          if (validRatings.length > 0) {
            initialContentRating = validRatings;
            console.log('Content rating from URL:', initialContentRating);

            // Speichere die URL-Parameter auch im localStorage für zukünftige Besuche
            localStorage.setItem(CONTENT_RATING_STORAGE_KEY, JSON.stringify(validRatings));
          }
        } else {
          // Wenn keine URL-Parameter, dann aus localStorage laden
          const savedContentRating = localStorage.getItem(CONTENT_RATING_STORAGE_KEY);

          if (savedContentRating) {
            try {
              const parsedRating = JSON.parse(savedContentRating) as ContentRating[];
              // Nur gültige ContentRating-Werte übernehmen
              const validRatings = parsedRating.filter(
                (rating): rating is ContentRating =>
                  rating === 'safe' || rating === 'sketchy' || rating === 'unsafe'
              );

              if (validRatings.length > 0) {
                initialContentRating = validRatings;
                console.log('Content rating from localStorage:', initialContentRating);
              }
            } catch (error) {
              console.error('Fehler beim Parsen des gespeicherten Content Ratings:', error);
            }
          }
        }

        // Aktualisiere den Filter-Zustand mit den ermittelten Werten
        // Verzögere die Aktualisierung leicht, um sicherzustellen, dass sie nach anderen Initialisierungen erfolgt
        setTimeout(() => {
          console.log('Setting initial content rating:', initialContentRating);
          setFilters(prev => ({
            ...prev,
            contentRating: initialContentRating
          }));
        }, 50);
      }
    } catch (error) {
      console.error('Fehler beim Laden der gespeicherten Einstellungen:', error);
      // Bei Fehlern den Standard verwenden
    }
  }, []);

  // ContentRating speichern, wenn es sich ändert
  const handleFilterChange = (newFilters: typeof filters) => {
    // Prüfen, ob sich die Filter tatsächlich geändert haben
    const filtersChanged = JSON.stringify(newFilters) !== JSON.stringify(filters);
    const contentRatingChanged = JSON.stringify(newFilters.contentRating) !== JSON.stringify(filters.contentRating);

    // Aktualisiere den Filter-Zustand
    setFilters(newFilters);

    // Reset to page 1 when filters change
    if (filtersChanged) {
      setCurrentPage(1);
    }

    // Speichern der ContentRating-Einstellungen im localStorage
    if (typeof window !== 'undefined' && contentRatingChanged) {
      try {
        console.log('Saving content rating to localStorage:', newFilters.contentRating);
        localStorage.setItem(CONTENT_RATING_STORAGE_KEY, JSON.stringify(newFilters.contentRating));

        // Aktualisiere auch die URL, um die Filter zu reflektieren
        const params = new URLSearchParams(window.location.search);

        // Entferne alte contentRating-Parameter
        const oldParams = params.getAll('contentRating');
        if (oldParams.length > 0) {
          oldParams.forEach(() => params.delete('contentRating'));
        }

        // Füge neue contentRating-Parameter hinzu
        newFilters.contentRating.forEach(rating => {
          params.append('contentRating', rating);
        });

        // Aktualisiere die URL
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      } catch (error) {
        console.error('Fehler beim Speichern der Content-Rating-Einstellungen:', error);
      }
    }
  };

  // Handle infinite scroll toggle with localStorage persistence
  const handleInfiniteScrollToggle = (value: boolean) => {
    setInfiniteScroll(value);

    // Show feedback message
    setShowFeedback({
      message: value ? 'Infinite scroll activated' : 'Infinite scroll deactivated',
      type: value ? 'success' : 'info'
    });

    // Hide feedback after 2 seconds
    setTimeout(() => {
      setShowFeedback(null);
    }, 2000);

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
      {showFeedback && (
        <div
          className={`
            fixed inset-x-0 top-16 pointer-events-none z-50
            flex items-center justify-center
          `}
        >
          <div className={`
            px-4 py-2 rounded-lg text-sm font-medium
            shadow-lg backdrop-blur-sm
            animate-fade-in-out
            ${showFeedback.type === 'success'
              ? 'bg-green-100/95 text-green-800 dark:bg-green-900/95 dark:text-green-400'
              : 'bg-blue-100/95 text-blue-800 dark:bg-blue-900/95 dark:text-blue-400'}
          `}>
            {showFeedback.message}
          </div>
        </div>
      )}

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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 text-sm"
            >
              Next →
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
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 text-sm"
            >
              ← Previous
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
