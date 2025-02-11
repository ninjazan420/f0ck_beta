'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PoolNavigationProps {
  currentId: string;
}

export function PoolNavigation({ currentId }: PoolNavigationProps) {
  const router = useRouter();
  const currentIdNum = parseInt(currentId);

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      {/* Left Controls */}
      <div className="flex items-center gap-3">
        <Link
          href="/pools"
          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Back to Pools
        </Link>
        {currentIdNum > 1 && (
          <Link
            href={`/pool/${currentIdNum - 1}`}
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← Previous Pool
          </Link>
        )}
        <Link
          href={`/pool/${currentIdNum + 1}`}
          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Next Pool →
        </Link>
      </div>
      
      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.refresh()}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          🔄
        </button>
      </div>
    </div>
  );
}
