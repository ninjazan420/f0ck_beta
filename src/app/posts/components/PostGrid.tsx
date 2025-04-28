'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ContentRating } from './PostsPage';
import { getImageUrlWithCacheBuster } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';

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
  // Get settings to check if NSFW blur is enabled
  const { settings } = useSettings();
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
      console.log(`fetchPage called for page ${pageNum}`);

      // Build query parameters
      const queryParams = new URLSearchParams();
      const offset = (pageNum - 1) * POSTS_PER_PAGE;
      queryParams.append('offset', offset.toString());
      queryParams.append('limit', POSTS_PER_PAGE.toString());

      console.log(`API request will use offset=${offset}, limit=${POSTS_PER_PAGE}`);

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
        console.error(`API request failed with status ${response.status}: ${response.statusText}`);
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log("API response for posts:", data); // Debugging log

      // Überprüfe, ob die Antwort die erwartete Struktur hat
      if (!data || !Array.isArray(data.posts)) {
        console.error("Invalid API response format:", data);
        throw new Error("Invalid API response format");
      }

      // Update total posts count if available in response
      if (data.totalPosts !== undefined) {
        setTotalPosts(data.totalPosts);
        setHasMore(pageNum * POSTS_PER_PAGE < data.totalPosts);
      } else {
        // If server doesn't return total, estimate based on whether we got a full page
        setHasMore(data.posts?.length === POSTS_PER_PAGE);
      }

      const formattedPosts = data.posts.map((post: any) => {
        // Überprüfe, ob der Post die erforderlichen Felder hat
        if (!post || !post.id) {
          console.warn("Invalid post data:", post);
          return null;
        }

        console.log("Processing post:", post); // Log jeden Post
        return {
          id: post.id,
          title: post.title || "Untitled",
          thumbnail: post.thumbnailUrl || post.thumbnail || "/placeholder.jpg", // Fallback für fehlende Thumbnails
          url: post.imageUrl || "",
          likes: post.stats?.likes || 0,
          comments: post.stats?.comments || 0,
          favorites: post.stats?.favorites || 0,
          contentRating: post.contentRating || "safe",
          mediaType: post.mediaType || "image",
          hasAudio: post.hasAudio || false,
          isPinned: post.isPinned || false,
          isAd: post.isAd || false,
          author: post.author || { username: "unknown" }
        };
      }).filter(Boolean); // Entferne null-Werte

      console.log("Formatted posts:", formattedPosts); // Check das Ergebnis

      return formattedPosts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Gib ein leeres Array zurück, anstatt den Fehler weiterzuleiten
      return [];
    }
  };

  // Fetch initial page or when filters change - vereinfacht und mit Debounce
  useEffect(() => {
    // Verwende eine Referenz, um den aktuellen Timer zu speichern
    const timerRef = { current: null };

    const fetchInitialPosts = async () => {
      // Setze einen Debounce-Timer, um mehrere schnelle Änderungen zu vermeiden
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          console.log(`Fetching posts for page ${page} with filters:`, filters);

          // Wichtig: Wir müssen sicherstellen, dass wir die richtigen Daten für die aktuelle Seite laden
          const offset = (page - 1) * POSTS_PER_PAGE;
          console.log(`Loading posts with offset ${offset} (page ${page})`);

          const newPosts = await fetchPage(page);
          console.log(`Received ${newPosts.length} posts for page ${page}`);

          // Setze die Posts und aktualisiere die geladenen Seiten
          setPosts(newPosts);
          setLoadedPages([page]);
        } catch (error) {
          console.error("Error in fetchInitialPosts:", error);
          // Setze leere Posts, um Fehler zu vermeiden
          setPosts([]);
        } finally {
          setIsLoading(false);
        }
      }, 100); // Kurze Verzögerung, um mehrere Anfragen zu vermeiden
    };

    // Aufruf der Funktion
    fetchInitialPosts();

    // Cleanup-Funktion
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [page, filters]);

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

  // Entferne den zusätzlichen Filter-Effekt, da er zu viele Anfragen verursacht
  // Die Filterlogik wird bereits im Haupteffekt behandelt

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
    // Wir filtern die Posts immer nach Content Rating, unabhängig vom Scroll-Modus
    // Dies stellt sicher, dass die Filter konsistent angewendet werden
    const filteredPosts = posts.filter(post => {
      // Wenn keine Content-Rating-Filter gesetzt sind, zeigen wir alle Posts an
      if (!filters.contentRating?.length) return true;

      // Sonst nur Posts anzeigen, die dem ausgewählten Content Rating entsprechen
      return filters.contentRating.includes(post.contentRating);
    });

    // Sortiere Posts: gepinnte Posts zuerst, dann die restlichen
    return [...filteredPosts].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  };

  const visiblePosts = getVisiblePosts();

  // Group posts by page for infinite scroll
  const postsByPage = infiniteScroll
    ? visiblePosts.reduce((acc, post, index) => {
        const pageNum = Math.floor(index / POSTS_PER_PAGE);
        if (!acc[pageNum]) acc[pageNum] = [];
        acc[pageNum].push(post);
        return acc;
      }, {} as Record<number, typeof visiblePosts>)
    : { 0: visiblePosts };

  return (
    <div>
      {infiniteScroll
        ? Object.entries(postsByPage).map(([pageNum, pagePosts], pageIndex) => (
            <div key={`page-${pageNum}`}>
              {/* Page separator (only show after first page) */}
              {pageIndex > 0 && (
                <div className="w-full my-6 flex items-center justify-center">
                  <div className="w-1/3 h-px bg-gray-300 dark:bg-gray-700"></div>
                  <div className="px-4 text-sm text-gray-500">
                    Page {parseInt(pageNum) + 1} of {totalPages || '?'}
                  </div>
                  <div className="w-1/3 h-px bg-gray-300 dark:bg-gray-700"></div>
                </div>
              )}

              {/* Grid for this page */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 auto-rows-fr gap-2">
                {pagePosts.map((post) => (
                  <div key={post.id} data-post-id={post.id}>
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
                    className={`object-contain w-full h-full group-hover:opacity-75 transition-opacity ${settings.blurNsfw && (post.contentRating === 'unsafe' || post.contentRating === 'sketchy') ? 'blur-md' : ''}`}
                    unoptimized={true}
                  />
                  {settings.blurNsfw && (post.contentRating === 'unsafe' || post.contentRating === 'sketchy') && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${post.contentRating === 'unsafe' ? 'bg-red-500/70' : 'bg-yellow-500/70'} text-white`}>
                        {post.contentRating.toUpperCase()}
                      </span>
                    </div>
                  )}
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
            </div>
          ))
        : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 auto-rows-fr gap-2">
            {visiblePosts.map((post) => (
              <div key={post.id} data-post-id={post.id}>
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
                        className={`object-contain w-full h-full group-hover:opacity-75 transition-opacity ${settings.blurNsfw && (post.contentRating === 'unsafe' || post.contentRating === 'sketchy') ? 'blur-md' : ''}`}
                        unoptimized={true}
                      />
                      {settings.blurNsfw && (post.contentRating === 'unsafe' || post.contentRating === 'sketchy') && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`px-2 py-1 rounded text-sm font-bold ${post.contentRating === 'unsafe' ? 'bg-red-500/70' : 'bg-yellow-500/70'} text-white`}>
                            {post.contentRating.toUpperCase()}
                          </span>
                        </div>
                      )}
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
        )
      }

      {/* Loading indicator for infinite scroll */}
      {infiniteScroll && isLoading && posts.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}