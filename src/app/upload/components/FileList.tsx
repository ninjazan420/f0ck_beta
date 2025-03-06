'use client';
import { useState, useEffect, KeyboardEvent } from 'react';
import Image from 'next/image';

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

export function FileList({ 
  files, 
  urls, 
  onRemoveFile, 
  onRemoveUrl,
  onUpdateRating,
  onItemsUpdate
}: { 
  files: File[];
  urls: string[];
  onRemoveFile: (index: number) => void;
  onRemoveUrl: (index: number) => void;
  onUpdateRating?: (fileName: string, rating: 'safe' | 'sketchy' | 'unsafe') => void;
  onItemsUpdate?: (items: FileItem[]) => void;
}) {
  const [items, setItems] = useState<FileItem[]>([]);

  useEffect(() => {
    const processFile = async (file: File, index: number): Promise<FileItem> => {
      let thumbnail = '';
      let dimensions;
      const format = file.type;

      if (file.type.startsWith('image/')) {
        thumbnail = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // Bildabmessungen ermitteln
        dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = document.createElement('img');
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.src = thumbnail;
        });
      }

      return {
        id: Math.random().toString(36),
        name: file.name,
        type: 'file',
        size: file.size,
        tags: [],
        index,
        thumbnail,
        dimensions,
        format,
        contentRating: 'safe'
      };
    };

    const loadFiles = async () => {
      const newFiles = await Promise.all(files.map((file, index) => processFile(file, index)));
      const newUrls = urls.map((url, index) => ({
        id: Math.random().toString(36),
        name: url,
        type: 'url' as const,
        tags: [],
        index,
        contentRating: 'safe' as const
      }));

      setItems([...newFiles, ...newUrls]);
    };

    loadFiles();
  }, [files, urls]);

  useEffect(() => {
    if (onItemsUpdate && items.length > 0) {
      onItemsUpdate(items);
    }
  }, [items, onItemsUpdate]);

  const handleRemove = (item: FileItem) => {
    if (item.type === 'file') {
      onRemoveFile(item.index);
    } else {
      onRemoveUrl(item.index);
    }
  };

  const isValidTag = (tag: string): boolean => {
    // Erlaubt: Buchstaben inkl. deutscher Umlaute und Zahlen, keine Unterstriche, keine Sonderzeichen
    const tagRegex = /^[a-z0-9äöüß]+$/;
    return tagRegex.test(tag);
  };

  const addTag = (id: string, tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanTag) return;

    if (!isValidTag(cleanTag)) {
      setItems(prev => prev.map(item =>
        item.id === id ? 
          { ...item, error: 'Tags können nur Buchstaben, deutsche Umlaute und Zahlen enthalten' } 
          : item
      ));
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.id === id) {
        if (item.tags.length >= 10) {
          return { ...item, error: 'Maximum of 10 tags per upload reached' };
        }
        return { ...item, tags: [...item.tags, cleanTag], error: undefined };
      }
      return item;
    }));
  };

  const removeTag = (id: string, tagIndex: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? 
        { ...item, tags: item.tags.filter((_, i) => i !== tagIndex) } 
        : item
    ));
  };

  const updateContentRating = (id: string, rating: FileItem['contentRating']) => {
    // Finde das aktuelle Item
    const currentItem = items.find(item => item.id === id);
    
    // Aktualisiere die Items
    setItems(prev => 
      prev.map(item => item.id === id ? { ...item, contentRating: rating } : item)
    );
    
    // Rufe den Callback separat auf, außerhalb des setItems
    if (currentItem && onUpdateRating && currentItem.type === 'file') {
      // Verwende setTimeout, um sicherzustellen, dass der Callback nach dem Rendering aufgerufen wird
      setTimeout(() => {
        onUpdateRating(currentItem.name, rating);
      }, 0);
    }
  };

  const handleTagInput = (id: string, e: KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value.trim();

    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && value) {
      // Entferne Komma und Leerzeichen am Ende
      const tag = value.replace(/[,\s]+$/, '');
      addTag(id, tag);
      input.value = '';
      e.preventDefault(); // Verhindert das Hinzufügen des Trennzeichens
    }
  };

  const clearAllTags = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, tags: [], error: undefined } : item
    ));
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
          <div className="flex gap-4">
            {item.thumbnail && (
              <div className="w-24 h-24 flex-shrink-0 relative">
                <Image 
                  src={item.thumbnail} 
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
                    placeholder={item.tags.length >= 10 ? "Maximum of 10 tags reached" : "Add tag (e.g. artwork, anime)"}
                    className="px-2 py-1 text-sm border rounded bg-transparent text-gray-700 dark:text-gray-300 disabled:opacity-50"
                    onKeyDown={e => handleTagInput(item.id, e)}
                    disabled={item.tags.length >= 10}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
