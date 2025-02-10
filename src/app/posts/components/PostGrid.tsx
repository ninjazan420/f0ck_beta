'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ContentRating } from './PostsPage';

// Post-Interface wird direkt bei der Mock-Daten-Generierung verwendet
const MOCK_POSTS = Array.from({ length: 28 }, (_, i) => ({
  id: (i + 1).toString(), // Geändert von i + 1 zu String
  title: `Amazing Artwork ${i + 1}`,
  thumbnail: `https://picsum.photos/400/300?random=${i}`,
  likes: Math.floor(Math.random() * 1000),
  comments: Math.floor(Math.random() * 100),
  favorites: Math.floor(Math.random() * 500),
  contentRating: ['safe', 'sketchy', 'unsafe'][Math.floor(Math.random() * 3)] as ContentRating,
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  isPinned: i % 12 === 0,
  mediaType: ['image', 'gif', 'video'][Math.floor(Math.random() * 3)] as 'image' | 'gif' | 'video',
  hasAudio: Math.random() > 0.3,
  isAd: i > 0 && i % 7 === 0,
  isSponsored: i > 0 && i % 7 === 0,
}));

interface PostGridProps {
  loading?: boolean;
  filters?: {
    contentRating?: ContentRating[];
  };
  infiniteScroll?: boolean;
  page?: number;
}

export function PostGrid({ loading = false, filters = {}, page = 1 }: PostGridProps) {
  const [posts] = useState(MOCK_POSTS);

  if (loading) {
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
          <Image
            src={post.thumbnail}
            alt={post.title}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
          />
          
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
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <div className="space-y-1">
              {/* Title */}
              <div className="text-white text-xs font-medium line-clamp-1">
                {post.title}
              </div>
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