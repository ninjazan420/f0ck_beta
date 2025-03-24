'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ContentRating } from './PostsPage';
import { getImageUrlWithCacheBuster } from '@/lib/utils';

interface Post {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  likes: number;
  comments: number;
  favorites: number;
  contentRating: 'safe' | 'sketchy' | 'unsafe';
  mediaType: 'image' | 'gif' | 'video';
  hasAudio: boolean;
  isPinned?: boolean;
  isAd?: boolean;
  author: {
    username: string;
    avatar: string | null;
    premium?: boolean;
    member?: boolean;
    admin?: boolean;
    moderator?: boolean;
  };
}

interface PostGridProps {
  loading?: boolean;
  filters?: {
    contentRating?: string[];
    searchText?: string;
    tags?: string[];
    uploader?: string;
    commenter?: string;
    minLikes?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
  };
  infiniteScroll?: boolean;
  page?: number;
  poolId?: string;
  onTotalPagesChange?: (totalPages: number) => void;
}

// Number of posts per page
export const POSTS_PER_PAGE = 28;

export function PostGrid({ 
  loading = false, 
  filters = {}, 
  page = 1, 
  infiniteScroll = false,
  onTotalPagesChange 
}: PostGridProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(loading);
  const [loadedPages, setLoadedPages] = useState<number[]>([1]); // Track which pages are loaded
  const [totalPosts, setTotalPosts] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Calculate total pages based on total posts
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  // Update parent component when total pages change
  useEffect(() => {
    if (onTotalPagesChange) {
      onTotalPagesChange(totalPages);
    }
  }, [totalPages, onTotalPagesChange]);

  // Function to fetch a specific page
  const fetchPage = async (pageNum: number) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('offset', ((pageNum - 1) * POSTS_PER_PAGE).toString());
      queryParams.append('limit', POSTS_PER_PAGE.toString());
      
      // Add filters to query parameters
      if (filters.searchText) queryParams.append('search', filters.searchText);
      if (filters.uploader) queryParams.append('uploader', filters.uploader);
      if (filters.commenter) queryParams.append('commenter', filters.commenter);
      if (filters.minLikes) queryParams.append('minLikes', filters.minLikes.toString());
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      
      // Verbesserter Tag-Filter: Speichern Sie den aktuellen Tag im sessionStorage
      if (filters.tags?.length) {
        console.log('Adding tags to API request:', filters.tags);
        filters.tags.forEach(tag => {
          queryParams.append('tag', tag);
        });
        
        // Speichern für den Fall eines unbeabsichtigten Zurücksetzens
        if (typeof window !== 'undefined' && filters.tags.length === 1) {
          sessionStorage.setItem('active_tag_filter', filters.tags[0]);
        }
      } else {
        // Prüfen, ob ein Tag im Session Storage ist, der angewendet werden sollte
        if (typeof window !== 'undefined') {
          const savedTag = sessionStorage.getItem('active_tag_filter');
          if (savedTag && window.location.href.includes('tag=')) {
            console.log('Restoring tag from sessionStorage:', savedTag);
            queryParams.append('tag', savedTag);
          }
        }
      }
      
      if (filters.contentRating?.length) {
        filters.contentRating.forEach(rating => {
          queryParams.append('contentRating', rating);
        });
      }

      // Fügen Sie einen Cache-Buster hinzu, um sicherzustellen, dass wir frische Daten erhalten
      queryParams.append('_ts', Date.now().toString());
      
      console.log(`Fetching page ${pageNum} with params:`, queryParams.toString());
      
      const response = await fetch(`/api/posts?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      
      console.log("API response for posts:", data); // Debugging log
      
      // Update total posts count if available in response
      if (data.totalPosts) {
        setTotalPosts(data.totalPosts);
        setHasMore(pageNum * POSTS_PER_PAGE < data.totalPosts);
      } else {
        // If server doesn't return total, estimate based on whether we got a full page
        setHasMore(data.posts?.length === POSTS_PER_PAGE);
      }
      
      const formattedPosts = data.posts.map((post: any) => {
        console.log("Processing post:", post); // Log jeden Post
        return {
          id: post.id,
          title: post.title,
          thumbnail: post.thumbnail, // Überprüfe diesen Wert
          url: post.imageUrl,
          likes: post.stats?.likes || 0,
          comments: post.stats?.comments || 0,
          favorites: post.stats?.favorites || 0,
          contentRating: post.contentRating,
          mediaType: post.mediaType,
          hasAudio: post.hasAudio,
          isPinned: post.isPinned,
          isAd: post.isAd || false,
          author: post.author
        };
      });
      
      console.log("Formatted posts:", formattedPosts); // Check das Ergebnis
      
      return formattedPosts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  };

  // Fetch initial page or when filters change
  useEffect(() => {
    const fetchInitialPosts = async () => {
      setIsLoading(true);
      try {
        const newPosts = await fetchPage(page);
        setPosts(newPosts);
        setLoadedPages([page]);
      } finally {
        setIsLoading(false);
      }
    };

    // Sofortiger Aufruf, um Verzögerung zu vermeiden
    fetchInitialPosts();
    
    // Keine Abhängigkeit von externen Variablen, die sich ändern könnten
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, JSON.stringify(filters)]);

  // Handle infinite scroll to load more pages
  useEffect(() => {
    if (!infiniteScroll || !hasMore) return;
    
    // Load additional pages if we're at the last page in our current set
    const loadNextPage = async () => {
      const nextPage = Math.max(...loadedPages) + 1;
      if (nextPage > totalPages && totalPages > 0) return;
      
      const newPosts = await fetchPage(nextPage);
      setPosts(prev => [...prev, ...newPosts]);
      setLoadedPages(prev => [...prev, nextPage]);
    };

    // Set up scroll event listener for infinite scroll
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      // Load more when user scrolls to bottom (with some buffer)
      if (scrollHeight - scrollTop - clientHeight < 300) {
        loadNextPage();
      }
    };

    if (infiniteScroll) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [infiniteScroll, loadedPages, hasMore, totalPages]);

  // Verbesserte Filter-Anwendung
  useEffect(() => {
    // Wir nutzen einen Debounce, um mehrere schnelle Änderungen zu vermeiden
    const timer = setTimeout(() => {
      // Wir laden nur neu, wenn sich die Filter tatsächlich geändert haben
      console.log('Filter update delayed execution with tags:', filters.tags);
      if (page === 1) {
        fetchPage(1).then(newPosts => {
          console.log(`Received ${newPosts.length} posts after filter update`);
          setPosts(newPosts);
          setLoadedPages([1]);
        });
      }
    }, 100); // 100ms Verzögerung
    
    return () => clearTimeout(timer);
  }, [JSON.stringify(filters), page]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 auto-rows-fr gap-4">
        {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  // Verbesserte Methode für die Anzeige der Posts mit Unterstützung für gepinnte Posts
  const getVisiblePosts = () => {
    if (infiniteScroll) {
      // Für Infinite Scroll, alle geladenen Posts zurückgeben (gefilteredt nach Content Rating)
      // Aber jetzt mit gepinnten Posts zuerst
      const filteredPosts = posts.filter(post => 
        !filters.contentRating?.length || filters.contentRating.includes(post.contentRating)
      );
      
      // Sortiere Posts: gepinnte Posts zuerst, dann die restlichen
      return [...filteredPosts].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
    } else {
      // Für Paginierung, nur die aktuelle Seite zurückgeben
      // Ebenfalls mit gepinnten Posts zuerst
      return [...posts].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
    }
  };

  const visiblePosts = getVisiblePosts();
  
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 auto-rows-fr gap-2">
        {visiblePosts.map((post, index) => (
          <div key={post.id} data-post-id={post.id}>
            {/* Page separator */}
            {infiniteScroll && index > 0 && index % POSTS_PER_PAGE === 0 && (
              <div className="col-span-full my-6 flex items-center justify-center">
                <div className="w-1/3 h-px bg-gray-300 dark:bg-gray-700"></div>
                <div className="px-4 text-sm text-gray-500">
                  Page {Math.floor(index / POSTS_PER_PAGE) + 1} of {totalPages || '?'}
                </div>
                <div className="w-1/3 h-px bg-gray-300 dark:bg-gray-700"></div>
              </div>
            )}
            
            <Link
              href={`/post/${post.id}`}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 block"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative">
                  <Image
                    src={getImageUrlWithCacheBuster(post.thumbnail)}
                    alt={post.title}
                    width={200}
                    height={200}
                    className="object-contain w-full h-full group-hover:opacity-75 transition-opacity"
                    unoptimized={true}
                  />
                </div>
              </div>
            
              {/* Top Badge Row */}
              <div className="absolute top-1 sm:top-2 left-1 sm:left-2 right-1 sm:right-2 flex justify-between items-start">
                {/* Left Badges */}
                <div className="flex flex-col gap-0.5 sm:gap-1">
                  {post.isPinned && (
                    <span className="px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] leading-3 sm:leading-4 font-medium bg-amber-500/40 text-white border border-amber-500/50">
                      📌 PINNED
                    </span>
                  )}
                  {post.isAd && (
                    <span className="px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] leading-3 sm:leading-4 font-medium bg-purple-500/40 text-white border border-purple-500/50">
                      💎 AD
                    </span>
                  )}
                </div>

                {/* Right Badge (Rating) */}
                <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] leading-3 sm:leading-4 font-medium ${
                  post.contentRating === 'safe' 
                    ? 'bg-green-500/40 text-white border border-green-500/50'
                    : post.contentRating === 'sketchy'
                      ? 'bg-yellow-500/40 text-white border border-yellow-500/50'
                      : 'bg-red-500/40 text-white border border-red-500/50'
                }`}>
                  {post.contentRating.toUpperCase()}
                </span>
              </div>

              {/* Bottom Info Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-1 sm:p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="space-y-0.5 sm:space-y-1">
                  {/* Stats and Media Type */}
                  <div className="flex items-center justify-between text-gray-300 text-[8px] sm:text-[10px]">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="flex items-center gap-0.5">
                        <span className="opacity-60">👍</span>
                        <span data-like-count={post.id}>{post.likes}</span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="opacity-60">❤️</span>
                        <span data-favorite-count={post.id}>{post.favorites}</span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="opacity-60">💬</span>
                        <span data-comment-count={post.id}>{post.comments}</span>
                      </span>
                    </div>
                    <span className="px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] leading-3 sm:leading-4 font-medium bg-gray-500/40 text-white border border-gray-500/50">
                      {post.mediaType === 'gif' 
                        ? '🎞️ GIF' 
                        : post.mediaType === 'video'
                          ? '🎬 VID'
                          : '🖼️ PIC'}
                      {post.mediaType === 'video' && post.hasAudio && ' 🔊'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {/* Loading indicator for infinite scroll */}
      {infiniteScroll && isLoading && posts.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}