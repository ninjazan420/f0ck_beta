'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";
import { UploadBox } from './components/UploadBox';
import { UploadOptions } from './components/UploadOptions';
import { FileList } from './components/FileList';
import { UrlInput, PreviewImageUrlData } from './components/UrlInput';
import { BatchTagging } from './components/BatchTagging';

export interface FileItem {
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
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [processingPaste, setProcessingPaste] = useState(false);

  const itemMap = useMemo(() => {
    const map = new Map<string, FileItem>();
    fileItems.forEach(item => {
      const key = `${item.type}:${item.name}`;
      map.set(key, item);
    });
    return map;
  }, [fileItems]);

  const getItemTags = useCallback((name: string, type: 'file' | 'url'): string[] => {
    const exactMatch = itemMap.get(`${type}:${name}`);
    if (exactMatch) return exactMatch.tags;
    
    const baseFilename = name.split('/').pop()?.split('\\').pop();
    if (baseFilename) {
      const partialMatch = fileItems.find(item => 
        item.type === type && (
          item.name.includes(baseFilename) || baseFilename.includes(item.name)
        )
      );
      if (partialMatch) return partialMatch.tags;
    }
    
    console.warn(`Keine Tags gefunden für ${type} "${name}"`);
    return [];
  }, [fileItems, itemMap]);

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

  const handleUrlAdd = useCallback((newUrlData: PreviewImageUrlData) => {
    try {
      new URL(newUrlData.url); // URL validation
      setUrlData(prevUrls => [...prevUrls, newUrlData]);
      setError(null);
    } catch {
      setError('Ungültige URL');
    }
  }, []);

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

  const updateFileRating = useCallback((fileName: string, rating: 'safe' | 'sketchy' | 'unsafe') => {
    setFileRatings(prev => ({
      ...prev,
      [fileName]: rating
    }));
  }, []);

  const handleFileItemsUpdate = useCallback((items: FileItem[]) => {
    setFileItems(items);
  }, []);

  const hasFiles = files.length > 0 || urlData.length > 0;

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (processingPaste) return;
      
      try {
        setProcessingPaste(true);
        
        const activeEl = document.activeElement;
        const isInputEmpty = activeEl instanceof HTMLInputElement && !activeEl.value;
        
        if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) {
          if (!isInputEmpty) {
            return;
          }
        }
        
        if (e.clipboardData && e.clipboardData.files.length > 0) {
          e.preventDefault();
          const filesArray = Array.from(e.clipboardData.files);
          handleFileDrop(filesArray);
          return;
        }
        
