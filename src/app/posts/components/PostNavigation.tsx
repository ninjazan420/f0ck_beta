'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PostNavigationProps {
  currentId: string;
  nextPostId?: string | null;
  previousPostId?: string | null;
}

export function PostNavigation({ currentId, nextPostId, previousPostId }: PostNavigationProps) {
  const router = useRouter();

  // Add keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Previous post: Left arrow or A
      if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && previousPostId) {
        router.push(`/post/${previousPostId}`);
      }
      // Next post: Right arrow or D
      else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && nextPostId) {
        router.push(`/post/${nextPostId}`);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentId, previousPostId, nextPostId, router]);

  return (
    <div className="flex items-center justify-between">
      {previousPostId ? (
        <Link 
          href={`/post/${previousPostId}`}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          ← Previous
        </Link>
      ) : (
        <div className="p-2 invisible">← Previous</div>
      )}

      <Link
        href="/posts"
        className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
      >
        Back to Posts
      </Link>

      {nextPostId ? (
        <Link 
          href={`/post/${nextPostId}`}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          Next →
        </Link>
      ) : (
        <div className="p-2 invisible">Next →</div>
      )}
    </div>
  );
}
