'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { getImageUrlWithCacheBuster } from '@/lib/utils';

interface AvatarPickerProps {
  username: string;
  currentAvatar: string | null;
  onAvatarChanged: (newAvatarUrl: string | null) => void;
}

export function AvatarPicker({ username, currentAvatar, onAvatarChanged }: AvatarPickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayAvatar, setDisplayAvatar] = useState<string | null>(currentAvatar);
  const [forceRender, setForceRender] = useState(0);

  // Aktualisiere die Anzeige, wenn sich currentAvatar ändert
  useEffect(() => {
    console.log("AvatarPicker: currentAvatar changed to", currentAvatar);
    setDisplayAvatar(currentAvatar);
    setForceRender(prev => prev + 1);
  }, [currentAvatar]);

  // Function to generate default avatar URL
  const getDefaultAvatarUrl = () => {
    return `/images/defaultavatar.png?username=${encodeURIComponent(username || 'user')}`;
  };

  // Improved function to upload avatar
  const uploadAvatar = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const text = await response.text();

      // Check if response is empty
      if (!text) {
        throw new Error('Empty response received from server');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Error parsing response:', e, 'Response text:', text);
        throw new Error('Invalid server response format');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      console.log("Avatar upload successful, new URL:", data.avatarUrl);

      // Add a unique timestamp to ensure the browser loads the new image
      const timestamp = Date.now();
      const newAvatarUrl = data.avatarUrl.includes('?')
        ? `${data.avatarUrl}&t=${timestamp}`
        : `${data.avatarUrl}?t=${timestamp}`;

      // Update local display
      setDisplayAvatar(newAvatarUrl);
      setForceRender(prev => prev + 1);

      // Call the provided callback function with the new avatar URL
      onAvatarChanged(newAvatarUrl);

      // Dispatch a global event to update all avatar displays
      window.dispatchEvent(new CustomEvent('avatar-updated', {
        detail: { newAvatarUrl }
      }));

      // No page reload - we'll update the UI without disrupting the user experience
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Improved function to delete avatar
  const deleteAvatar = async () => {
    if (!displayAvatar || displayAvatar.includes('defaultavatar')) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const text = await response.text();

      // Check if response is empty
      if (!text) {
        throw new Error('Empty response received from server');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Error parsing response:', e, 'Response text:', text);
        throw new Error('Invalid server response format');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete avatar');
      }

      console.log("Avatar deletion successful");

      // Update local display
      setDisplayAvatar(null);
      setForceRender(prev => prev + 1);

      // Call the provided callback function with null to reset to default
      onAvatarChanged(null);

      // Dispatch a global event to update all avatar displays
      window.dispatchEvent(new CustomEvent('avatar-updated', {
        detail: { newAvatarUrl: null }
      }));

      // No page reload - we'll update the UI without disrupting the user experience
    } catch (err) {
      console.error('Avatar deletion error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during deletion');
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must not exceed 5 MB');
      return;
    }

    // Check file format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload an image in JPG, PNG, GIF or WEBP format');
      return;
    }

    uploadAvatar(file);
  };

  // Bestimme dynamisch, ob der Avatar angezeigt werden soll
  const hasAvatar = Boolean(displayAvatar) && !displayAvatar?.includes('defaultavatar');
  const avatarSrc = hasAvatar
    ? getImageUrlWithCacheBuster(displayAvatar as string)
    : getDefaultAvatarUrl();

  console.log("AvatarPicker rendering with:", {
    hasAvatar,
    displayAvatar,
    avatarSrc,
    forceRender
  });

  return (
    <div className="relative group">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        {isUploading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <Image
            key={forceRender} // Force new image render
            src={avatarSrc}
            alt={`${username || 'User'}'s avatar`}
            width={128}
            height={128}
            className="w-full h-full object-cover"
            priority
            unoptimized={true}
          />
        )}
      </div>

      {/* Avatar-Steuerung */}
      <div className="absolute -bottom-2 right-0 flex space-x-1">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
          disabled={isUploading}
          title="Avatar hochladen"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {hasAvatar && (
          <button
            onClick={deleteAvatar}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            disabled={isUploading}
            title="Avatar entfernen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Verstecktes File-Input-Element */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
      />

      {/* Fehlermeldung */}
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}