'use client';
import Link from 'next/link';

interface PoolNavigationProps {
  currentId: string;
}

export function PoolNavigation({ currentId }: PoolNavigationProps) {
  const currentNumber = parseInt(currentId);
  const prevId = currentNumber - 1;
  const nextId = currentNumber + 1;

  return (
    <div className="flex items-center justify-between">
      <Link 
        href={`/pool/${prevId}`}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
      >
        ← Previous Pool
      </Link>

      <Link
        href="/pools"
        className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
      >
        Back to Pools
      </Link>

      <Link 
        href={`/pool/${nextId}`}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
      >
        Next Pool →
      </Link>
    </div>
  );
}
