'use client';
import { useState, useEffect, useRef } from 'react';
import { PostThumbnail } from './PostThumbnail';
import { ContentRating } from './PostsPage';

interface Post {
  id: string;
  title: string;
  thumbnail: string;
  likes: number;
  comments: number;
  favorites: number;
  contentRating: ContentRating;
  createdAt: string;
  isPinned: boolean; // Added isPinned status
  mediaType: 'image' | 'gif' | 'video'; // Added mediaType
  hasAudio: boolean; // Added hasAudio
  isAd?: boolean; // Optional flag for ads
  isSponsored?: boolean; // Optional flag for sponsored content
}

let postIdCounter = 0; // Counter für eindeutige IDs

// Mock data generator mit vereinfachten IDs
const generateMockPosts = (count: number): Post[] => 
  Array.from({ length: count }, (_, i) => {
    const uniqueId = `post-${postIdCounter++}`; // Vereinfachte ID ohne Seitennummer
    return {
      id: uniqueId,
      title: `Amazing Artwork ${postIdCounter}`,
      thumbnail: `https://picsum.photos/400/300?random=${postIdCounter}`,
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 100),
      favorites: Math.floor(Math.random() * 500),
      contentRating: ['safe', 'sketchy', 'unsafe'][Math.floor(Math.random() * 3)] as ContentRating,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      isPinned: i % 12 === 0, // Jeder 12. Post ist gepinnt
      mediaType: ['image', 'gif', 'video'][Math.floor(Math.random() * 3)] as 'image' | 'gif' | 'video',
      hasAudio: Math.random() > 0.3, // 70% der Videos haben Ton
      isAd: i > 0 && i % 7 === 0, // Jeder 7. Post ist eine Werbung (außer erster Post)
      isSponsored: i > 0 && i % 7 === 0, // Interner Flag für Ads
    };
  });

export function PostGrid({ filters, infiniteScroll }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  
  // Anpassung der Grid-Größen für 4 Reihen
  const gridSize = 28; // Fix auf 28 Posts (7x4)
  const showAds = true;

  const gridClass = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7';

  const loadPosts = async (pageNum: number) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    let newPosts = generateMockPosts(gridSize)
      .filter(post => {
        if (filters.contentRating.length && !filters.contentRating.includes(post.contentRating)) return false;
        if (filters.minLikes && post.likes < filters.minLikes) return false;
        if (filters.dateFrom && new Date(post.createdAt) < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && new Date(post.createdAt) > new Date(filters.dateTo)) return false;
        return true;
      });

    setIsLoading(false);
    return {
      posts: newPosts.slice(0, 28), // Sicherstellen, dass nie mehr als 28 Posts zurückgegeben werden
      hasMore: pageNum < 5 // Simulate limited pages
    };
  };

  useEffect(() => {
    const loadInitial = async () => {
      const { posts, hasMore } = await loadPosts(1);
      setPosts(posts);
      setHasMore(hasMore);
      setPage(1);
    };

    loadInitial();
  }, [filters]);

  useEffect(() => {
    if (!infiniteScroll || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const nextPage = page + 1;
          const { posts: newPosts, hasMore: more } = await loadPosts(nextPage);
          
          setPosts(prev => [...prev, ...newPosts]);
          setHasMore(more);
          setPage(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [infiniteScroll, hasMore, isLoading, page, filters]);

  const handlePageChange = async (newPage: number) => {
    const { posts, hasMore } = await loadPosts(newPage);
    setPosts(posts);
    setHasMore(hasMore);
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      <div className={`grid ${gridClass} gap-4`}>
        {posts.map(post => (
          <PostThumbnail key={post.id} post={post} />
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