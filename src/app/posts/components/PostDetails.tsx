'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostMetadata } from './PostMetadata';
import { PostTags } from './PostTags';
import { PostComments } from './PostComments';
import { ReverseSearch } from './ReverseSearch';

const DEFAULT_AVATAR = '/images/defaultavatar.png';

interface PostData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  uploadDate: string;
  uploader: {
    id: string;
    name: string;
    avatar: string | null;
    premium: boolean;
    joinDate: string;
    stats: {
      totalPosts: number;
      totalLikes: number;
      totalViews: number;
      level: number;
      xp: number;
      xpNeeded: number;
    };
  };
  stats: {
    views: number;
    likes: number;
    dislikes: number;
    comments: number;
    favorites: number;
  };
  meta: {
    width: number;
    height: number;
    size: number;
    format: string;
    source: string | null;
  };
  tags: Array<{
    id: string;
    name: string;
    type: 'general' | 'character' | 'copyright' | 'artist' | 'meta';
    count: number;
  }>;
  contentRating: 'safe' | 'sketchy' | 'unsafe';
  isAnimated: boolean;
}

const MOCK_POST: PostData = {
  id: "post-1",
  title: "Amazing Artwork #1",
  description: "This is a beautiful piece of art that I found.",
  imageUrl: "https://picsum.photos/1200/800",       // Geändert zu picsum
  thumbnailUrl: "https://picsum.photos/1200/800",   // Geändert zu picsum
  uploadDate: "2023-12-24T12:00:00Z",
  uploader: {
    id: "user1",
    name: "User1",
    avatar: null,
    premium: true,
    joinDate: "2023-01-15T08:30:00Z",
    stats: {
      totalPosts: 342,
      totalLikes: 15678,
      totalViews: 89432,
      level: 42,
      xp: 8234,
      xpNeeded: 10000
    }
  },
  stats: {
    views: 1234,
    likes: 567,
    dislikes: 12,
    comments: 89,
    favorites: 123
  },
  meta: {
    width: 1200,
    height: 800,
    size: 1024576, // in bytes
    format: "PNG",
    source: "https://original-source.com/image.png"
  },
  tags: [
    { id: "1", name: "artwork", type: "general", count: 5432 },
    { id: "2", name: "digital art", type: "meta", count: 3211 },
    { id: "3", name: "character name", type: "character", count: 789 },
    { id: "4", name: "artist name", type: "artist", count: 456 }
  ],
  contentRating: "safe",
  isAnimated: false
};

