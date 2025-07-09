'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CommentFilter } from './components/CommentFilter';

const COMMENTS_INFINITE_SCROLL_KEY = 'commentsInfiniteScrollPreference';

export default function CommentsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    username: searchParams.get('author') || '',
    searchText: searchParams.get('search') || '',
    dateFrom: searchParams.get('from') || '',
    dateTo: searchParams.get('to') || '',
    minLikes: parseInt(searchParams.get('min_likes') || '0'),
  });
  const [infiniteScroll, setInfiniteScroll] = useState(false);

  // Load infinite scroll preference for comments specifically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedInfiniteScroll = localStorage.getItem(COMMENTS_INFINITE_SCROLL_KEY);
      if (savedInfiniteScroll !== null) {
        setInfiniteScroll(savedInfiniteScroll === 'true');
      }
    }
  }, []);
  
  // Weitere Zustandsvariablen für Kommentare, Pagination etc.
  
  // Lade Kommentare mit den aktuellen Filtern
  useEffect(() => {
    loadComments();
  }, [filters]);
  
  const loadComments = async () => {
    // Implementation zum Laden der Kommentare
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Comments</h1>
      
      <CommentFilter
        filters={filters}
        onFilterChange={setFilters}
        infiniteScroll={infiniteScroll}
        onToggleInfiniteScroll={(enabled: boolean) => {
          setInfiniteScroll(enabled);
          // Save the preference to localStorage with comments-specific key
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(COMMENTS_INFINITE_SCROLL_KEY, enabled.toString());
            } catch (error) {
              console.error('Error saving comments infinite scroll preference:', error);
            }
          }
        }}
      />
      
      {/* Kommentar-Liste */}
    </div>
  );
} 