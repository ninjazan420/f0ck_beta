'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const ALLOWED_EXTENSIONS = ['.jpg', '.png', '.gif', '.webm', '.mp4', '.mov', '.swf', '.avif', '.heif', '.heic', '.webp'];

export function UploadBox({ onFileDrop }: { onFileDrop: (files: File[]) => void }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileDrop(acceptedFiles);
  }, [onFileDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.avif', '.heif', '.heic', '.webp'],
      'video/*': ['.webm', '.mp4', '.mov'],
      'application/x-shockwave-flash': ['.swf']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative h-48 rounded-lg overflow-hidden transition-all duration-300
        border-2 border-dashed p-8 text-center cursor-pointer
        ${isDragActive 
          ? 'border-purple-500 bg-purple-50/10' 
          : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}
      `}
    >
      <input {...getInputProps()} />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-transparent to-transparent dark:from-gray-900/50"></div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center space-y-4">
        <div className="text-gray-800 dark:text-gray-300">
          <p className="text-xl font-medium">Drop or paste your files here!</p>
          <p className="text-sm">Or just click on this box.</p>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Allowed extensions: {ALLOWED_EXTENSIONS.join(', ')}<br/>
          You can also use directlinks like YouTube, Twitter, Instagram, Twitch clips and more!
        </p>
      </div>
      {isDragActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 animate-pulse"></div>
      )}
    </div>
  );
}
