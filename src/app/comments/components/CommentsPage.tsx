'use client';
import { useState } from 'react';
import { Footer } from "@/components/Footer";
import { CommentFilter } from "./CommentFilter";
import { CommentList } from "./CommentList";

export function CommentsPage() {
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [filters, setFilters] = useState({
    username: '',
    searchText: '',
    dateFrom: '',
    dateTo: '',
    minLikes: 0
  });

  const handleInfiniteScrollToggle = (enabled: boolean) => {
    setInfiniteScroll(enabled);
    setShowFeedback({
      message: enabled ? 'Infinite scroll activated' : 'Infinite scroll deactivated',
      type: enabled ? 'success' : 'info'
    });

    // Hide feedback after 2 seconds
    setTimeout(() => {
      setShowFeedback(null);
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">      
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
