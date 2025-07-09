'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ProfileHeader } from './ProfileHeader';
import { ProfileInfo } from './ProfileInfo';

import { SecurityIntegrations } from './SecurityIntegrations';
import { RecentActivity } from './RecentActivity';

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

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [userInfo, setUserInfo] = useState({
    hasPassword: false,
    discordId: null as string | null
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
        console.log('User stats:', userData.stats);

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

        }));
        
        setAvatarUrl(userData.avatarUrl || null);
        
        setUserInfo({
          hasPassword: userData.hasPassword || false,
          discordId: userData.discordId || null
        });
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

  // Avatar-Funktionen
  const handleAvatarChange = async (newAvatarUrl: string | null) => {
    setAvatarUrl(newAvatarUrl);

    // Update session immediately with new avatar
    if (session?.user) {
      try {
        await updateSession({
          ...session,
          user: {
            ...session.user,
            avatar: newAvatarUrl
          }
        });
        console.log('Session updated in AccountCard with new avatar:', newAvatarUrl);
      } catch (error) {
        console.error('Failed to update session in AccountCard:', error);
      }
    }
  };

  const getAvatarUrl = () => {
    return avatarUrl || `/images/defaultavatar.png`;
  };

  // Neue Bio-Validierung
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 140) {
      setProfile(prev => ({ ...prev, bio: text }));
    }
  };



  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column - Profile */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
            <ProfileHeader
              nickname={profile.nickname}
              avatarUrl={avatarUrl}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              handleSave={handleSave}
              handleReset={handleReset}
              handleAvatarChange={handleAvatarChange}
              getAvatarUrl={getAvatarUrl}
            />
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-4">
                Profile Information
              </h3>
              <ProfileInfo
                profile={profile}
                setProfile={(newProfile) => setProfile(prevProfile => ({...prevProfile, ...newProfile}))}
                isEditing={isEditing}
                handleBioChange={(bio) => handleBioChange({ target: { value: bio } } as React.ChangeEvent<HTMLTextAreaElement>)}
              />
            </div>
          </div>
        </div>
        
        {/* Right Column - Settings */}
        <div className="space-y-6">
          <SecurityIntegrations
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            profileEmail={profile.email}
          />
        </div>
      </div>
      
      {/* Full Width User Statistics Box */}
      <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 mb-8">
        <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-4">
          Your Statistics
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <a href={`/posts?uploader=${profile.nickname}`} className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors cursor-pointer">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{profile.uploads}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Uploads</div>
          </a>

          <a href={`/comments?author=${profile.nickname}`} className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors cursor-pointer">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile.comments}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Comments</div>
          </a>

          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{profile.likedPosts}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Likes</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{profile.favorites}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Favorites</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{profile.tags}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tags Created</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Last seen {new Date(profile.lastSeen).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Full Width Recent Activity */}
      <RecentActivity
        activities={profile.recentActivity}
        activityLoading={activityLoading}
      />
    </div>
  );
}

