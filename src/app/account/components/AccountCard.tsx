'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';  // Am Anfang der Datei importieren

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
  const { data: session, update: updateSession } = useSession();  // data hinzugefügt

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

  // Verbesserte useEffect für Datenabruf
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.status === 401) {
          console.log('Not authenticated, redirecting...');
          // Optional: Hier Redirect zur Login-Seite
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
          tags: userData.stats?.tags || 0
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const [isEditing, setIsEditing] = useState(false);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setNewAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Verbesserte handleSave Funktion
  const handleSave = async () => {
    try {
      if (!session?.user) {
        console.error('No session found');
        return;
      }

      const updateData = {
        username: profile.nickname,
        name: profile.nickname,
        bio: profile.bio,
        email: profile.email
      };
      
      console.log('Sending update:', updateData);

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Speichern');
      }

      const updatedData = await response.json();
      console.log('Received update response:', updatedData);

      setProfile(prev => ({
        ...prev,
        nickname: updatedData.username,
        email: updatedData.email,
        bio: updatedData.bio || ''
      }));

      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: updatedData.username,
          email: updatedData.email
        }
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleReset = () => {
    setNewAvatar(null);
    setPreviewUrl(null);
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

  return (
    <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar Section mit Edit Button */}
        <div className="w-32 md:w-32 flex-shrink-0 space-y-3">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            {(previewUrl || profile.avatarUrl) ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                <Image 
                  src={previewUrl || profile.avatarUrl || '/images/defaultavatar.png'} // Fallback hinzugefügt
                  alt={`${profile.nickname}'s avatar`}
                  width={128}
                  height={128}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-2xl text-gray-400">?</span>
              </div>
            )}
            {isEditing && (
              <label className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white cursor-pointer text-xs">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                Change
              </label>
            )}
          </div>
          
          {/* Edit Profile Button unter Avatar */}
          <div className="space-y-1">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-1.5 px-3 text-xs rounded-lg text-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-200"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-1 mb-1">
                <button
                  onClick={handleReset}
                  className="flex-1 py-1.5 px-2 text-xs rounded-lg text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-1.5 px-2 text-xs rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Save
                </button>
              </div>
            )}
            <Link
              href="/premium"
              className="w-full py-1.5 px-3 text-xs rounded-lg text-center bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1"
            >
              Buy Premium <span className="text-yellow-500">⭐</span>
            </Link>
          </div>

        </div>

        {/* Profile Info */}
        <div className="flex-grow space-y-3">
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 font-[family-name:var(--font-geist-mono)]">Nickname</label>
            <input
              type="text"
              value={profile.nickname || ''} // Stelle sicher, dass der Wert nie undefined ist
              onChange={e => setProfile({ ...profile, nickname: e.target.value })}
              disabled={!isEditing}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
              placeholder="Enter your nickname"
              title="Nickname input field"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 font-[family-name:var(--font-geist-mono)]">
              Email
            </label>
            <input
              type="email"
              value={profile.email || ''} // Stelle sicher, dass der Wert nie undefined ist
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              disabled={!isEditing}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm text-gray-500 dark:text-gray-400 font-[family-name:var(--font-geist-mono)]">Bio</label>
              <span className="text-xs text-gray-400">{profile.bio.length}/140</span>
            </div>
            <textarea
              value={profile.bio}
              onChange={handleBioChange}
              disabled={!isEditing}
              rows={2}
              maxLength={140}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none text-sm"
              placeholder="Write something about yourself..."
            />
          </div>

          {/* Member Info */}
          <div className="text-sm space-y-1">
            <div className="text-gray-500">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </div>
            <div className="text-gray-500">
              Last seen {new Date(profile.lastSeen).toLocaleString()}
            </div>
          </div>

          {/* Kompaktere Stats in einer Zeile */}
          <div className="flex justify-between items-end gap-4 py-2 text-sm">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">uploads</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{profile.uploads}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">favorites</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{profile.favorites}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">likes</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{profile.likedPosts}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">comments</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{profile.comments}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">tags</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{profile.tags}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings - Kompakteres Layout */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400">
            Privacy
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={profile.privacySettings.isProfilePrivate}
              onChange={() => togglePrivacySetting('isProfilePrivate')}
              id="privacy-toggle"
              aria-label="Toggle private profile"
              title="Toggle private profile"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(profile.privacySettings)
            .filter(([key]) => key !== 'isProfilePrivate')
            .map(([key, value]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => togglePrivacySetting(key as keyof ProfileData['privacySettings'])}
                  disabled={profile.privacySettings.isProfilePrivate}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 
                      text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-600
                      dark:bg-gray-700 transition-colors cursor-pointer"
                  aria-label={`Show ${key.replace('show', '')}`}
                  title={`Toggle visibility of ${key.replace('show', '')}`}
                  id={`privacy-${key}`}
                />
                <span className="text-gray-600 dark:text-gray-400">
                  Show {key.replace('show', '')}
                </span>
              </label>
            ))}
        </div>
      </div>

      {/* Recent Activity mit verschiedenen Aktivitätstypen */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-3">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {profile.recentActivity.map(activity => (
            <div key={activity.id} className="flex gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
              {/* Activity Content */}
              <div className="flex-grow space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    <span className="mr-2">{activity.emoji}</span>
                    {activity.text}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
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
