'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'comment' | 'like' | 'favorite' | 'upload' | 'tag';
  text: string;
  date: string;
  emoji: string;
  post: {
    id: string;
    title: string;
    imageUrl: string;
    type: 'image' | 'video' | 'gif';
    nsfw?: boolean;
  };
  content?: string;
}

interface UserData {
  username: string;
  joinDate: string;
  lastLogin: string;
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
    tags: number;
  };
  bio: string;
  avatar: string | null;
  recentActivity: ActivityItem[];
  role: 'user' | 'premium' | 'moderator' | 'admin' | 'banned';
}

export function UserProfile({ username }: { username: string }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${username}`);
        const data = await response.json();
        
        if (!response.ok) {
          setNotFound(true);
          return;
        }

        setUserData({
          username: data.username,
          joinDate: data.createdAt,
          lastLogin: data.lastSeen,
          bio: data.bio || '',
          premium: data.premium || false,
          avatar: data.avatar || null,
          stats: {
            uploads: data.stats?.uploads || 0,
            comments: data.stats?.comments || 0,
            favorites: data.stats?.favorites || 0,
            likes: data.stats?.likes || 0,
            dislikes: data.stats?.dislikes || 0,
            tags: data.stats?.tags || 0
          },
          recentActivity: [],
          role: data.role || 'user'
        });
        setNotFound(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setNotFound(true);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  // Neue useEffect für Aktivitäten
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        console.log('Fetching activities for user:', username);
        const response = await fetch(`/api/users/${username}/activity`);
        if (!response.ok) {
          console.error('Activity response not OK. Status:', response.status);
          throw new Error('Failed to fetch activity');
        }
        
        const data = await response.json();
        console.log('Received activities data:', data);
        setUserData(prev => prev ? {
          ...prev,
          recentActivity: data.activities || []
        } : null);
      } catch (error) {
        console.error('Error fetching activity:', error);
      }
    };

    if (username && !notFound) {
      fetchActivity();
    }
  }, [username, notFound]);

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'banned':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/40 text-white border border-black/50">
            BANNED ✝
          </span>
        );
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-red-500 to-orange-500 text-white">
            ADMIN
          </span>
        );
      case 'moderator':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/40 text-white border border-blue-500/50">
            MOD
          </span>
        );
      case 'premium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/40 text-white border border-purple-500/50">
            PREMIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-500/40 text-white border border-gray-500/50">
            MEMBER
          </span>
        );
    }
  };

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
            <div className={`relative ${
              userData?.premium ? 'before:absolute before:inset-0 before:rounded-lg before:p-[2px] before:bg-gradient-to-r before:from-purple-400 before:to-pink-600' : ''
            }`}>
              <div className={`relative ${userData?.premium ? 'p-[2px]' : ''}`}>
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl text-gray-400">
                      {userData?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
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
              {getRoleBadge(userData.role)}
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
          {userData.recentActivity.map(activity => (
            <div key={activity.id} className="flex gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
              {/* Activity Content */}
              <div className="flex-grow space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {activity.emoji} {activity.text}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
                {activity.content && activity.type === 'comment' && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-900/30 p-2 rounded border border-gray-200 dark:border-gray-700">
                    {activity.content.length > 100 
                      ? `${activity.content.substring(0, 100)}...` 
                      : activity.content}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  on{' '}
                  <Link 
                    href={`/post/${activity.post.id}`}
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {activity.post.title}
                  </Link>
                </div>
              </div>

              {/* Thumbnail */}
              <Link 
                href={`/post/${activity.post.id}`}
                className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-cover bg-center`}>
                  {activity.post.imageUrl && (
                    <Image
                      src={activity.post.imageUrl}
                      alt={activity.post.title}
                      width={64}
                      height={64}
                      className={`object-cover w-full h-full transition-all duration-200 ${
                        activity.post.nsfw ? 'group-hover:blur-none blur-md' : ''
                      }`}
                      priority
                    />
                  )}
                </div>
                {activity.post.type === 'video' && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-black/50 flex items-center justify-center">
                    <div className="w-2 h-2 border-l-[4px] border-l-white border-y-[2px] border-y-transparent" />
                  </div>
                )}
                {activity.post.type === 'gif' && (
                  <div className="absolute bottom-1 right-1">
                    <span className="text-[8px] font-bold bg-black/50 text-white px-1 rounded">
                      GIF
                    </span>
                  </div>
                )}
                {activity.post.nsfw && (
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
