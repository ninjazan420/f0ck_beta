'use client';
import Link from 'next/link';

export function PostNavigation({ currentId }: { currentId: string }) {
  // Extract numeric part from ID (assuming format "post-123")
  const currentNum = parseInt(currentId.replace('post-', ''));
  const prevId = `post-${currentNum - 1}`;
  const nextId = `post-${currentNum + 1}`;

  return (
    <div className="flex justify-between items-center gap-4">
      <Link
        href={`/posts/${prevId}`}
        className={`px-4 py-2 rounded-lg bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm 
          border border-gray-100 dark:border-gray-800 
          text-gray-600 dark:text-gray-300 
          hover:bg-purple-50 dark:hover:bg-purple-900/20
          transition-colors ${currentNum <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
      >
        ← Previous
      </Link>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Post #{currentNum}
      </div>

      <Link
        href={`/posts/${nextId}`}
        className="px-4 py-2 rounded-lg bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm 
          border border-gray-100 dark:border-gray-800 
          text-gray-600 dark:text-gray-300 
          hover:bg-purple-50 dark:hover:bg-purple-900/20
          transition-colors"
      >
        Next →
      </Link>
    </div>
  );
}
