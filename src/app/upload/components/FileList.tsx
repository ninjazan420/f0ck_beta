'use client';
import { useState, useEffect, useCallback, useMemo, KeyboardEvent } from 'react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { PreviewImageUrlData } from './UrlInput'; // Import the type
import { VideoPlayer } from '@/components/VideoPlayer';

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
  error?: string; // Für Tag-Fehlermeldungen
}

interface Props {
  files: File[];
  urls: (string | PreviewImageUrlData)[]; // Updated to accept both simple strings and PreviewImageUrlData
  onRemoveFile: (index: number) => void;
  onRemoveUrl: (index: number) => void;
  onUpdateRating: (fileName: string, rating: 'safe' | 'sketchy' | 'unsafe') => void;
  onItemsUpdate: (items: FileItem[]) => void;
}

export function FileList({ files, urls, onRemoveFile, onRemoveUrl, onUpdateRating, onItemsUpdate }: Props) {
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [currentTag, setCurrentTag] = useState('');

  const fileItemsLength = useMemo(() => fileItems.length, [fileItems]);

  useEffect(() => {
    // Process files and create new file items
    const processFiles = files.map((file, index) => {
      // Try to find any existing item for this file
      const existingItem = fileItems.find(
        (item) => item.type === 'file' && item.name === file.name && item.index === index
      );

      // If exists, keep its properties, otherwise create new
      if (existingItem) {
        return existingItem;
      }

      // For new files, create thumbnail
      const url = URL.createObjectURL(file);
      
      // Detect file format
      const format = file.type || '';
      const isVideo = format.startsWith('video/');
      
      return {
        id: uuidv4(),
        name: file.name,
        type: 'file' as const,
        size: file.size,
        tags: [],
        index,
        thumbnail: url,
        format: format,
        contentRating: 'safe' as const,
      };
    });

    // Process URLs and create new URL items
    const processUrls = urls.map((urlItem, index) => {
      // Check if we have a string or an object
      const url = typeof urlItem === 'string' ? urlItem : urlItem.url;
      const previewUrl = typeof urlItem !== 'string' ? urlItem.previewUrl : undefined;
      
      // Try to find any existing item for this URL
      const existingItem = fileItems.find(
        (item) => item.type === 'url' && item.name === url && item.index === index
      );

      // If exists, keep its properties, otherwise create new
      if (existingItem) {
        return existingItem;
      }

      return {
        id: uuidv4(),
        name: url,
        type: 'url' as const,
        tags: [],
        index,
        thumbnail: previewUrl || '/uploads/temp/placeholder.jpg', // Verwende den existierenden temp-Ordner
        contentRating: 'safe' as const,
      };
    });

    // Combine file items and URL items
    const newFileItems = [...processFiles, ...processUrls];

    // *** KRITISCHER FIX: Nur aktualisieren, wenn sich die Daten tatsächlich geändert haben ***
    // Vergleiche die neuen Items mit den aktuellen Items, um unnötige Aktualisierungen zu vermeiden
    const hasChanges = 
      newFileItems.length !== fileItems.length || 
      JSON.stringify(newFileItems.map(item => ({...item, id: null}))) !== 
      JSON.stringify(fileItems.map(item => ({...item, id: null})));
    
    if (hasChanges) {
      setFileItems(newFileItems);
      
      // Nur wenn es tatsächlich Änderungen gibt und der Callback existiert
      if (onItemsUpdate) {
        onItemsUpdate(newFileItems);
      }
    }
  }, [files, urls, fileItemsLength]);

  const handleRemove = useCallback((item: FileItem) => {
    if (item.type === 'file') {
      onRemoveFile(item.index);
    } else {
      onRemoveUrl(item.index);
    }
  }, [onRemoveFile, onRemoveUrl]);

  const isValidTag = useCallback((tag: string): boolean => {
    // Kürzen zu langer Tags
    const truncatedTag = tag.slice(0, 20);
    
    // Strenge Validierung nur erlaubter Zeichen
    const regex = /^[a-z0-9äöüß_-]+$/i; 
    return regex.test(truncatedTag);
  }, []);

  const addTag = useCallback((id: string, tag: string) => {
    const cleanTag = tag.trim().toLowerCase().slice(0, 20);
    console.log(`Tag hinzufügen: "${cleanTag}" zu Item mit ID ${id}`);
    
    if (!cleanTag) return;
    
    if (!isValidTag(cleanTag)) {
      setFileItems(prev => prev.map(item =>
        item.id === id ? 
          { ...item, error: 'Tags können nur Buchstaben, deutsche Umlaute und Zahlen enthalten' } 
          : item
      ));
      return;
    }

    // Lokales State-Update durchführen
    setFileItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === id) {
          if (item.tags.length >= 15) {
            return { ...item, error: 'Maximal 15 Tags erlaubt' };
          }
          
          if (item.tags.includes(cleanTag)) {
            return { ...item, error: 'Tag existiert bereits' };
          }
          
          const newTags = [...item.tags, cleanTag];
          console.log(`Neue Tags für Item ${item.name}:`, newTags);
          return { 
            ...item, 
            tags: newTags,
            error: undefined
          };
        }
        return item;
      });
      
      // Wichtig: Callback verzögern mit setTimeout, um nicht während des Renderings zu aktualisieren
      if (onItemsUpdate) {
        setTimeout(() => {
          onItemsUpdate(newItems);
        }, 0);
      }
      
      return newItems;
    });
  }, [isValidTag, onItemsUpdate]);

  const removeTag = useCallback((id: string, tagIndex: number) => {
    setFileItems(prev => {
      const newItems = prev.map(item =>
        item.id === id ? 
          { ...item, tags: item.tags.filter((_, i) => i !== tagIndex) } 
          : item
      );
      
      if (onItemsUpdate) {
        setTimeout(() => onItemsUpdate(newItems), 0);
      }
      
      return newItems;
    });
  }, [onItemsUpdate]);

  const updateContentRating = useCallback((id: string, rating: FileItem['contentRating']) => {
    // Finde das aktuelle Item
    const currentItem = fileItems.find(item => item.id === id);
    
    // Aktualisiere die Items
    setFileItems(prev => 
      prev.map(item => item.id === id ? { ...item, contentRating: rating } : item)
    );
    
    // Rufe den Callback auf, wenn das Item existiert
    if (currentItem && onUpdateRating) {
      onUpdateRating(currentItem.name, rating);
    }
  }, [fileItems, onUpdateRating]);

  const handleTagInput = useCallback((id: string, e: KeyboardEvent<HTMLInputElement>) => {
    // Füge Tag hinzu, wenn Enter, Komma oder Leertaste gedrückt wird
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      
      if (value) {
        // Teile den Text in einzelne Tags auf
        const tags = value.split(/\s+/).filter(tag => tag.trim());
        
        // Füge jeden Tag einzeln hinzu
        tags.forEach(tag => {
          addTag(id, tag);
        });
        
        input.value = '';
        setCurrentTag('');
      }
    }
  }, [addTag]);

  const handlePaste = useCallback((id: string, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    
    if (pastedText) {
      // Teile den eingefügten Text in einzelne Tags auf
      const tags = pastedText.split(/\s+/).filter(tag => tag.trim());
      
      // Füge jeden Tag einzeln hinzu
      tags.forEach(tag => {
        addTag(id, tag);
      });
    }
  }, [addTag]);

  const clearAllTags = useCallback((id: string) => {
    setFileItems(prev => {
      const newItems = prev.map(item =>
        item.id === id ? { ...item, tags: [], error: undefined } : item
      );
      
      if (onItemsUpdate) {
        setTimeout(() => onItemsUpdate(newItems), 0);
      }
      
      return newItems;
    });
  }, [onItemsUpdate]);

  return (
    <div className="space-y-4">
      {fileItems.map((item) => (
        <div key={item.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
          <div className="flex gap-4">
            {item.type === 'file' && item.format?.startsWith('video/') ? (
              <div className="w-24 h-24 flex-shrink-0 relative">
                <VideoPlayer
                  src={URL.createObjectURL(files.find(f => f.name === item.name) || new Blob())}
                  thumbnailSrc={item.thumbnail || '/images/video-placeholder.jpg'}
                  width="96px"
                  height="96px"
                  controls={false}
                  autoPlay={false}
                  muted={true}
                  poster={item.thumbnail || '/images/video-placeholder.jpg'}
                />

              </div>
            ) : (
              <div className="w-24 h-24 flex-shrink-0 relative">
                <Image 
                  src={item.thumbnail || '/images/placeholder.jpg'} 
                  alt={item.name}
                  width={96}
                  height={96}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            )}

            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                  <div className="text-sm text-gray-500 space-y-1">
                    {item.size && (
                      <span className="block">
                        Size: {(item.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    )}
                    {item.dimensions && (
                      <span className="block">
                        Dimensions: {item.dimensions.width}×{item.dimensions.height}
                      </span>
                    )}
                    {item.format && (
                      <span className="block">
                        Format: {item.format.split('/')[1].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item)}
                  className="p-2 text-gray-500 hover:text-red-500 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="mt-3 flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rating:</span>
                <div className="flex gap-3">
                  {(['safe', 'sketchy', 'unsafe'] as const).map((rating) => (
                    <label key={rating} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`rating-${item.id}`}
                        checked={item.contentRating === rating}
                        onChange={() => updateContentRating(item.id, rating)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {rating}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-red-500 dark:text-red-400">
                    {item.error}
                  </div>
                  {item.tags.length > 0 && (
                    <button
                      onClick={() => clearAllTags(item.id)}
                      className="px-4 py-2 text-sm rounded-lg text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Clear All Tags
                    </button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {item.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex} 
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => removeTag(item.id, tagIndex)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={item.tags.length >= 15 ? "Maximum of 15 tags reached" : "Add tag (e.g. artwork, anime)"}
                    className="px-2 py-1 text-sm border rounded bg-transparent text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    onKeyDown={e => handleTagInput(item.id, e)}
                    onPaste={(e) => handlePaste(item.id, e)}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    disabled={item.tags.length >= 15}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.tags.length < 3 ? 
                    <span className="text-yellow-500">At least 3 tags required ({item.tags.length}/3)</span> : 
                    `${item.tags.length}/15 tags used`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
