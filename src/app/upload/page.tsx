'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";
import { UploadBox } from './components/UploadBox';
import { UploadOptions } from './components/UploadOptions';
import { FileList } from './components/FileList';
import { UrlInput, PreviewImageUrlData } from './components/UrlInput';

// Define the FileItem interface to match the one in FileList.tsx
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'url';
  size?: number;
  tags: string[];
  index: number;
  thumbnail?: string;
  dimensions?: { width: number; height: number };
  format?: string;
  contentRating: 'safe' | 'sketchy' | 'unsafe';
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [urlData, setUrlData] = useState<PreviewImageUrlData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingUrls, setIsProcessingUrls] = useState(false);
  const [fileRatings, setFileRatings] = useState<{[key: string]: 'safe' | 'sketchy' | 'unsafe'}>({});
  // Add state to store file items with their tags
  const [fileItems, setFileItems] = useState<FileItem[]>([]);

  // Function to get tags for a specific file - mit useCallback
  const getFileTags = useCallback((fileName: string): string[] => {
    const fileItem = fileItems.find(item => item.name === fileName && item.type === 'file');
    return fileItem?.tags || [];
  }, [fileItems]);

  // File handling functions mit useCallback
  const handleFileDrop = useCallback((newFiles: File[]) => {
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
  }, []);

  // Handle URL add
  const handleUrlAdd = useCallback((newUrlData: PreviewImageUrlData) => {
    try {
      new URL(newUrlData.url); // URL validation
      setUrlData(prevUrls => [...prevUrls, newUrlData]);
      setError(null);
    } catch {
      setError('Ungültige URL');
    }
  }, []);

  // Handle file and URL removals
  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  const handleRemoveUrl = useCallback((index: number) => {
    setUrlData(prevUrls => prevUrls.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setUrlData([]);
    setError(null);
    setFileItems([]);
  }, []);

  // Update ratings 
  const updateFileRating = useCallback((fileName: string, rating: 'safe' | 'sketchy' | 'unsafe') => {
    setFileRatings(prev => ({
      ...prev,
      [fileName]: rating
    }));
  }, []);

  // Update fileItems
  const handleFileItemsUpdate = useCallback((items: FileItem[]) => {
    setFileItems(items);
  }, []);

  // Updated to check both files and urlData
  const hasFiles = files.length > 0 || urlData.length > 0;

  // Listen for paste events that might contain multiple files or URLs
  useEffect(() => {
    // Vermeidet den Zyklus, indem wir handleFileDrop im Callback cachen
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Check for text in clipboard, could be a URL
      if (e.clipboardData && e.clipboardData.getData('text')) {
        const text = e.clipboardData.getData('text');
        // Try to parse as URL
        try {
          new URL(text);
          // It's a valid URL - we'll let the UrlInput component handle this
        } catch (e) {
          // Not a URL, ignore
        }
      }
      
      // Check for files in clipboard
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const filesArray = Array.from(e.clipboardData.files);
        handleFileDrop(filesArray);
      }
    };
    
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [handleFileDrop]); // handleFileDrop ist jetzt stable dank useCallback

  // Process files and URLs
  const handleUpload = useCallback(async () => {
    if (files.length === 0 && urlData.length === 0) {
      setError('Please choose a file to upload or add an image URL.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Process files first
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('rating', fileRatings[file.name] || 'safe');
        
        // Add individual file tags to the form data
        const fileTags = getFileTags(file.name);
        if (fileTags.length > 0) {
          formData.append('tags', JSON.stringify(fileTags));
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        console.log('Upload response data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Upload fehlgeschlagen');
        }

        // Only redirect if this is the only item to upload
        if (files.length === 1 && urlData.length === 0) {
          // Stelle sicher, dass die ID korrekt ist
          const postId = data.file.id;
          console.log('Redirecting to post ID:', postId);
          
          // Explizite Umwandlung in String für die URL
          router.push(`/post/${String(postId)}`);
        }
      }

      // Process URLs with downloaded images
      for (const item of urlData) {
        // If we have a tempFilePath, use it directly in the API call
        if (item.tempFilePath) {
          const formData = new FormData();
          // We don't need to fetch the URL again since we already have the temp file
          formData.append('imageUrl', item.url);
          formData.append('tempFilePath', item.tempFilePath);
          formData.append('rating', 'safe'); // Default to safe for now
          
          // Get tags if available
          const urlTags = fileItems.find(fi => fi.name === item.url)?.tags || [];
          if (urlTags.length > 0) {
            formData.append('tags', JSON.stringify(urlTags));
          }

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          console.log('URL upload with tempFile response:', data);

          if (!response.ok) {
            throw new Error(data.error || 'URL-Upload fehlgeschlagen');
          }

          // Only redirect if this is the last item and we have no files
          if (urlData.indexOf(item) === urlData.length - 1 && files.length === 0) {
            const postId = data.file.id;
            console.log('Redirecting to post ID (URL with temp):', postId);
            router.push(`/post/${String(postId)}`);
          }
        } else {
          // Fall back to the old method if we don't have a temp file
          const formData = new FormData();
          formData.append('imageUrl', item.url);
          formData.append('rating', 'safe');
          
          const urlTags = fileItems.find(fi => fi.name === item.url)?.tags || [];
          if (urlTags.length > 0) {
            formData.append('tags', JSON.stringify(urlTags));
          }

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          console.log('URL upload fallback response:', data);

          if (!response.ok) {
            throw new Error(data.error || 'URL-Upload fehlgeschlagen');
          }

          if (urlData.indexOf(item) === urlData.length - 1 && files.length === 0) {
            const postId = data.file.id;
            console.log('Redirecting to post ID (URL fallback):', postId);
            router.push(`/post/${String(postId)}`);
          }
        }
      }

      // If we have both files and URLs, redirect to the recent uploads
      if (files.length > 0 && urlData.length > 0) {
        router.push('/posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
    }
  }, [files, urlData, fileRatings, fileItems, getFileTags, router]);

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
                      disabled={isUploading || isProcessingUrls}
                      className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                        isUploading || isProcessingUrls
                          ? 'bg-purple-400 cursor-not-allowed'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      {isUploading ? 'Uploading...' : isProcessingUrls ? 'Processing URLs...' : 'Upload'}
                    </button>
                  </div>
                </div>
                <FileList 
                  files={files} 
                  urls={urlData.map(item => item.url)}
                  onRemoveFile={handleRemoveFile}
                  onRemoveUrl={handleRemoveUrl}
                  onUpdateRating={updateFileRating}
                  onItemsUpdate={handleFileItemsUpdate}
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
