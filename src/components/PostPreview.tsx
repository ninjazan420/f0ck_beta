'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface PostPreviewProps {
  post: {
    id: number;
    title: string;
    description?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    author?: {
      username: string;
      avatar?: string;
    };
    createdAt: string;
    stats?: {
      views?: number;
      likes?: number;
      comments?: number;
    };
    tags?: string[];
  };
}

export function PostPreview({ post }: PostPreviewProps) {
  const [imageError, setImageError] = useState(false);

  // Fallback für fehlende Werte
  const imageUrl = imageError ? '/placeholder-image.jpg' : (post.thumbnailUrl || post.imageUrl);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <Link href={`/post/${post.id}`}>
        <div className="aspect-[16/9] relative overflow-hidden">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform hover:scale-105"
            onError={() => setImageError(true)}
            priority
          />
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/post/${post.id}`} className="hover:underline">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{post.title}</h2>
          </Link>
        </div>
        
        {post.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{post.description}</p>
        )}
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            {post.author && (
              <Link href={`/user/${post.author.username}`} className="flex items-center hover:underline">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.username}
                    width={24}
                    height={24}
                    className="rounded-full mr-2"
                  />
                ) : (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs mr-2">
                    {post.author.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">{post.author.username}</span>
              </Link>
            )}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        {post.stats && (
          <div className="flex items-center mt-3 text-gray-500 dark:text-gray-400 text-xs">
            {post.stats.views !== undefined && (
              <span className="mr-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {post.stats.views}
              </span>
            )}
            {post.stats.likes !== undefined && (
              <span className="mr-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                {post.stats.likes}
              </span>
            )}
            {post.stats.comments !== undefined && (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
                {post.stats.comments}
              </span>
            )}
          </div>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.tags.map((tag, index) => (
              <Link 
                key={index}
                href={`/tag/${tag}`}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 