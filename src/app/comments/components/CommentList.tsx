'use client';
import { useState, useEffect, useRef } from 'react';
import { Comment } from './Comment';

interface CommentData {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  text: string;
  post: {
    id: string;
    title: string;
  };
  likes: number;
  createdAt: string;
  replyTo?: {
    id: string;
    user: {
      name: string;
    };
    preview: string;
  };
}

// Dummy-Daten für die Vorschau
const MOCK_COMMENTS: CommentData[] = Array.from({ length: 15 }, (_, i) => ({
  id: `comment-${i}`,
  user: {
    id: `user-${i % 5}`,
    name: `User${i % 5}`,
    avatar: null
  },
  text: i % 3 === 0 
    ? "This is a longer comment that shows how multiple lines would look like in the comment section. It might contain some interesting thoughts about the post."
    : "Nice post!",
  post: {
    id: `post-${i % 4}`,
    title: `Amazing Artwork ${i % 4 + 1}`
  },
  likes: Math.floor(Math.random() * 50),
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  ...(i % 4 === 0 ? {
    replyTo: {
      id: `comment-${i-1}`,
      user: { name: `User${(i-1) % 5}` },
      preview: "This is the original comment that was replied to..."
    }
  } : {})
}));

interface CommentListProps {
  filters: {
    username: string;
    searchText: string;
    dateFrom: string;
    dateTo: string;
    minLikes: number;
  };
  infiniteScroll: boolean;
}

export function CommentList({ filters, infiniteScroll }: CommentListProps) {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [displayedComments, setDisplayedComments] = useState<CommentData[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);
  const CHUNK_SIZE = 24;

  // Simuliere API-Call mit Pagination
  const fetchComments = async (pageNum: number, filters: CommentListProps['filters']) => {
    setIsLoading(true);
    
    // Simuliere Netzwerklatenz
    await new Promise(resolve => setTimeout(resolve, 500));

    const startIndex = (pageNum - 1) * CHUNK_SIZE;
    const filteredComments = MOCK_COMMENTS.filter(comment => {
      if (filters.username && !comment.user.name.toLowerCase().includes(filters.username.toLowerCase())) return false;
      if (filters.searchText && !comment.text.toLowerCase().includes(filters.searchText.toLowerCase())) return false;
      if (filters.minLikes && comment.likes < filters.minLikes) return false;
      if (filters.dateFrom && new Date(comment.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(comment.createdAt) > new Date(filters.dateTo)) return false;
      return true;
    });

    const chunk = filteredComments.slice(startIndex, startIndex + CHUNK_SIZE);
    const hasMoreComments = startIndex + CHUNK_SIZE < filteredComments.length;

    setIsLoading(false);
    return { comments: chunk, hasMore: hasMoreComments };
  };

  // Handle infinite scroll
  useEffect(() => {
    if (!infiniteScroll || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore) {
          const nextPage = Math.floor(displayedComments.length / CHUNK_SIZE) + 1;
          const { comments, hasMore: more } = await fetchComments(nextPage, filters);
          
          setDisplayedComments(prev => [...prev, ...comments]);
          setHasMore(more);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [infiniteScroll, hasMore, isLoading, displayedComments.length, filters]);

  // Reset and load initial comments when filters or scroll mode changes
  useEffect(() => {
    const loadInitial = async () => {
      const { comments, hasMore } = await fetchComments(1, filters);
      setDisplayedComments(comments);
      setHasMore(hasMore);
      setPage(1);
    };

    loadInitial();
  }, [filters, infiniteScroll]);

  // Handle manual pagination
  const handlePageChange = async (newPage: number) => {
    const { comments, hasMore } = await fetchComments(newPage, filters);
    setDisplayedComments(comments);
    setHasMore(hasMore);
    setPage(newPage);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {displayedComments.map(comment => (
          <Comment key={comment.id} data={comment} />
        ))}
      </div>

      {infiniteScroll ? (
        hasMore && (
          <div ref={loaderRef} className="w-full h-20 flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            ) : (
              <div className="text-sm text-gray-500">Scroll for more</div>
            )}
          </div>
        )
      ) : (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            Page {page}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasMore || isLoading}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
