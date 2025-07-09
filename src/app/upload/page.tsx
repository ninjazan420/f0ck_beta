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
  tempFilePath?: string; // Added missing property
  fileObject?: File; // Added for file uploads
  uploadStatus?: 'success' | 'failed'; // Added for upload tracking
}

export default function UploadPage() {
  const router = useRouter();
  // const [files, setFiles] = useState<File[]>([]); // No longer needed, managed by fileItems
  // const [urlData, setUrlData] = useState<PreviewImageUrlData[]>([]); // No longer needed, managed by fileItems
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // const [isProcessingUrls, setIsProcessingUrls] = useState(false); // Covered by isUploading or specific item states
  // const [fileRatings, setFileRatings] = useState<{[key: string]: 'safe' | 'sketchy' | 'unsafe'}>({}); // Moved to FileItem
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [processingPaste, setProcessingPaste] = useState(false);
  const [options, setOptions] = useState({
    skipDuplicate: true, // Default, can be changed by UploadOptions component
    forceUploadSimilar: false,
    uploadAnonymously: false,
  });

  // itemMap and getItemTags can be simplified or adjusted if tags are always directly on fileItems
  const getItemTags = useCallback((itemId: string): string[] => {
    const item = fileItems.find(fi => fi.id === itemId);
    return item ? item.tags : [];
  }, [fileItems]);

  const uuidv4 = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });

  const handleFileDrop = useCallback(async (acceptedFiles: File[], acceptedUrlsInput?: string[]) => {
    setError(null);
    let localErrorAccumulator = '';
    const newItemsToAdd: FileItem[] = [];

    for (const file of acceptedFiles) {
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      if (!isValidSize) {
        localErrorAccumulator += `File "${file.name}" is bigger than 100mb; `;
        continue;
      }
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
      if (!isValidType) {
        localErrorAccumulator += `File "${file.name}": Format is not supported yet; `;
        continue;
      }
      if (options.skipDuplicate && fileItems.some(fi => fi.type === 'file' && fi.name === file.name && fi.size === file.size)) {
        localErrorAccumulator += `File "${file.name}" was already in upload process (skipped); `;
        continue;
      }
      const thumbnailUrl = URL.createObjectURL(file);
      newItemsToAdd.push({
        id: uuidv4(),
        name: file.name,
        type: 'file',
        size: file.size,
        tags: [],
        index: fileItems.length + newItemsToAdd.length, 
        thumbnail: thumbnailUrl,
        format: file.type || '',
        contentRating: 'safe',
        fileObject: file, // Keep the file object for upload
      } as FileItem); // Type assertion for fileObject
    }

    if (acceptedUrlsInput) {
      for (const url of acceptedUrlsInput) {
        try {
          new URL(url); // Validate URL
          if (options.skipDuplicate && fileItems.some(fi => fi.type === 'url' && fi.name === url)) {
            localErrorAccumulator += `URL "${url}" was already in upload process (skipped); `;
            continue;
          }
          setIsUploading(true); // Indicate processing
          const response = await fetch(`/api/preview-url?url=${encodeURIComponent(url)}`);
          setIsUploading(false);
          if (!response.ok) throw new Error('Failed to fetch preview');
          const data = await response.json();
          newItemsToAdd.push({
            id: uuidv4(),
            name: url,
            type: 'url',
            tags: [],
            index: fileItems.length + newItemsToAdd.length,
            thumbnail: data.previewUrl || '/uploads/temp/placeholder.jpg',
            contentRating: 'safe',
            tempFilePath: data.tempFilePath || '',
            dimensions: data.dimensions, 
          });
        } catch (err) {
          setIsUploading(false);
          localErrorAccumulator += `Error processing URL "${url}": ${(err as Error).message}; `;
          newItemsToAdd.push({
            id: uuidv4(),
            name: url,
            type: 'url',
            tags: [],
            index: fileItems.length + newItemsToAdd.length,
            thumbnail: '/uploads/temp/placeholder.jpg',
            contentRating: 'safe',
            error: `Failed to process URL: ${(err as Error).message}`
          });
        }
      }
    }

    if (newItemsToAdd.length > 0) {
      setFileItems(prevItems => [...prevItems, ...newItemsToAdd]);
    }
    if (localErrorAccumulator) {
      setError(prevError => prevError ? prevError + localErrorAccumulator : localErrorAccumulator);
    }
  }, [fileItems, options.skipDuplicate]);

  const handleUrlAdd = useCallback((urlDataInput: PreviewImageUrlData) => {
    handleFileDrop([], [urlDataInput.url]);
  }, [handleFileDrop]);

  const handleRemoveItem = useCallback((itemId: string) => {
    setFileItems(prevItems => prevItems.filter(item => {
      if (item.thumbnail && item.thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(item.thumbnail); // Clean up blob URL
      }
      return item.id !== itemId;
    }));
  }, []);

  const handleClearAll = useCallback(() => {
    fileItems.forEach(item => {
      if (item.thumbnail && item.thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(item.thumbnail);
      }
    });
    setFileItems([]);
    setError(null);
  }, [fileItems]);

  const handleUpdateItemRating = useCallback((itemId: string, rating: 'safe' | 'sketchy' | 'unsafe') => {
    setFileItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, contentRating: rating, error: undefined } : item
      )
    );
  }, []);

  const handleUpdateItemTags = useCallback((itemId: string, tags: string[], errorMsg?: string) => {
    setFileItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, tags: tags, error: errorMsg || undefined } : item
      )
    );
  }, []);

  const hasFiles = fileItems.length > 0; // Updated to use fileItems


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

  useEffect(() => {
    if (processingPaste || isUploading) { // Changed from isProcessingUrls
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [processingPaste, isUploading]); // Changed from isProcessingUrls

  const handleUpload = useCallback(async () => {
    setIsUploading(true);
    setError(null);
    let overallUploadSuccess = true;

    let itemsToProcess = fileItems.map(item => {
      if (!options.uploadAnonymously && item.tags.length < 3) {
        overallUploadSuccess = false;
        return { ...item, error: `At least 3 tags for "${item.name}".` };
      }
      if (item.tags.length > 15) {
        overallUploadSuccess = false;
        return { ...item, error: `Max 15 tags for "${item.name}" allowed.` };
      }
      return { ...item, error: undefined }; 
    });

    setFileItems(itemsToProcess);

    if (!overallUploadSuccess) {
      setError("Please correct tag errors before uploading.");
      setIsUploading(false);
      return;
    }

    const successfulApiUploads: { id: string, serverId: string, type: 'file' | 'url', name: string }[] = [];

    for (const item of itemsToProcess) {
      if (item.error) continue; 

      try {
        const formData = new FormData();
        if (item.type === 'file' && (item as any).fileObject) {
          formData.append('file', (item as any).fileObject);
        } else if (item.type === 'url') {
          formData.append('imageUrl', item.name);
          if ((item as any).tempFilePath) formData.append('tempFilePath', (item as any).tempFilePath);
          if (item.dimensions) formData.append('dimensions', JSON.stringify(item.dimensions));
        }
        formData.append('rating', item.contentRating);
        formData.append('uploadAnonymously', String(options.uploadAnonymously));
        formData.append('forceUploadSimilar', String(options.forceUploadSimilar));
        formData.append('tags', JSON.stringify(item.tags));
        formData.append('skipDuplicate', String(options.skipDuplicate)); 

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/upload';
        const response = await fetch(apiUrl, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Upload "${item.name}" error: ${response.statusText}`);
        }
        if (data.file && data.file.id) {
          successfulApiUploads.push({ id: item.id, serverId: String(data.file.id), type: item.type, name: item.name });
          itemsToProcess = itemsToProcess.map(fi => fi.id === item.id ? { ...fi, error: undefined, uploadStatus: 'success' } : fi);
        } else {
          throw new Error(data.error || `No server ID returned for "${item.name}".`);
        }
      } catch (uploadError) {
        overallUploadSuccess = false;
        const errorMsg = (uploadError as Error).message;
        itemsToProcess = itemsToProcess.map(fi => fi.id === item.id ? { ...fi, error: errorMsg, uploadStatus: 'failed' } : fi);
      }
      setFileItems([...itemsToProcess]); 
    }

    setIsUploading(false);

    const attemptedUploadsCount = itemsToProcess.filter(it => !(it as any).uploadStatus && !it.error).length + successfulApiUploads.length + itemsToProcess.filter(it => (it as any).uploadStatus === 'failed').length;
    const successfullyUploadedCount = successfulApiUploads.length;

    if (overallUploadSuccess && successfullyUploadedCount === attemptedUploadsCount && successfullyUploadedCount > 0) {
      if (successfullyUploadedCount === 1) {
        router.push(`/post/${successfulApiUploads[0].serverId}`);
      } else {
        router.push('/posts'); 
      }
    } else if (!overallUploadSuccess) {
      setError("Einige Uploads sind fehlgeschlagen. Bitte Details prüfen.");
    } else if (successfullyUploadedCount === 0 && attemptedUploadsCount > 0) {
      setError("Alle versuchten Uploads sind fehlgeschlagen.");
    } else if (attemptedUploadsCount === 0 && fileItems.length > 0) {
      setError("Keine Dateien zum Hochladen aufgrund von vorherigen Fehlern (z.B. Tags).");
    }
  }, [fileItems, options, router]);

  const handleBatchTagging = useCallback((selectedFileIds: string[], newTags: string[]) => {
    setFileItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (selectedFileIds.includes(item.id)) {
          // Filter out empty or whitespace-only tags from newTags before adding
          const cleanedNewTags = newTags.map(t => t.trim()).filter(t => t.length > 0);
          const combinedTags = [...new Set([...item.tags, ...cleanedNewTags])];
          return { ...item, tags: combinedTags, error: undefined }; // Clear previous error on successful tagging
        }
        return item;
      });
      return updatedItems;
    });
  }, [setFileItems]); // Added setFileItems to dependency array

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
                       disabled={isUploading} // Removed isProcessingUrls
                        className={`px-4 py-1 rounded-lg text-white font-medium transition-colors ${
                         isUploading // Removed isProcessingUrls
                            ? 'bg-purple-400 cursor-not-allowed'
                            : 'bg-purple-500 hover:bg-purple-600' 
                        }`}
                      >
                       {isUploading ? 'Uploading...' : 'Upload'} {/* Removed isProcessingUrls check */}
                      </button>
                  </div>
                </div>
                {fileItems.length > 1 && (
                  <BatchTagging 
                    fileItems={fileItems} // Pass fileItems directly
                    onApplyTags={handleBatchTagging}
                  />
                )}
                <FileList 
                  items={fileItems} // Pass fileItems directly
                  onRemoveFile={handleRemoveItem} // Use the new unified remover
                  onUpdateRating={handleUpdateItemRating} // Use the new rating updater
                  onUpdateItemTags={handleUpdateItemTags} // Use the new tag updater
                  // onItemsUpdate is no longer needed as FileList doesn't manage its own items state anymore
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