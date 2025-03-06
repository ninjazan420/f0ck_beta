'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { getImageUrlWithCacheBuster } from '@/lib/utils';

interface AvatarPickerProps {
  username: string;
  currentAvatar: string | null;
  onAvatarChanged: (avatarUrl: string | null) => void;
}

export function AvatarPicker({ username, currentAvatar, onAvatarChanged }: AvatarPickerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Update preview when currentAvatar changes
  useEffect(() => {
    if (currentAvatar) {
      setPreviewUrl(getImageUrlWithCacheBuster(currentAvatar));
    } else {
      setPreviewUrl(null);
    }
  }, [currentAvatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Maximum file size: 2MB');
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error uploading avatar');
      }
      
      const data = await response.json();
      
      // Update avatar in parent component
      onAvatarChanged(data.avatarUrl);
      
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading avatar');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Error removing avatar');
      }
      
      setPreviewUrl(null);
      setSelectedFile(null);
      onAvatarChanged(null);
      
      toast.success('Avatar removed successfully');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Error removing avatar');
    } finally {
      setIsUploading(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleFileChange}
      />
      
      <div 
        className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 cursor-pointer relative"
        onClick={triggerFileInput}
      >
        {previewUrl ? (
          <Image 
            src={previewUrl} 
            alt="Avatar" 
            width={128} 
            height={128} 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-4xl text-gray-400">
            {username?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="text-white opacity-0 hover:opacity-100 transition-opacity">
            Change
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        {selectedFile && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
        
        {currentAvatar && (
          <button
            onClick={handleRemoveAvatar}
            disabled={isUploading}
            className="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Remove Avatar
          </button>
        )}
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
        Recommended size: 128x128 pixels (will be cropped automatically)
      </p>
    </div>
  );
} 