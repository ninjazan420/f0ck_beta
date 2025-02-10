'use client';
import { useState } from 'react';
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";
import { PostFilter } from "./PostFilter";
import { PostGrid } from "./PostGrid";

export type ContentRating = 'safe' | 'sketchy' | 'unsafe';

export function PostsPage() {
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [filters, setFilters] = useState({
    searchText: '',
    tags: [] as string[],
    uploader: '',
    commenter: '',
    minLikes: 0,
    contentRating: [] as ContentRating[],
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest' as 'newest' | 'oldest' | 'most_liked' | 'most_commented'
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 flex-grow space-y-2">
        <PostFilter 
          filters={filters} 
          onFilterChange={setFilters}
          infiniteScroll={infiniteScroll}
          onToggleInfiniteScroll={setInfiniteScroll}
        />

        <PostGrid 
          filters={filters} 
          infiniteScroll={infiniteScroll} 
        />
      </div>
      <footer className="mt-2">
        <Footer />
      </footer>
    </div>
  );
}
