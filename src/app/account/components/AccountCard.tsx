'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { AvatarPicker } from './AvatarPicker';
import { PremiumPanel } from './PremiumPanel';
import { ReactElement } from 'react';
import { AlertCircle, Pencil, Eye, Save, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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

interface ProfileData {
  nickname: string;
  bio: string;
  avatarUrl: string | null;
  joinDate: string;
  lastLogin: string; // Neu hinzugefügt
  uploads: number;
  favorites: number;
  likedPosts: number;
  dislikedPosts: number;
  comments: number; // Added this property
  tags: number; // Added this property
  privacySettings: {
    isProfilePrivate: boolean;
    showBio: boolean;
    showComments: boolean;
    showLikes: boolean;
    showDislikes: boolean;
    showFavorites: boolean;
    showUploads: boolean;
  };
  recentActivity: ActivityItem[];
  email: string;
  createdAt: string;
  lastSeen: string;
}

export function AccountCard() {
  const { data: session, update: updateSession } = useSession();

  const [profile, setProfile] = useState<ProfileData>({
    nickname: '',  // Leer initialisieren
    bio: '',
    avatarUrl: null,
    joinDate: '2023-12-24',
    lastLogin: '2024-01-10T15:45:00', // Neu hinzugefügt
    uploads: 0,
    favorites: 0,
    likedPosts: 0,
    dislikedPosts: 0,
    comments: 0, // Initialize with 0
    tags: 0, // Initialize with 0
    privacySettings: {
      isProfilePrivate: false,
      showBio: true,
      showComments: true,
      showLikes: true,
      showDislikes: true,
      showFavorites: true,
      showUploads: true,
    },
    recentActivity: [],
    email: '',
    createdAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  });

  const [activityLoading, setActivityLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Separate effect for user data and avatar (higher priority)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setProfileLoading(true);
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (response.status === 401) {
          console.log('Not authenticated, redirecting...');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        console.log('Fetched user data:', userData);

        setProfile(prev => ({
          ...prev,
          nickname: userData.username || userData.name || '',
          bio: userData.bio || '',
          email: userData.email || '',
          createdAt: userData.createdAt || new Date().toISOString(),
          lastSeen: userData.lastSeen || new Date().toISOString(),
          uploads: userData.stats?.uploads || 0,
          favorites: userData.stats?.favorites || 0,
          likedPosts: userData.stats?.likes || 0,
          comments: userData.stats?.comments || 0,
          tags: userData.stats?.tags || 0,
          avatarUrl: userData.avatar || null
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  // Separate effect for activity feed (lower priority)
  useEffect(() => {
    const fetchActivity = async () => {
      if (!session?.user || profileLoading) return;

      try {
        setActivityLoading(true);
        const response = await fetch('/api/user/activity');
        if (!response.ok) {
          throw new Error('Failed to fetch activity');
        }

        const data = await response.json();
        console.log('AccountCard: Received activities:', data.activities);

        setProfile(prev => ({
          ...prev,
          recentActivity: data.activities || []
        }));
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setActivityLoading(false);
      }
    };

    // Only fetch activity after profile data is loaded
    if (!profileLoading && session?.user) {
      fetchActivity();
    }
  }, [session, profileLoading]);

  const [isEditing, setIsEditing] = useState(false);

  // Improved handleSave function
  const handleSave = async () => {
    try {
      if (!session?.user) {
        console.error('No session found');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('Saving profile...');

      // Prepare update data
      const updateData = {
        username: profile.nickname,
        name: profile.nickname,
        bio: profile.bio,
        email: profile.email
      };

      console.log('Sending update:', updateData);

      // Send update request
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(updateData),
      });

      // Handle error response
      if (!response.ok) {
        const data = await response.json();
        toast.dismiss(loadingToast);
        throw new Error(data.error || 'Error saving profile');
      }

      // Parse response data
      const updatedData = await response.json();
      console.log('Received update response:', updatedData);

      // Update local state with server data
      setProfile(prev => ({
        ...prev,
        nickname: updatedData.username || prev.nickname,
        email: updatedData.email || prev.email,
        bio: updatedData.bio || prev.bio
      }));

      // Debug output
      console.log('Bio before update:', session.user.bio);
      console.log('Bio from API response:', updatedData.bio);

      // Update session with data from API response
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: updatedData.username || session.user.name,
          username: updatedData.username || session.user.username,
          email: updatedData.email || session.user.email,
          bio: updatedData.bio // Use response directly from server
        }
      });

      // Force a session refresh to ensure all data is updated
      setTimeout(() => {
        updateSession();
      }, 100);

      // Debug output after session update
      console.log('Session update completed');
      console.log('Updated session bio:', session?.user?.bio);

      // Dismiss loading toast and show success message
      toast.dismiss(loadingToast);
      toast.success('Profile updated successfully');

      // Exit editing mode
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    }
  };

  // Improved handleReset function to restore original values
  const handleReset = () => {
    // Fetch the latest user data to restore original values
    if (session?.user) {
      fetch('/api/user')
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to fetch user data');
        })
        .then(userData => {
          // Restore original values from the server
          setProfile(prev => ({
            ...prev,
            nickname: userData.username || userData.name || '',
            bio: userData.bio || '',
            email: userData.email || ''
          }));
        })
        .catch(error => {
          console.error('Error fetching user data for reset:', error);
        });
    }

    // Exit editing mode
    setIsEditing(false);
  };

  const togglePrivacySetting = (setting: keyof ProfileData['privacySettings']) => {
    setProfile(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [setting]: !prev.privacySettings[setting]
      }
    }));
  };

  // Neue Bio-Validierung
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 140) {
      setProfile(prev => ({ ...prev, bio: text }));
    }
  };

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

  // Improved Avatar-Handling-Funktion
  const handleAvatarChange = useCallback(async (newAvatarUrl: string | null) => {
    console.log('Avatar changed to:', newAvatarUrl);

    // Set the new avatar URL in the profile
    setProfile(prev => ({
      ...prev,
      avatarUrl: newAvatarUrl
    }));

    // Update the session to show the new avatar in the navbar
    if (session) {
      try {
        // Extract the base URL without cache busting parameters
        let baseAvatarUrl = newAvatarUrl;
        if (baseAvatarUrl) {
          // Remove any cache busting parameters (v= or t=)
          const urlParts = baseAvatarUrl.split(/[?&](v|t)=/);
          baseAvatarUrl = urlParts[0];
        }

        console.log('Updating session with avatar URL:', baseAvatarUrl);

        // Update the session with the clean avatar URL
        await updateSession({
          ...session,
          user: {
            ...session.user,
            avatar: baseAvatarUrl
          }
        });

        // Force a session refresh to ensure the avatar is updated
        setTimeout(() => {
          updateSession();
        }, 100);

        // Dispatch an event to notify other components about the avatar change
        window.dispatchEvent(new CustomEvent('avatar-updated', {
          detail: { newAvatarUrl: baseAvatarUrl }
        }));

        toast.success('Avatar updated successfully');
      } catch (error) {
        console.error('Failed to update session with new avatar:', error);
        toast.error('Failed to update avatar in session');
      }
    }
  }, [session, updateSession]);

  // Funktion zum Ermitteln des Avatar-URLs (mit Default-Fallback)
  const getAvatarUrl = useCallback(() => {
    // Wenn ein benutzerdefinierter Avatar existiert, verwende diesen
    if (profile.avatarUrl) {
      return profile.avatarUrl;
    }

    // Ansonsten generiere einen Standard-Avatar basierend auf dem Benutzernamen
    const username = profile.nickname || 'user';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }, [profile.avatarUrl, profile.nickname]);

  return (
    <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar Section with AvatarPicker */}
        <div className="w-32 md:w-32 flex-shrink-0 space-y-3">
          <AvatarPicker
            username={profile.nickname}
            currentAvatar={profile.avatarUrl}
            onAvatarChanged={handleAvatarChange}
          />

          {/* Edit Profile Button under Avatar */}
          <div className="space-y-1">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-1.5 px-3 text-xs rounded-lg text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={handleSave}
                  className="flex-1 py-1.5 px-2 text-xs rounded-lg text-center bg-purple-600 hover:bg-purple-700 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Save
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-1.5 px-2 text-xs rounded-lg text-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            )}
            {session?.user?.role !== 'premium' && (
              <Link
                href="/premium"
                className="w-full py-1.5 px-3 text-xs rounded-lg text-center bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1"
              >
                Buy Premium
              </Link>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-grow space-y-3">
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 font-[family-name:var(--font-geist-mono)]">
              Nickname
            </label>
            <input
              type="text"
              value={profile.nickname}
              onChange={(e) =>
                setProfile({ ...profile, nickname: e.target.value })
              }
              disabled={!isEditing}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
              placeholder="Enter your nickname"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 font-[family-name:var(--font-geist-mono)]">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              disabled={!isEditing}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <div className="flex justify-between">
              <label className="block text-sm text-gray-500 dark:text-gray-400 font-[family-name:var(--font-geist-mono)]">
                Bio
              </label>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {profile.bio.length}/140
              </span>
            </div>
            <textarea
              value={profile.bio}
              onChange={handleBioChange}
              disabled={!isEditing}
              rows={2}
              maxLength={140}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none"
              placeholder="Tell us about yourself"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your profile info is visible to all users
            </p>
          </div>
        </div>
      </div>

      {/* Premium Panel */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <PremiumPanel />
      </div>

      {/* Privacy Settings - Kompakteres Layout */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400">
            Privacy (does not change anything yet)
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={profile.privacySettings.isProfilePrivate}
              onChange={() => togglePrivacySetting("isProfilePrivate")}
              id="privacy-toggle"
              aria-label="Toggle private profile"
              title="Toggle private profile"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(profile.privacySettings)
            .filter(([key]) => key !== "isProfilePrivate")
            .map(([key, value]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    togglePrivacySetting(
                      key as keyof ProfileData["privacySettings"]
                    )
                  }
                  disabled={profile.privacySettings.isProfilePrivate}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600
                      text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-600
                      dark:bg-gray-700 transition-colors cursor-pointer"
                  aria-label={`Show ${key.replace("show", "")}`}
                  title={`Toggle visibility of ${key.replace("show", "")}`}
                  id={`privacy-${key}`}
                />
                <span className="text-gray-600 dark:text-gray-400">
                  Show {key.replace("show", "")}
                </span>
              </label>
            ))}
        </div>
      </div>

      {/* Recent Activity with loading state */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-3 flex items-center justify-between">
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
          ) : profile.recentActivity.length > 0 ? (
            // Actual activity items
            profile.recentActivity.map((activity) => (
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
    </div>
  );
}
