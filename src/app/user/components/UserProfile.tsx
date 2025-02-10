'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface UserData {
  username: string;
  joinDate: string;
  lastLogin: string; // Neu hinzugefügt
  premium: boolean;
  style?: {
    type: string;
    gradient: string[];
    animate: boolean;
  };
  stats: {
    uploads: number;
    comments: number;
    favorites: number;
    likes: number;
    dislikes: number;
    tags: number; // Neu hinzugefügt
  };
  bio: string;
  avatar: string | null;
  recentComments: { // Angepasst an das Post-System
    id: string;
    text: string;
    date: string;
    post: {
      id: string;
      title: string;
      imageUrl: string;  // Direkte URL vom Post
      type: 'image' | 'video' | 'gif';
      nsfw?: boolean;
    };
  }[];
}

const MOCK_USER_DATA: { [key: string]: UserData } = {
  'user1': {
    username: 'User1',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-10T15:45:00', // Neu
    premium: true,
    style: {
      type: 'gradient',
      gradient: ['purple-400', 'pink-600'],
      animate: true
    },
    stats: {
      uploads: 42,
      comments: 156,
      favorites: 89,
      likes: 234,
      dislikes: 12,
      tags: 42
    },
    bio: 'Premium user with awesome content!',
    avatar: null,
    recentComments: [
      {
        id: '1',
        text: 'Amazing work!',
        date: '2024-01-09',
        post: {
          id: '123',
          title: 'Sunset Photo',
          imageUrl: 'https://picsum.photos/400/300?random=1', // Gleiche URL-Struktur wie PostGrid
          type: 'image'
        }
      },
      {
        id: '2',
        text: 'Love this style',
        date: '2024-01-08',
        post: {
          id: '124',
          title: 'Abstract Art',
          imageUrl: 'https://picsum.photos/400/300?random=2',
          type: 'image',
          nsfw: true
        }
      },
      {
        id: '3',
        text: 'Great composition',
        date: '2024-01-07',
        post: {
          id: '125',
          title: 'Nature Shot',
          imageUrl: 'https://picsum.photos/400/300?random=3',
          type: 'image'
        }
      }
    ]
  },
  'user2': {
    username: 'User2',
    joinDate: '2023-03-22',
    premium: false,
    stats: {
      uploads: 15,
      comments: 45,
      favorites: 32,
      likes: 67,
      dislikes: 5,
      tags: 0
    },
    bio: 'Regular user enjoying the platform',
    avatar: null,
    recentComments: []
  }
};

export function UserProfile({ username }: { username: string }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Simuliere API-Call
    const fetchUserData = () => {
      const lowercaseUsername = username.toLowerCase();
      const data = MOCK_USER_DATA[lowercaseUsername];
      
      if (data) {
        setUserData(data);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    };

    fetchUserData();
  }, [username]);

  if (notFound) {
    return (
      <div className="p-6 rounded-xl bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-center">
        <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-red-800 dark:text-red-200 mb-2">
          User not found
        </h2>
        <p className="text-red-600 dark:text-red-300">
          The user &quot;{username}&quot; does not exist.
        </p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
        <div className="animate-pulse flex space-x-4">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
        <div className="flex gap-6">
          {/* Avatar Section */}
          <div className="w-32 md:w-32 flex-shrink-0">
            <div className={`w-32 h-32 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center
              ${userData.premium ? 'ring-2 ring-purple-400 dark:ring-purple-600' : ''}`}>
              {userData.avatar ? (
                <Image 
                  src={userData.avatar} 
                  alt={`${userData.username}'s avatar`}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                  {userData.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-grow space-y-3">
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl font-medium ${
                userData.premium 
                  ? 'bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent' 
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {userData.username}
              </h1>
              {userData.premium && (
                <span className="px-2 py-0.5 rounded text-sm font-medium bg-purple-500/40 text-white border border-purple-500/50">
                  PREMIUM
                </span>
              )}
            </div>
            
            <p className="text-gray-600 dark:text-gray-400">
              {userData.bio || "This user hasn't written a bio yet."}
            </p>

            {/* Member Info */}
            <div className="text-sm space-y-1">
              <div className="text-gray-500">
                Member since {new Date(userData.joinDate).toLocaleDateString()}
              </div>
              <div className="text-gray-500">
                Last seen {new Date(userData.lastLogin).toLocaleString()}
              </div>
            </div>

            {/* Kompakte Stats in einer Zeile */}
            <div className="flex justify-between items-end gap-4 py-2 text-sm">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">uploads</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{userData.stats.uploads}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">favorites</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{userData.stats.favorites}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">likes</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{userData.stats.likes}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">comments</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{userData.stats.comments}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">tags</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{userData.stats.tags}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity mit Thumbnails */}
      <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-3">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {userData.recentComments.map(comment => (
            <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
              {/* Comment Content */}
              <div className="flex-grow space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {comment.text}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(comment.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  on{' '}
                  <Link 
                    href={`/post/${comment.post.id}`}
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {comment.post.title}
                  </Link>
                </div>
              </div>

              {/* Thumbnail */}
              <Link 
                href={`/post/${comment.post.id}`} // Korrigierte URL-Struktur
                className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-cover bg-center`}>
                  {comment.post.imageUrl && (
                    <Image
                      src={comment.post.imageUrl} // Direkte Verwendung der URL ohne Proxy
                      alt={comment.post.title}
                      width={64}
                      height={64}
                      className={`object-cover w-full h-full transition-all duration-200 ${
                        comment.post.nsfw ? 'group-hover:blur-none blur-md' : ''
                      }`}
                      priority
                    />
                  )}
                </div>
                {comment.post.type === 'video' && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-black/50 flex items-center justify-center">
                    <div className="w-2 h-2 border-l-[4px] border-l-white border-y-[2px] border-y-transparent" />
                  </div>
                )}
                {comment.post.type === 'gif' && (
                  <div className="absolute bottom-1 right-1">
                    <span className="text-[8px] font-bold bg-black/50 text-white px-1 rounded">
                      GIF
                    </span>
                  </div>
                )}
                {comment.post.nsfw && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:opacity-0">
                    <span className="text-[10px] font-bold text-white px-1.5 py-0.5 bg-red-500/80 rounded">
                      NSFW
                    </span>
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
