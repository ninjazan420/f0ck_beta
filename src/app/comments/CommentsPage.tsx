'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CommentFilter } from './components/CommentFilter';

export default function CommentsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    username: searchParams.get('author') || '',
    searchText: searchParams.get('search') || '',
    dateFrom: searchParams.get('from') || '',
    dateTo: searchParams.get('to') || '',
    minLikes: parseInt(searchParams.get('min_likes') || '0'),
  });
  const [infiniteScroll, setInfiniteScroll] = useState(true);
  
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
        onToggleInfiniteScroll={setInfiniteScroll}
      />
      
      {/* Kommentar-Liste */}
    </div>
  );
} 