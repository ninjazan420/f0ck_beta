'use client';
import { useState } from 'react';

interface Comment {
  id: string;
  text: string;
  date: string;
  postTitle: string;
}

interface ProfileData {
  nickname: string;
  bio: string;
  avatarUrl: string | null;
  joinDate: string;
  uploads: number;
  favorites: number;
  comments: Comment[];
  likedPosts: number;
  dislikedPosts: number;
  privacySettings: {
    isProfilePrivate: boolean;
    showBio: boolean;
    showComments: boolean;
    showLikes: boolean;
    showDislikes: boolean;
    showFavorites: boolean;
    showUploads: boolean;
  };
}

export function AccountCard() {
  const [profile, setProfile] = useState<ProfileData>({
    nickname: 'User123',
    bio: '',
    avatarUrl: null,
    joinDate: '2023-12-24',
    uploads: 42,
    favorites: 123,
    comments: [
      { id: '1', text: 'Nice post!', date: '2023-12-24', postTitle: 'Awesome Picture' },
      { id: '2', text: 'Great work', date: '2023-12-23', postTitle: 'Cool Animation' },
      { id: '3', text: 'Love this!', date: '2023-12-22', postTitle: 'Amazing Art' },
      { id: '4', text: 'Interesting...', date: '2023-12-21', postTitle: 'Weird Stuff' },
      { id: '5', text: 'Perfect!', date: '2023-12-20', postTitle: 'Beautiful Scene' },
    ],
    likedPosts: 256,
    dislikedPosts: 12,
    privacySettings: {
      isProfilePrivate: false,
      showBio: true,
      showComments: true,
      showLikes: true,
      showDislikes: true,
      showFavorites: true,
      showUploads: true,
    }
  });

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

  const handleSave = () => {
    // Hier würde die API-Logik implementiert
    setIsEditing(false);
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
                <img 
                  src={previewUrl || profile.avatarUrl || ''} 
                  alt="Avatar" 
                  className="max-w-full max-h-full w-auto h-auto object-contain"
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
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-1.5 px-3 text-xs rounded-lg text-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-200"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-1">
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
        </div>

        {/* Profile Info */}
        <div className="flex-grow space-y-3">
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 font-[family-name:var(--font-geist-mono)]">Nickname</label>
            <input
              type="text"
              value={profile.nickname}
              onChange={e => setProfile({ ...profile, nickname: e.target.value })}
              disabled={!isEditing}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
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
              <div className="font-medium text-gray-900 dark:text-gray-100">{profile.comments.length}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">tags</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">42</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Tabs Layout */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-3">
          Recent Activity
        </h3>
        <div className="space-y-2">
          {profile.comments.map(comment => (
            <div key={comment.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300">{comment.text}</span>
                <span className="text-gray-500">on</span>
                <span className="text-gray-700 dark:text-gray-300">{comment.postTitle}</span>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">{comment.date}</span>
            </div>
          ))}
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
                />
                <span className="text-gray-600 dark:text-gray-400">
                  Show {key.replace('show', '')}
                </span>
              </label>
            ))}
        </div>
      </div>
    </div>
  );
}
