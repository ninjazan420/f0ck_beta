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
}

export function PostGrid({ loading = false, filters = {}, page = 1 }: PostGridProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        const formattedPosts = data.map((post: any) => ({
          id: post.id.toString(),
          title: post.title,
          thumbnail: post.thumbnailUrl,
          url: post.imageUrl,
          likes: post.stats.likes,
          comments: post.stats.comments,
          favorites: post.stats.favorites,
          contentRating: post.contentRating,
          mediaType: 'image',
          hasAudio: false,
          author: post.author
        }));
        
        setPosts(formattedPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [page, filters]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-7 auto-rows-fr gap-4">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  // Get posts for current page
  const getPaginatedPosts = () => {
    const startIdx = (page - 1) * 28;
    return (filters.contentRating?.length
      ? posts.filter(post => filters.contentRating?.includes(post.contentRating))
      : posts).slice(startIdx, startIdx + 28);
  };

  return (
    <div className="grid grid-cols-7 auto-rows-fr gap-2">
      {getPaginatedPosts().map(post => (
        <Link
          key={post.id}
          href={`/post/${post.id}`}
          className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-[90%] h-[90%]">
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
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {/* Left Badges */}
            <div className="flex flex-col gap-1">
              {post.isPinned && (
                <span className="px-1.5 py-0.5 rounded text-[10px] leading-4 font-medium bg-blue-500/40 text-white border border-blue-500/50">
                  📌 PIN
                </span>
              )}
              {post.isAd && (
                <span className="px-1.5 py-0.5 rounded text-[10px] leading-4 font-medium bg-purple-500/40 text-white border border-purple-500/50">
                  💎 AD
                </span>
              )}
            </div>

            {/* Right Badge (Rating) */}
            <span className={`px-1.5 py-0.5 rounded text-[10px] leading-4 font-medium ${
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
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="space-y-1">
              {/* Stats and Media Type */}
              <div className="flex items-center justify-between text-gray-300 text-[10px]">
                <div className="flex items-center gap-2">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                  <span>⭐ {post.favorites}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] leading-4 font-medium bg-gray-500/40 text-white border border-gray-500/50">
                  {post.mediaType === 'gif' 
                    ? '🎞️ GIF' 
                    : post.mediaType === 'video'
                      ? '🎬 VIDEO'
                      : '🖼️ PIC'}
                  {post.mediaType === 'video' && post.hasAudio && ' 🔊'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}