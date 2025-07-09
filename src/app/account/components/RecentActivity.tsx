'use client';

import { ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { getImageUrlWithCacheBuster } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'comment' | 'like' | 'favorite' | 'upload' | 'tag';
  text: string;
  date: string;
  emoji: string;
  content?: string;
  post: {
    id: string;
    title: string;
    imageUrl: string;
    type: 'image' | 'video' | 'gif';
    nsfw?: boolean;
    numericId?: string;
  };
}

interface RecentActivityProps {
  activities: ActivityItem[];
  activityLoading: boolean;
}

export function RecentActivity({ activities, activityLoading }: RecentActivityProps) {
  // Rendering-Funktion für den Kommentarinhalt mit GIF-Support
  const renderCommentContent = (text: string) => {
    if (!text) return null;

    // Einfacherer GIF-Platzhalter: [GIF:url]
    const gifRegex = /\[GIF:(https?:\/\/[^\]]+)\]/gi;

    // Verbesserte Regex für URL-Erkennung - erfasst mehr Bildformate und URLs
    const urlRegex = /(https?:\/\/[^\s]+\.(gif|png|jpg|jpeg|webp|bmp))(?:\?[^\s]*)?/gi;

    // Suche nach GIF-Platzhaltern und Standard-URLs
    const gifMatches = Array.from(text.matchAll(gifRegex) || []);
    const urlMatches = text.match(urlRegex) || [];

    // Wenn weder GIFs noch Bilder gefunden wurden, gib den Text zurück
    if (gifMatches.length === 0 && urlMatches.length === 0) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }

    // Ersetze GIF-Platzhalter und URLs mit Markierungen und teile den Text
    let processedText = text;

    // Ersetze zuerst GIF-Platzhalter
    processedText = processedText.replace(gifRegex, '\n[gif-media]\n');

    // Dann ersetze URL-Medien, aber nicht die, die bereits als GIF markiert sind
    const tempProcessedText = processedText;
    urlMatches.forEach(url => {
      // Prüfe, ob die URL bereits als GIF verarbeitet wurde
      if (!gifMatches.some(match => match[1] === url) && tempProcessedText.includes(url)) {
        processedText = processedText.replace(url, '\n[url-media]\n');
      }
    });

    const textParts = processedText.split('\n');
    const result: ReactElement[] = [];
    let gifIndex = 0;
    let urlIndex = 0;

    textParts.forEach((part, index) => {
      if (part === '[gif-media]') {
        if (gifIndex < gifMatches.length) {
          const match = gifMatches[gifIndex];
          const url = match[1];
          const isGiphy = url.includes('giphy.com');

          result.push(
            <div key={`gif-${index}`} className="my-2">
              <Image
                src={url}
                alt="GIF"
                width={400}
                height={300}
                className=""
                unoptimized
              />
              {isGiphy && (
                <div className="text-[10px] text-gray-400 dark:text-gray-500 opacity-50 mt-0.5 pl-1">
                  <Image
                    src="/powered_by_giphy.png"
                    alt="Powered by GIPHY"
                    width={150}
                    height={22}
                    unoptimized
                  />
                </div>
              )}
            </div>
          );
          gifIndex++;
        }
      } else if (part === '[url-media]') {
        if (urlIndex < urlMatches.length) {
          // Überspringe URLs, die bereits als GIFs verarbeitet wurden
          while (urlIndex < urlMatches.length &&
                 gifMatches.some(match => match[1] === urlMatches[urlIndex])) {
            urlIndex++;
          }

          if (urlIndex < urlMatches.length) {
            const url = urlMatches[urlIndex];
            result.push(
              <div key={`url-${index}`} className="my-2">
                <Image
                  src={url}
                  alt="Media"
                  width={400}
                  height={300}
                  className=""
                  unoptimized
                />
              </div>
            );
            urlIndex++;
          }
        }
      } else if (part.trim() !== '') {
        result.push(<span key={`text-${index}`} className="whitespace-pre-wrap">{part}</span>);
      }
    });

    return <>{result}</>;
  };

  return (
    <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-4 flex items-center justify-between">
        Recent Activity
        {activityLoading && (
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading...
          </div>
        )}
      </h3>
      <div className="space-y-3">
        {activityLoading ? (
          // Placeholder loading state
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50 animate-pulse">
              <div className="flex-grow">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))
        ) : activities.length > 0 ? (
          // Actual activity items
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50"
            >
              {/* Activity Content */}
              <div className="flex-grow space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    <span className="mr-1">{activity.emoji}</span>
                    {activity.text}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
                {activity.content && activity.type === 'comment' && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-900/30 p-2 rounded border border-gray-200 dark:border-gray-700">
                    {activity.content.length > 100 && !activity.content.includes('[GIF:')
                      ? `${activity.content.substring(0, 100)}...`
                      : renderCommentContent(activity.content)}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  on{" "}
                  <Link
                    href={`/post/${activity.post.numericId || activity.post.id}`}
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {activity.post.title}
                  </Link>
                </div>
              </div>
              {/* Thumbnail - immer anzeigen, unabhängig vom Kommentarinhalt */}
              <Link
                href={`/post/${activity.post.numericId || activity.post.id}`}
                className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden group"
              >
                {activity.post.imageUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${getImageUrlWithCacheBuster(activity.post.imageUrl)})` }}
                  ></div>
                )}
                {activity.post.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="text-white text-xl">▶</span>
                  </div>
                )}
                {activity.post.type === "gif" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="text-white text-xs px-1.5 py-0.5 bg-black/50 rounded">
                      GIF
                    </span>
                  </div>
                )}
                {activity.post.nsfw && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 group-hover:bg-red-500/30 transition-colors">
                    <span className="text-white text-xs font-bold px-1 py-0.5 bg-red-600/90 rounded">
                      NSFW
                    </span>
                  </div>
                )}
              </Link>
            </div>
          ))
        ) : (
          // No activities state
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No recent activity to display</p>
          </div>
        )}
      </div>
    </div>
  );
}