        if (e.clipboardData && e.clipboardData.getData('text')) {
          const text = e.clipboardData.getData('text');
          try {
            new URL(text);
          } catch (e) {
            // Keine gültige URL, ignorieren
          }
        }
      } finally {
        setTimeout(() => setProcessingPaste(false), 100);
      }
    };
    
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [handleFileDrop, processingPaste]);

  const handleUpload = useCallback(async () => {
    try {
      setIsUploading(true);
      setError(null);
      
      for (const file of files) {
        const fileTags = getItemTags(file.name, 'file');
        if (fileTags.length < 3) {
          throw new Error(`Insert at least 3 tags for "${file.name}"`);
        }
        if (fileTags.length > 15) {
          throw new Error(`Maximum of 15 tags allowed for "${file.name}"`);
        }
      }
      
      for (const item of urlData) {
        const urlTags = getItemTags(item.url, 'url');
        if (urlTags.length < 3) {
          throw new Error(`Insert at least 3 tags for URL "${item.url}"`);
        }
        if (urlTags.length > 15) {
          throw new Error(`Maximum of 15 tags allowed for URL "${item.url}"`);
        }
      }
      
      const successfulUploads: { id: string, type: 'file' | 'url' }[] = [];

      for (const file of files) {
        console.log(`Verarbeite Datei: ${file.name}`);
        console.log(`FileItems Stand:`, fileItems.map(i => ({name: i.name, type: i.type, tags: i.tags})));
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('rating', fileRatings[file.name] || 'safe');
          
          const fileTags = getItemTags(file.name, 'file');
          if (fileTags.length > 0) {
            formData.append('tags', JSON.stringify(fileTags));
            console.log(`Uploading file ${file.name} with tags:`, fileTags);
          }

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/upload';
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          const data = await response.json();
          
          console.log(`[DEBUG] Server-Antwort für File "${file.name}":`, data);

          if (!response.ok) {
            throw new Error(data.error || `Upload von "${file.name}" fehlgeschlagen`);
          }

          if (data.file && data.file.id) {
            successfulUploads.push({
              id: String(data.file.id),
              type: 'file'
            });
          }
        } catch (fileError) {
          console.error(`[ERROR] Fehler beim Upload von Datei "${file.name}":`, fileError);
          setError(prev => prev ? `${prev}; ${(fileError as Error).message}` : (fileError as Error).message);
        }
      }

      for (const item of urlData) {
        try {
          const formData = new FormData();
          
          formData.append('imageUrl', item.url);
          
          formData.append('rating', 'safe');
          
          const urlTags = getItemTags(item.url, 'url');
          
          console.log(`[DEBUG] Tags für URL "${item.url}":`, urlTags);
          
          if (urlTags.length > 0) {
            formData.append('tags', JSON.stringify(urlTags));
          }
          
          if (item.tempFilePath) {
            formData.append('tempFilePath', item.tempFilePath);
            
            if (item.dimensions) {
              formData.append('dimensions', JSON.stringify(item.dimensions));
            }
          }

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/upload';
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          const data = await response.json();
          
          console.log(`[DEBUG] Server-Antwort für URL "${item.url}":`, data);

          if (!response.ok) {
            throw new Error(data.error || `Upload von URL "${item.url}" fehlgeschlagen`);
          }

          if (data.file && data.file.id) {
            successfulUploads.push({
              id: String(data.file.id),
              type: 'url'
            });
          }
        } catch (urlError) {
          console.error(`[ERROR] Fehler beim Upload von URL "${item.url}":`, urlError);
          setError(prev => prev ? `${prev}; ${(urlError as Error).message}` : (urlError as Error).message);
        }
      }

      if (successfulUploads.length > 0) {
        if (successfulUploads.length === 1) {
          const postId = successfulUploads[0].id;
          console.log(`[INFO] Weiterleitung zu Post ID: ${postId}`);
          router.push(`/post/${postId}`);
        } 
        else {
          console.log(`[INFO] ${successfulUploads.length} Uploads erfolgreich, Weiterleitung zur Übersicht`);
          router.push('/posts');
        }
      } else if (error) {
        console.warn('[WARNING] Keine erfolgreichen Uploads');
      }
    } catch (err) {
      console.error('[ERROR] Unerwarteter Fehler beim Upload-Prozess:', err);
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
    }
  }, [files, urlData, fileRatings, fileItems, getItemTags, router, error]);

  const handleBatchTagging = useCallback((selectedFiles: string[], tags: string[]) => {
    setFileItems(prevItems => 
      prevItems.map(item => 
        selectedFiles.includes(item.id)
          ? { ...item, tags: [...new Set([...item.tags, ...tags])] }
          : item
      )
    );
  }, []);

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
            <UrlInput 
              onUrlAdd={handleUrlAdd} 
              onImagePaste={handleFileDrop}
            />
            {hasFiles && (
              <>
                <div className="flex items-center justify-between">
                  <UploadOptions />
                  <div className="flex gap-4">
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1 text-sm rounded-lg text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading || isProcessingUrls}
                      className={`px-4 py-1 rounded-lg text-white font-medium transition-colors ${
                        isUploading || isProcessingUrls
                          ? 'bg-purple-400 cursor-not-allowed'
                          : 'bg-purple-500 hover:bg-purple-600' 
                      }`}
                    >
                      {isUploading ? 'Uploading...' : isProcessingUrls ? 'Processing URLs...' : 'Upload'}
                    </button>
                  </div>
                </div>
                {fileItems.length > 1 && (
                  <BatchTagging 
                    fileItems={fileItems}
                    onApplyTags={handleBatchTagging}
                  />
                )}
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