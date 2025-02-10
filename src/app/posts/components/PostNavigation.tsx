'use client';
import Link from 'next/link';

interface PostNavigationProps {
  currentId: string;
}

export function PostNavigation({ currentId }: PostNavigationProps) {
  // ID-Parsing angepasst - entfernt 'post-' prefix
  const currentNumber = parseInt(currentId);
  const prevId = currentNumber - 1;
  const nextId = currentNumber + 1;

  return (
    <div className="flex items-center justify-between">
      <Link 
        href={`/post/${prevId}`}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
      >
        ← Previous
      </Link>

      <Link
        href="/posts"
        className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
      >
        Back to Posts
      </Link>

      <Link 
        href={`/post/${nextId}`}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
      >
        Next →
      </Link>
    </div>
  );
}
