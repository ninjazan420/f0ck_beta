'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AvatarPicker } from './AvatarPicker';
import { Session } from 'next-auth';

interface ProfileHeaderProps {
  nickname: string;
  avatarUrl: string | null;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSave: () => void;
  handleReset: () => void;
  handleAvatarChange: (newAvatarUrl: string | null) => void;
  getAvatarUrl: () => string;
}

export function ProfileHeader({
  nickname,
  avatarUrl,
  isEditing,
  setIsEditing,
  handleSave,
  handleReset,
  handleAvatarChange,
  getAvatarUrl
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Avatar Section with AvatarPicker */}
      <div className="w-32 md:w-32 flex-shrink-0 space-y-3">
        <AvatarPicker
          username={nickname}
          currentAvatar={getAvatarUrl()}
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
          <Link
            href="/premium"
            className="w-full py-1.5 px-3 text-xs rounded-lg text-center bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1"
          >
            Buy Premium 💎
          </Link>
        </div>
      </div>
    </div>
  );
}