export function PostDetails({ postId }: { postId: string }) {
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Voting Handler
  const handleVote = (type: 'like' | 'dislike') => {
    if (userVote === type) {
      setUserVote(null);
      setPost(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          likes: type === 'like' ? prev.stats.likes - 1 : prev.stats.likes,
          dislikes: type === 'dislike' ? prev.stats.dislikes - 1 : prev.stats.dislikes
        }
      } : null);
    } else {
      setUserVote(type);
      setPost(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          likes: type === 'like' ? prev.stats.likes + 1 : 
                 userVote === 'like' ? prev.stats.likes - 1 : prev.stats.likes,
          dislikes: type === 'dislike' ? prev.stats.dislikes + 1 : 
                    userVote === 'dislike' ? prev.stats.dislikes - 1 : prev.stats.dislikes
        }
      } : null);
    }
  };

  // Favorite Handler
  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    setPost(prev => prev ? {
      ...prev,
      stats: {
        ...prev.stats,
        favorites: isFavorited ? prev.stats.favorites - 1 : prev.stats.favorites + 1
      }
    } : null);
  };

  useEffect(() => {
    // Simuliere API-Call
    const fetchPost = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setPost(MOCK_POST);
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 rounded-xl bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-center">
        <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-red-800 dark:text-red-200 mb-2">
          Post not found
        </h2>
        <p className="text-red-600 dark:text-red-300">
          The post with ID &quot;{postId}&quot; does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
        {/* Left Column - Image and Comments */}
        <div className="space-y-6">
          {/* Image Container */}
          <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
            <Image
              src={post.imageUrl}
              alt={post.title}
              width={1200}
              height={800}
              className="w-full h-auto"
              unoptimized        // Option hinzugefügt
              priority          // Option hinzugefügt
            />
            
            {/* Content Rating Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                post.contentRating === 'safe' 
                  ? 'bg-green-500/40 text-white border border-green-500/50'
                  : post.contentRating === 'sketchy'
                    ? 'bg-yellow-500/40 text-white border border-yellow-500/50'
                    : 'bg-red-500/40 text-white border border-red-500/50'
              }`}>
                {post.contentRating.toUpperCase()}
              </span>
            </div>

            {/* Voting Buttons */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={() => handleVote('like')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                  userVote === 'like'
                    ? 'bg-green-500/80 text-white'
                    : 'bg-gray-900/50 hover:bg-gray-900/60 text-white backdrop-blur-sm'
                }`}
              >
                <span className="text-base">👍</span>
                <span>{post.stats.likes}</span>
              </button>
              <button
                onClick={() => handleVote('dislike')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                  userVote === 'dislike'
                    ? 'bg-red-500/80 text-white'
                    : 'bg-gray-900/50 hover:bg-gray-900/60 text-white backdrop-blur-sm'
                }`}
              >
                <span className="text-base">👎</span>
                <span>{post.stats.dislikes}</span>
              </button>
              <button
                onClick={handleFavorite}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                  isFavorited
                    ? 'bg-purple-500/80 text-white'
                    : 'bg-gray-900/50 hover:bg-gray-900/60 text-white backdrop-blur-sm'
                }`}
              >
                <span className="text-base">{isFavorited ? '❤️' : '🤍'}</span>
                <span>{post.stats.favorites}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <PostComments postId={postId} />
        </div>

        {/* Right Column - Metadata and Tags */}
        <div className="space-y-6">
          {/* Title and Description */}
          <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
            <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              {post.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {post.description}
            </p>
          </div>

          {/* Uploader Info */}
          <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-3">
              <Link href={`/user/${post.uploader.name.toLowerCase()}`} className="block">
                <div className={`w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0
                  ${post.uploader.premium ? 'ring-2 ring-purple-400 dark:ring-purple-600' : ''}`}>
                  <Image 
                    src={post.uploader.avatar || DEFAULT_AVATAR}
                    alt={`${post.uploader.name}'s avatar`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              
              <div className="flex-grow">
                <Link href={`/user/${post.uploader.name.toLowerCase()}`}
                  className={`font-medium hover:opacity-80 transition-opacity ${
                    post.uploader.premium 
                      ? 'bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                  {post.uploader.name}
                </Link>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span>Member since {new Date(post.uploader.joinDate).toLocaleDateString()}</span>
                  {post.uploader.premium && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/40 text-white border border-purple-500/50">
                      PREMIUM
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
                <div className="font-medium text-gray-900 dark:text-gray-100">{post.uploader.stats.totalPosts}</div>
                <div className="text-gray-500">Posts</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
                <div className="font-medium text-gray-900 dark:text-gray-100">{post.uploader.stats.totalLikes}</div>
                <div className="text-gray-500">Likes</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
                <div className="font-medium text-gray-900 dark:text-gray-100">{post.uploader.stats.totalViews}</div>
                <div className="text-gray-500">Views</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 py-2 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{post.stats.views}</div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{post.stats.likes}</div>
                <div className="text-xs text-gray-500">Likes</div>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{post.stats.favorites}</div>
                <div className="text-xs text-gray-500">Favorites</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <PostTags tags={post.tags} />

          {/* Pools */}
          <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Featured in Pools</h3>
            <div className="space-y-2">
              {[
                { id: 'pool-1', name: 'Best Artworks 2024', items: 156, cover: "https://picsum.photos/400/225?random=1" },
                { id: 'pool-2', name: 'Character Collection', items: 89, cover: "https://picsum.photos/400/225?random=2" },
                { id: 'pool-3', name: 'Digital Art Showcase', items: 234, cover: "https://picsum.photos/400/225?random=3" }
              ].map(pool => (
                <Link
                  key={pool.id}
                  href={`/pool/${pool.id.replace('pool-', '')}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  {/* Pool Cover Preview */}
                  <div className="relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-800">
                    <Image
                      src={pool.cover}
                      alt={`Cover for ${pool.name}`}
                      fill
                      className="object-cover group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                  {/* Pool Info */}
                  <div className="flex-grow min-w-0">
                    <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {pool.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {pool.items} items
                    </div>
                  </div>
                  {/* Arrow Icon */}
                  <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    →
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <PostMetadata 
            meta={{
              ...post.meta,
              uploadDate: post.uploadDate // Füge das Uploaddatum zu den Metadaten hinzu
            }} 
          />

          {/* Reverse Search */}
          <ReverseSearch imageUrl={post.thumbnailUrl} />
        </div>
      </div>
    </div>
  );
}
