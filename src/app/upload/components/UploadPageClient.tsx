'use client';

import { useState } from 'react';
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";
import { UploadBox } from './UploadBox';
import { UploadOptions } from './UploadOptions';
import { FileList } from './FileList';
import { UrlInput } from './UrlInput';

export function UploadPageClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      const isValidType = [
        // Image formats
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
        'image/heif', 'image/heic', 'image/bmp', 'image/tiff', 'image/svg+xml',
        'image/apng',
        // Video formats
        'video/webm', 'video/mp4', 'video/quicktime', 'video/avi',
        'video/x-msvideo', 'video/mkv', 'video/x-matroska', 'video/ogg',
        // Legacy support
        'application/x-shockwave-flash'
      ].includes(file.type);

      if (!isValidSize) {
        setError('Eine oder mehrere Dateien sind größer als 100MB');
        return false;
      }
      if (!isValidType) {
        setError('Eine oder mehrere Dateien haben ein nicht unterstütztes Format');
        return false;
      }
      return true;
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    if (validFiles.length > 0) {
      setError(null);
    }
  };

  const handleUrlAdd = (url: string) => {
    try {
      new URL(url); // URL validation
      setUrls(prevUrls => [...prevUrls, url]);
      setError(null);
    } catch {
      setError('Ungültige URL');
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFiles([]);
    setUrls([]);
    setError(null);
  };

  const hasFiles = files.length > 0 || urls.length > 0;

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <div className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            
            <UploadBox onFileDrop={handleFileDrop} />
            <UrlInput onUrlAdd={handleUrlAdd} />
            {hasFiles && (
              <>
                <div className="flex items-center justify-between">
                  <UploadOptions />
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 text-sm rounded-lg text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Clear All Uploads
                  </button>
                </div>
                <FileList 
                  files={files} 
                  urls={urls}
                  onRemoveFile={handleRemoveFile}
                  onRemoveUrl={handleRemoveUrl}
                />
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
