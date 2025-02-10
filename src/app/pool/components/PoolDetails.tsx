'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PoolContentRating } from '../../pools/components/PoolsPage';

interface PoolItem {
  id: string;
  title: string;
  thumbnail: string;
  type: 'image' | 'video' | 'gif';
  contentRating: PoolContentRating;
  addedAt: string;
  addedBy: {
    name: string;
    isPremium: boolean;
  };
}

interface PoolDetails {
  id: string;
  name: string;
  description: string;
  contentRating: PoolContentRating;
  creator: {
    name: string;
    isPremium: boolean;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  viewCount: number;
  contributors: Array<{
    name: string;
    isPremium: boolean;
    itemCount: number;
  }>;
  items: PoolItem[];
}

export function PoolDetails({ poolId }: { poolId: string }) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = view === 'grid' ? 24 : 12;

  // Implementiere die Pool-Details-UI hier...
  // Zeige Titel, Beschreibung, Statistiken
  // Grid/List-Toggle für Items
  // Pagination für Items
  // Contributors Liste
  // etc.

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Pool Header */}
      {/* Items Grid/List */}
      {/* Pagination */}
    </div>
  );
}
