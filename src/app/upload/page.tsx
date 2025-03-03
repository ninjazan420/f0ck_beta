'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";
import { UploadBox } from './components/UploadBox';
import { UploadOptions } from './components/UploadOptions';
import { FileList } from './components/FileList';
import { UrlInput } from './components/UrlInput';

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileRatings, setFileRatings] = useState<{[key: string]: 'safe' | 'sketchy' | 'unsafe'}>({});

  const handleFileDrop = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      const isValidType = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/webm',
        'video/mp4',
        'video/quicktime',
        'application/x-shockwave-flash',
        'image/avif',
        'image/heif',
        'image/heic',
        'image/webp'
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

    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please choose a file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('rating', fileRatings[file.name] || 'safe');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload fehlgeschlagen');
        }

        // Weiterleitung zur Post-Seite des letzten Uploads
        router.push(`/post/${data.file.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
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

  const updateFileRating = (fileName: string, rating: 'safe' | 'sketchy' | 'unsafe') => {
    setFileRatings(prev => ({
      ...prev,
      [fileName]: rating
    }));
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
                  <div className="flex gap-4">
                    <button
                      onClick={handleClearAll}
                      className="px-4 py-2 text-sm rounded-lg text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                        isUploading
                          ? 'bg-purple-400 cursor-not-allowed'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
                <FileList 
                  files={files} 
                  urls={urls}
                  onRemoveFile={handleRemoveFile}
                  onRemoveUrl={handleRemoveUrl}
                  onUpdateRating={updateFileRating}
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
