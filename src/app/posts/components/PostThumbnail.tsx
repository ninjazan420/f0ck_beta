'use client';
import { ContentRating } from './PostsPage';
import Image from 'next/image';

interface PostProps {
  post: {
    id: string;
    title: string;
    thumbnail: string;
    likes: number;
    comments: number;
    favorites: number;
    contentRating: ContentRating;
    isPinned?: boolean;
    mediaType: 'image' | 'gif' | 'video';
    hasAudio: boolean;
    isAd?: boolean;
  };
}

export function PostThumbnail({ post }: PostProps) {
  const ratingColors = {
    safe: 'bg-green-500/40 text-white border border-green-500/50',
    sketchy: 'bg-yellow-500/40 text-white border border-yellow-500/50',
    unsafe: 'bg-red-500/40 text-white border border-red-500/50'
  };

  const mediaTypeInfo = {
    image: { icon: '🖼️' },
    gif: { icon: '📱' },
    video: { icon: '📹' }
  };

  return (
    <a href={`/post/${post.id}`} className="block group">
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Thumbnail */}
        <Image 
          src={post.thumbnail} 
          alt={post.title}
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-100 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-1 left-1 flex items-center gap-1 text-[10px]">
          {post.isPinned && (
            <div className="px-1.5 py-0.5 rounded bg-amber-500/40 text-white border border-amber-500/50">
              📌 PINNED
            </div>
          )}
          {post.isAd && (
            <div className="px-1.5 py-0.5 rounded bg-blue-500/40 text-white border border-blue-400/50">
              AD
            </div>
          )}
          <div className={`px-1.5 py-0.5 rounded ${ratingColors[post.contentRating]}`}>
            {post.contentRating}
          </div>
        </div>

        {/* Info Overlay mit Emoji-Prefix */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
          <div className="absolute left-1.5 bottom-1.5 right-1.5">
            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-300/90 line-clamp-1">
              <span className="opacity-90">{mediaTypeInfo[post.mediaType].icon}</span>
              {post.mediaType === 'video' && !post.hasAudio && (
                <span className="opacity-90">🔇</span>
              )}
              <span>{post.title}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400/90 mt-0.5">
              <span className="flex items-center gap-0.5">
                <span className="opacity-60">❤️</span>
                {post.likes}
              </span>
              <span className="flex items-center gap-0.5">
                <span className="opacity-60">💭</span>
                {post.comments}
              </span>
              <span className="flex items-center gap-0.5">
                <span className="opacity-60">⭐</span>
                {post.favorites}
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
