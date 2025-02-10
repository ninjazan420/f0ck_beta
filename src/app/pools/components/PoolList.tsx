import { PoolContentRating, SortBy } from './PoolsPage';
import Link from 'next/link';
import Image from 'next/image';

interface Pool {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  itemCount: number;
  viewCount: number;
  contentRating: PoolContentRating;
  creator: {
    name: string;
    isPremium: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastItemAddedAt: string;
  newItemsToday: number;
  newItemsThisWeek: number;
  contributors: number;
}

// Mock-Pools mit konsistenten Daten
const MOCK_POOLS: Pool[] = Array.from({ length: 50 }, (_, i) => ({
  id: `pool-${i + 1}`,
  name: `Collection ${i + 1}`,
  description: `A curated collection of themed images ${i + 1}`,
  thumbnail: `https://picsum.photos/400/300?random=${i}`,
  itemCount: 50 - i,
  viewCount: 1000 - i * 10,
  contentRating: ['safe', 'sketchy', 'unsafe'][Math.floor(i / 17)] as PoolContentRating,
  creator: {
    name: `User${i + 1}`,
    isPremium: i < 10
  },
  createdAt: new Date(2024, 0, 1 + i).toISOString(),
  updatedAt: new Date(2024, 0, 1 + i + Math.floor(i/2)).toISOString(),
  lastItemAddedAt: new Date(2024, 0, 1 + i + Math.floor(i/3)).toISOString(),
  newItemsToday: Math.max(0, 5 - Math.floor(i/10)),
  newItemsThisWeek: Math.max(0, 20 - Math.floor(i/5)),
  contributors: Math.max(1, 10 - Math.floor(i/5))
}));

interface PoolListProps {
  filters: {
    search: string;
    creator: string;
    contributor: string;
    contentRating: PoolContentRating[];
    minItems: number;
    sortBy: SortBy;
    timeRange: string;
  };
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PoolList({ filters, page, totalPages, onPageChange }: PoolListProps) {
  const filteredPools = MOCK_POOLS
    .filter(pool =>
      (filters.search === '' || pool.name.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.creator === '' || pool.creator.name.toLowerCase().includes(filters.creator.toLowerCase())) &&
      filters.contentRating.includes(pool.contentRating) &&
      pool.itemCount >= filters.minItems
    )
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'most_viewed':
          return b.viewCount - a.viewCount;
        case 'most_items':
          return b.itemCount - a.itemCount;
        case 'recently_updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

  const startIdx = (page - 1) * 12;
  const currentPools = filteredPools.slice(startIdx, startIdx + 12);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {currentPools.map(pool => (
          <div
            key={pool.id}
            className="rounded-lg overflow-hidden bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
          >
            {/* Thumbnail Section - now 16:9 */}
            <Link
              href={`/pool/${pool.id.replace('pool-', '')}`} // Entferne das "pool-" Prefix
              className="block relative aspect-video group"
            >
              <Image
                src={pool.thumbnail}
                alt={pool.name}
                width={640}
                height={360}
                className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h3 className="text-white text-sm font-medium line-clamp-1">
                    {pool.name}
                  </h3>
                </div>
              </div>

              {/* Content Rating Badge */}
              <div className="absolute top-1.5 right-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  pool.contentRating === 'safe' 
                    ? 'bg-green-500/40 text-white border border-green-500/50'
                    : pool.contentRating === 'sketchy'
                      ? 'bg-yellow-500/40 text-white border border-yellow-500/50'
                      : 'bg-red-500/40 text-white border border-red-500/50'
                }`}>
                  {pool.contentRating.toUpperCase()}
                </span>
              </div>
            </Link>

            {/* Info Section - more compact */}
            <div className="p-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span>📁 {pool.itemCount}</span>
                  <span>👁️ {pool.viewCount}</span>
                </div>
                {pool.newItemsToday > 0 && (
                  <span className="text-green-600 dark:text-green-400">
                    +{pool.newItemsToday}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400">by</span>
                  <Link
                    href={`/user/${pool.creator.name.toLowerCase()}`}
                    className={`hover:underline ${
                      pool.creator.isPremium
                        ? 'bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent'
                        : 'text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {pool.creator.name}
                    {pool.creator.isPremium && (
                      <span className="ml-0.5 px-1 py-0.5 rounded text-[8px] font-medium bg-purple-500/40 text-white border border-purple-500/50">
                        PRO
                      </span>
                    )}
                  </Link>
                </div>
                {pool.contributors > 1 && (
                  <span className="text-gray-500">
                    +{pool.contributors - 1}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 pt-4">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 text-sm"
        >
          ← Previous
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = page + i - 2;
            if (pageNum < 1 || pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-lg text-sm ${
                  page === pageNum
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          {page < totalPages - 2 && <span className="text-gray-500">...</span>}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 text-sm"
        >
          Next →
        </button>
      </div>
    </div>
  );
}