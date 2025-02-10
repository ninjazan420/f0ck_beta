'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PostGrid } from '@/app/posts/components/PostGrid';
import { PoolNavigation } from './PoolNavigation';

interface PoolDetails {
  id: string;
  name: string;
  description: string;
  cover: string;
  itemCount: number;
  viewCount: number;
  creator: {
    name: string;
    isPremium: boolean;
  };
  createdAt: string;
  updatedAt: string;
  contributors: number;
  contentRating: 'safe' | 'sketchy' | 'unsafe';
}

const MOCK_POOL: PoolDetails = {
  id: "1",
  name: "Best Artworks 2024",
  description: "A curated collection of the best artwork submissions.",
  cover: "https://picsum.photos/1200/400",
  itemCount: 156,
  viewCount: 1234,
  creator: {
    name: "Curator1",
    isPremium: true
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T12:00:00Z",
  contributors: 5,
  contentRating: "safe"
};

export function PoolDetails({ poolId }: { poolId: string }) {
  const [pool, setPool] = useState<PoolDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPool = async () => {
      setLoading(true);
      // Simuliere API-Call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPool(MOCK_POOL);
      setLoading(false);
    };

    fetchPool();
  }, [poolId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-[300px] bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Pool not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          The pool with ID {poolId} does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <PoolNavigation currentId={poolId} />
      
      {/* Pool Header */}
      <div className="relative h-[300px] rounded-xl overflow-hidden">
        <Image
          src={pool.cover}
          alt={pool.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {pool.name}
            </h1>
            <p className="text-gray-200">
              {pool.description}
            </p>
          </div>
        </div>
      </div>

      {/* Pool Info Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-500">Created by</div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            <Link 
              href={`/user/${pool.creator.name.toLowerCase()}`}
              className={pool.creator.isPremium ? 
                'bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent' : 
                ''
              }
            >
              {pool.creator.name}
            </Link>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-500">Items</div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{pool.itemCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-500">Views</div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{pool.viewCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-500">Contributors</div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{pool.contributors}</div>
        </div>
      </div>

      {/* Pool Contents */}
      <div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">
          Pool Contents
        </h2>
        <PostGrid 
          loading={false}
          filters={{
            searchText: '',
            tags: [],
            uploader: '',
            commenter: '',
            minLikes: 0,
            contentRating: [pool.contentRating],
            dateFrom: '',
            dateTo: '',
            sortBy: 'newest'
          }}
          infiniteScroll={false}
          page={1}
          poolId={poolId}
        />
      </div>
    </div>
  );
}
