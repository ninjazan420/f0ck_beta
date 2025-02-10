'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PostMetadata } from './PostMetadata';
import { PostTags } from './PostTags';
import { PostComments } from './PostComments';
import { ReverseSearch } from './ReverseSearch';

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
  imageUrl: "https://placehold.co/1200x800",
  thumbnailUrl: "https://placehold.co/300x200",
  uploadDate: "2023-12-24T12:00:00Z",
  uploader: {
    id: "user1",
    name: "User1",
    avatar: null,
    premium: true
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
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-auto"
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
          <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Link href={`/user/${post.uploader.name.toLowerCase()}`} className="block">
                <div className={`w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0
                  ${post.uploader.premium ? 'ring-2 ring-purple-400 dark:ring-purple-600' : ''}`}>
                  {post.uploader.avatar ? (
                    <img src={post.uploader.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                      {post.uploader.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
              
              <div>
                <Link href={`/user/${post.uploader.name.toLowerCase()}`}
                  className={`font-medium hover:opacity-80 transition-opacity ${
                    post.uploader.premium 
                      ? 'bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                  {post.uploader.name}
                </Link>
                <div className="text-sm text-gray-500">
                  {new Date(post.uploadDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-medium text-gray-900 dark:text-gray-100">{post.stats.views}</div>
                <div className="text-sm text-gray-500">Views</div>
              </div>
              <div>
                <div className="text-xl font-medium text-gray-900 dark:text-gray-100">{post.stats.likes}</div>
                <div className="text-sm text-gray-500">Likes</div>
              </div>
              <div>
                <div className="text-xl font-medium text-gray-900 dark:text-gray-100">{post.stats.favorites}</div>
                <div className="text-sm text-gray-500">Favorites</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <PostTags tags={post.tags} />

          {/* Metadata */}
          <PostMetadata meta={post.meta} />

          {/* Reverse Search */}
          <ReverseSearch imageUrl={post.thumbnailUrl} />
        </div>
      </div>
    </div>
  );
}
