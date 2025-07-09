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
    image: { icon: '🖼️', label: 'PIC' },
    gif: { icon: '📱', label: 'GIF' },
    video: { icon: '📹', label: 'VID' }
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

        {/* Video-Indikator für Videos */}
        {post.mediaType === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-1 left-1 flex items-center gap-1 text-[10px]">
          {post.isPinned && (
            <div className="px-1.5 py-0.5 rounded bg-amber-500/40 text-white border border-amber-500/50">
              📌 PINNED
            </div>
          )}
          {post.isAd ? (
            <div className="px-1.5 py-0.5 rounded bg-blue-400 text-white border border-purple-500/50">
              💎 AD
            </div>
          ) : (
            <div
              className={`px-1.5 py-0.5 rounded ${
                ratingColors[post.contentRating]
              }`}
            >
              {post.contentRating}
            </div>
          )}
        </div>

        {/* Info Overlay mit Medientyp-Indikator */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
          <div className="absolute left-1.5 bottom-1.5 right-1.5">
            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-300/90 line-clamp-1">
              <span className="opacity-90">
                {mediaTypeInfo[post.mediaType].icon}
              </span>
              {post.mediaType === "video" && (
                <span className="bg-purple-500/70 px-1.5 py-0.5 rounded text-white">
                  {mediaTypeInfo[post.mediaType].label}
                </span>
              )}
              {post.mediaType === "video" && !post.hasAudio && (
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
