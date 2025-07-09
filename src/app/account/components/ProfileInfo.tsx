'use client';

import { useState } from 'react';
import { User, Mail, FileText } from 'lucide-react';

interface ProfileData {
  nickname: string;
  bio: string;
  email: string;
  createdAt: string;
  lastSeen: string;
  uploads: number;
  favorites: number;
  likedPosts: number;
  comments: number;
  tags: number;
}

interface ProfileInfoProps {
  profile: ProfileData;
  setProfile: (profile: Partial<ProfileData>) => void;
  isEditing: boolean;
  handleBioChange: (bio: string) => void;
}

export function ProfileInfo({
  profile,
  setProfile,
  isEditing,
  handleBioChange
}: ProfileInfoProps) {
  const [bioCharCount, setBioCharCount] = useState(profile.bio.length);

  const handleBioInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = e.target.value;
    if (newBio.length <= 150) {
      handleBioChange(newBio);
      setBioCharCount(newBio.length);
    }
  };

  return (
    <div className="space-y-4">
      {/* Nickname */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nickname
          </label>
        </div>
        {isEditing ? (
          <input
            type="text"
            value={profile.nickname}
            onChange={(e) => setProfile({ nickname: e.target.value })}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
            placeholder="Enter your nickname"
          />
        ) : (
          <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
            {profile.nickname || 'No nickname set'}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
        </div>
        {isEditing ? (
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ email: e.target.value })}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100"
            placeholder="Enter your email"
          />
        ) : (
          <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
            {profile.email || 'No email set'}
          </p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bio
          </label>
        </div>
        {isEditing ? (
          <div className="space-y-1">
            <textarea
              value={profile.bio}
              onChange={handleBioInputChange}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 resize-none"
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={150}
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                💡 Your profile info is visible to all users
              </span>
              <span className={`${bioCharCount > 140 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {bioCharCount}/150
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg min-h-[80px]">
              {profile.bio || 'No bio set'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Your profile info is visible to all users
            </p>
          </div>
        )}
      </div>
    </div>
  );
}