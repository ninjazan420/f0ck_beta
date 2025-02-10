'use client';
import { useState, useEffect } from 'react';

interface UserData {
  username: string;
  joinDate: string;
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
  };
  bio: string;
  avatar: string | null;
}

const MOCK_USER_DATA: { [key: string]: UserData } = {
  'user1': {
    username: 'User1',
    joinDate: '2023-01-15',
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
      dislikes: 12
    },
    bio: 'Premium user with awesome content!',
    avatar: null
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
      dislikes: 5
    },
    bio: 'Regular user enjoying the platform',
    avatar: null
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
          {/* Avatar */}
          <div className={`w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0
            ${userData.premium ? 'ring-2 ring-purple-400 dark:ring-purple-600' : ''}`}>
            {userData.avatar ? (
              <img src={userData.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                {userData.username[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
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
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {userData.bio}
            </p>

            <div className="text-sm text-gray-500">
              Member since {new Date(userData.joinDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-gray-900 dark:text-gray-100">
          Statistics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="text-2xl font-medium text-gray-900 dark:text-gray-100">
              {userData.stats.uploads}
            </div>
            <div className="text-sm text-gray-500">Uploads</div>
          </div>
          
          <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="text-2xl font-medium text-gray-900 dark:text-gray-100">
              {userData.stats.comments}
            </div>
            <div className="text-sm text-gray-500">Comments</div>
          </div>
          
          <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="text-2xl font-medium text-gray-900 dark:text-gray-100">
              {userData.stats.favorites}
            </div>
            <div className="text-sm text-gray-500">Favorites</div>
          </div>
          
          <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="text-2xl font-medium text-gray-900 dark:text-gray-100">
              {userData.stats.likes}
            </div>
            <div className="text-sm text-gray-500">Likes</div>
          </div>
          
          <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="text-2xl font-medium text-gray-900 dark:text-gray-100">
              {userData.stats.dislikes}
            </div>
            <div className="text-sm text-gray-500">Dislikes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
