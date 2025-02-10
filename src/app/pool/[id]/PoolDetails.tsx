'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PoolContentRating } from '../../pools/components/PoolsPage';

// Interfaces bleiben gleich...

const MOCK_POOL_DETAILS = {
  id: "1",
  name: "Amazing Collection",
  description: "A curated collection of the best images",
  contentRating: 'safe' as PoolContentRating,
  creator: {
    name: "User1",
    isPremium: true,
    avatar: null
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  itemCount: 42,
  viewCount: 1337,
  contributors: [
    { name: "User1", isPremium: true, itemCount: 30 },
    { name: "User2", isPremium: false, itemCount: 12 }
  ],
  items: Array.from({ length: 24 }, (_, i) => ({
    id: `${i + 1}`, // Geändert: Entferne "item-" Prefix
    title: `Item ${i + 1}`,
    thumbnail: `https://picsum.photos/400/300?random=${i}`,
    type: ['image', 'video', 'gif'][Math.floor(Math.random() * 3)] as 'image' | 'video' | 'gif',
    contentRating: 'safe' as PoolContentRating,
    addedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    addedBy: {
      name: `User${Math.floor(Math.random() * 2) + 1}`,
      isPremium: Math.random() > 0.5
    }
  }))
};

export function PoolDetails({ poolId }: { poolId: string }) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = view === 'grid' ? 24 : 12;
  const [pool] = useState(MOCK_POOL_DETAILS);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = pool.items.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Pool Header */}
      <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
              {pool.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {pool.description}
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>Created {new Date(pool.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{pool.itemCount} items</span>
              <span>•</span>
              <span>{pool.viewCount} views</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg ${
                view === 'grid' 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${
                view === 'list'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Items Grid/List */}
      <div className={view === 'grid' 
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
        : "space-y-3"
      }>
        {currentItems.map(item => (
          <Link
            key={item.id}
            href={`/post/${item.id}`} // Bleibt gleich, da die ID jetzt korrekt ist
            className={view === 'grid'
              ? "block aspect-video relative rounded-lg overflow-hidden group"
              : "flex items-center gap-4 p-3 rounded-lg bg-gray-50/80 dark:bg-gray-900/50 hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
            }
          >
            <div className={view === 'grid' ? "w-full h-full" : "w-24 h-16 relative rounded-lg overflow-hidden"}>
              <Image
                src={item.thumbnail}
                alt={item.title}
                width={view === 'grid' ? 640 : 96}
                height={view === 'grid' ? 360 : 64}
                className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
              />
            </div>
            {view === 'list' && (
              <div className="flex-grow">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {item.title}
                </div>
                <div className="text-sm text-gray-500">
                  Added by {item.addedBy.name}
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 text-sm"
        >
          ← Previous
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage}
        </span>
        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={startIdx + itemsPerPage >= pool.items.length}
          className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 text-sm"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
