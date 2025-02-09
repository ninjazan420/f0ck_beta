'use client';
import { useState } from 'react';
import { UploadBox } from './components/UploadBox';
import { UploadOptions } from './components/UploadOptions';
import { FileList } from './components/FileList';
import { UrlInput } from './components/UrlInput';
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = (newFiles: File[]) => {
    try {
      // Prüfe maximale Anzahl der Uploads
      if (files.length + newFiles.length > 5) {
        throw new Error('Maximum of 5 uploads at once exceeded');
      }

      // Validiere Dateitypen
      const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'image/webp',  // WebP hinzugefügt
        'video/webm', 
        'video/mp4', 
        'video/quicktime', 
        'application/x-shockwave-flash'
      ];
      const invalidFiles = newFiles.filter(file => !allowedTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        throw new Error(`Unsupported file type(s): ${invalidFiles.map(f => f.name).join(', ')}`);
      }

      // Validiere Dateigrößen
      const MAX_SIZE = 100 * 1024 * 1024; // 100MB
      const oversizedFiles = newFiles.filter(file => file.size > MAX_SIZE);
      
      if (oversizedFiles.length > 0) {
        throw new Error(`Files exceeding 100MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      }

      setFiles(prev => [...prev, ...newFiles]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing files');
    }
  };

  const handleUrlAdd = (url: string) => {
    try {
      // Prüfe maximale Anzahl der Uploads
      if (urls.length + 1 > 5) {
        throw new Error('Maximum of 5 uploads at once exceeded');
      }

      const urlObject = new URL(url);
      const allowedDomains = ['youtube.com', 'youtu.be', 'twitter.com', 'instagram.com', 'twitch.tv'];
      
      if (!allowedDomains.some(domain => urlObject.hostname.includes(domain))) {
        throw new Error('URL domain not supported');
      }

      setUrls(prev => [...prev, url]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid URL format');
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(prev => prev.filter((_, i) => i !== index));
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
                <UploadOptions />
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
