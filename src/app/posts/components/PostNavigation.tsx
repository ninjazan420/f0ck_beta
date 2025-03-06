'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PostNavigationProps {
  currentId: string;
}

export function PostNavigation({ currentId }: PostNavigationProps) {
  const router = useRouter();
  const [maxPostId, setMaxPostId] = useState<number | null>(null);
  const currentNumber = parseInt(currentId);
  const prevId = currentNumber - 1;
  const nextId = currentNumber + 1;

  // Fetch the maximum post ID when the component mounts
  useEffect(() => {
    async function fetchTotalPosts() {
      try {
        // Fetch posts with limit=1 to just get the total count
        const response = await fetch('/api/posts?limit=1');
        const data = await response.json();
        setMaxPostId(data.totalPosts);
      } catch (error) {
        console.error('Error fetching total posts:', error);
      }
    }
    
    fetchTotalPosts();
  }, []);

  // Add keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Previous post: Left arrow or A
      if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && prevId > 0) {
        router.push(`/post/${prevId}`);
      }
      // Next post: Right arrow or D
      else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && maxPostId !== null && nextId <= maxPostId) {
        router.push(`/post/${nextId}`);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentNumber, prevId, nextId, maxPostId, router]);

  // Don't show the "Previous" button if we're at the first post
  const showPrevious = prevId > 0;
  
  // Don't show the "Next" button if we're at the last post
  const showNext = maxPostId !== null && nextId <= maxPostId;

  return (
    <div className="flex items-center justify-between">
      {showPrevious ? (
        <Link 
          href={`/post/${prevId}`}
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

      {showNext ? (
        <Link 
          href={`/post/${nextId}`}
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
