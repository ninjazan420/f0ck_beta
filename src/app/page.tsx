'use client';

import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { getRandomLogo } from "@/lib/utils";
import { useEffect, useState } from "react";

// Client-Komponenten sollten keine metadata exportieren

const PINNED_POST = {
  id: 'post-1',
  title: 'Welcome to f0ck.org',
  thumbnail: 'https://picsum.photos/800/400',
  uploader: {
    name: 'Admin',
    avatar: null
  },
  createdAt: '2023-12-24T12:00:00Z',
};

export default function Home() {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [stats, setStats] = useState({ activeUsers: 0, newPosts: 0, newComments: 0 });

  useEffect(() => {
    setLogoSrc(getRandomLogo());

    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col items-center">
      <div className="flex-1 flex flex-col items-center w-full">
        {/* Top Section - Logo and Welcome */}
        <div className="flex flex-col items-center gap-4 pt-12 pb-8">
          <Link href="/" className="relative w-[411px] h-[84px]">
            {logoSrc && (
              <Image
                src={logoSrc}
                alt="f0ck.org Logo"
                fill
                priority
                className="object-contain"
              />
            )}
          </Link>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-400">
              Catmemes, Shitposts, Girls und mehr
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Beta Version 1.0 - Wir bauen etwas Neues.
            </p>
          </div>
        </div>

        {/* Pinned Post Section */}
        <div className="w-full max-w-2xl mx-auto px-4 py-12">
          <div className="relative aspect-[2/1] rounded-xl overflow-hidden">
            <Link href={`/post/${PINNED_POST.id}`}>
              <Image
                src={PINNED_POST.thumbnail}
                alt={PINNED_POST.title}
                width={800}
                height={400}
                className="w-full h-full object-cover"
              />
              {/* Post Info Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-sm">
                    {PINNED_POST.uploader.avatar ?? PINNED_POST.uploader.name[0]}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{PINNED_POST.uploader.name}</span>
                      {PINNED_POST.uploader.isPremium && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/40 border border-purple-500/50">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-300">
                      Post #{PINNED_POST.id} • {new Date(PINNED_POST.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Section - Stats and Coming Soon */}
        <div className="w-full max-w-2xl mx-auto px-4 space-y-8 mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 text-center">
              <div className="text-2xl font-light tracking-tight text-gray-900 dark:text-gray-400">{stats.activeUsers}</div>
              <div className="text-[13px] font-medium tracking-wide text-gray-500 dark:text-gray-500">Aktive Nutzer</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 text-center">
              <div className="text-2xl font-light tracking-tight text-gray-900 dark:text-gray-400">{stats.newComments}</div>
              <div className="text-[13px] font-medium tracking-wide text-gray-500 dark:text-gray-500">Kommentare (24h)</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 text-center">
              <div className="text-2xl font-light tracking-tight text-gray-900 dark:text-gray-400">{stats.newPosts}</div>
              <div className="text-[13px] font-medium tracking-wide text-gray-500 dark:text-gray-500">Neue Posts (24h)</div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 font-[family-name:var(--font-geist-mono)]">
            Weitere Features folgen...
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
