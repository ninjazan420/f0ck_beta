'use client';

import { useState, useEffect } from 'react';
import { CommentFilter } from './CommentFilter';
import { CommentList } from './CommentList';
import { Footer } from '@/components/Footer';
import { StatusBanner } from '@/components/StatusBanner';

const COMMENTS_INFINITE_SCROLL_KEY = 'commentsInfiniteScrollPreference';

export function CommentsPage() {
  const [filters, setFilters] = useState({
    username: '',
    searchText: '',
    dateFrom: '',
    dateTo: '',
    minLikes: 0
  });

  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Load infinite scroll preference for comments specifically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedInfiniteScroll = localStorage.getItem(COMMENTS_INFINITE_SCROLL_KEY);
      if (savedInfiniteScroll !== null) {
        setInfiniteScroll(savedInfiniteScroll === 'true');
      }
    }
  }, []);

  const handleInfiniteScrollToggle = (enabled: boolean) => {
    setInfiniteScroll(enabled);
    setShowBanner(true);

    // Save the preference to localStorage with comments-specific key
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(COMMENTS_INFINITE_SCROLL_KEY, enabled.toString());
      } catch (error) {
        console.error('Error saving comments infinite scroll preference:', error);
      }
    }

    // Hide banner after 2 seconds
    setTimeout(() => {
      setShowBanner(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Status Banner */}
      <StatusBanner
        show={showBanner}
        message={infiniteScroll ? 'Infinite scroll activated' : 'Infinite scroll deactivated'}
        type="success"
      />
      
      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <div className="space-y-6">
          <CommentFilter
            filters={filters}
            onFilterChange={setFilters}
            infiniteScroll={infiniteScroll}
            onToggleInfiniteScroll={handleInfiniteScrollToggle}
          />

          <CommentList
            filters={filters}
            infiniteScroll={infiniteScroll}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
