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
  items: FileItem[]; // Changed from files and urls to a single items prop
  onRemoveFile: (name: string, type: 'file' | 'url') => void; // Unified remove handler
  onUpdateRating: (itemId: string, rating: 'safe' | 'sketchy' | 'unsafe') => void;
  onUpdateItemTags: (itemId: string, tags: string[], error?: string) => void; // For tag updates
  // onItemsUpdate is no longer needed here as FileList doesn't own the items state creation
}

export function FileList({ items, onRemoveFile, onUpdateRating, onUpdateItemTags }: Props) {
  // Removed local fileItems state, selectedItemId, currentTag as they are managed by parent or per item
  // const [fileItems, setFileItems] = useState<FileItem[]>([]); 
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null); // Still useful for focusing tag input
  const [currentTag, setCurrentTag] = useState(''); // Still useful for tag input on a specific item

  // useEffect that managed local fileItems is removed.
  // The `items` prop is now the source of truth.

  const handleRemove = useCallback((item: FileItem) => {
    // Call the unified remove handler from props
    onRemoveFile(item.name, item.type);
  }, [onRemoveFile]);

  const isValidTag = useCallback((tag: string): boolean => {
    const truncatedTag = tag.slice(0, 20);
    
    // Basic character validation
    const regex = /^[a-z0-9äöüß_-]+$/i;
    if (!regex.test(truncatedTag)) {
      return false;
    }
    
    // Must be at least 3 characters
    if (truncatedTag.length < 3) {
      return false;
    }
    
    // Filter out generic/meaningless tags
    const genericPatterns = [
      /^[a-z]{3}$/, // exactly 3 letters like "abc", "xyz"
      /^\d{3,}$/, // only numbers like "123", "456"
      /^([a-z])\1{2,}$/, // repeated characters like "aaa", "bbb"
      /^(test|temp|tmp|xxx|yyy|zzz|aaa|bbb|ccc)$/i,
      /^(qwe|asd|zxc|qaz|wsx|edc)$/i, // keyboard patterns
      /^(lol|wtf|omg|brb|ttyl|rofl|lmao|yolo)$/i, // common abbreviations that don't describe content
    ];
    
    return !genericPatterns.some(pattern => pattern.test(truncatedTag));
  }, []);

  const addTag = useCallback((itemId: string, tagValue: string) => {
    const cleanTag = tagValue.trim().toLowerCase().slice(0, 20);
    if (!cleanTag) return;

    const currentItem = items.find(it => it.id === itemId);
    if (!currentItem) return;

    if (cleanTag.length < 3) {
      onUpdateItemTags(itemId, currentItem.tags, 'Tags must be at least 3 characters long.');
      return;
    }
    
    if (!isValidTag(cleanTag)) {
      onUpdateItemTags(itemId, currentItem.tags, 'Invalid tag. Please use meaningful tags with letters, numbers, and common characters only.');
      return;
    }

    if (currentItem.tags.length >= 15) {
      onUpdateItemTags(itemId, currentItem.tags, 'Maximal 15 Tags erlaubt.');
      return;
    }

    if (currentItem.tags.includes(cleanTag)) {
      onUpdateItemTags(itemId, currentItem.tags, 'Tag existiert bereits.');
      return;
    }

    const newTags = [...currentItem.tags, cleanTag];
    onUpdateItemTags(itemId, newTags);
  }, [items, isValidTag, onUpdateItemTags]);

  const removeTag = useCallback((itemId: string, tagIndex: number) => {
    const currentItem = items.find(it => it.id === itemId);
    if (!currentItem) return;

    const newTags = currentItem.tags.filter((_, i) => i !== tagIndex);
    onUpdateItemTags(itemId, newTags);
  }, [items, onUpdateItemTags]);

  const updateContentRating = useCallback((itemId: string, rating: FileItem['contentRating']) => {
    onUpdateRating(itemId, rating);
  }, [onUpdateRating]);

  const handleTagInput = useCallback((itemId: string, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      if (value) {
        const tagsToAdd = value.split(/[\s,]+/).filter(tag => tag.trim());
        tagsToAdd.forEach(tag => addTag(itemId, tag));
        input.value = '';
        setCurrentTag(''); // Clear the shared currentTag state if it's still used for the focused input
      }
    }
  }, [addTag]);

  const handlePaste = useCallback((itemId: string, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    if (pastedText) {
      const tagsToAdd = pastedText.split(/[\s,]+/).filter(tag => tag.trim());
      tagsToAdd.forEach(tag => addTag(itemId, tag));
    }
  }, [addTag]);

  const clearAllTags = useCallback((itemId: string) => {
    const currentItem = items.find(it => it.id === itemId);
    if (!currentItem) return;
    onUpdateItemTags(itemId, []);
  }, [items, onUpdateItemTags]);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
          <div className="flex gap-4">
            {item.type === 'file' && item.format?.startsWith('video/') ? (
              <div className="w-24 h-24 flex-shrink-0 relative">
                {/* For video files, the thumbnail is already a blob URL created in page.tsx or from existing item */}
                <VideoPlayer
                  src={item.thumbnail || ''} // Assuming thumbnail is the blob URL for the video itself for preview
                  thumbnailSrc={item.thumbnail || '/images/video-placeholder.jpg'} // Or a specific poster if different
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
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white break-words word-wrap break-all">
                    {item.name}
                  </p>
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

              <div className="mt-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Rating:</span>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {(['safe', 'sketchy', 'unsafe'] as const).map((rating) => (
                    <label key={rating} className="flex items-center gap-2 p-2 sm:p-0 rounded border sm:border-0 border-gray-200 dark:border-gray-600 sm:bg-transparent bg-gray-50 dark:bg-gray-700/50">
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
                      className="px-3 py-1 text-sm rounded-lg text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Clear All Tags
                    </button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap break-words">
                  {item.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex} 
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1 break-all max-w-full"
                    >
                      <span className="break-all">{tag}</span>
                      <button 
                        className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                        onClick={() => removeTag(item.id, tagIndex)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={item.tags.length >= 15 ? "Maximum of 15 tags reached" : "Add tag (e.g. artwork, anime)"}
                    className="px-2 py-1 text-sm border rounded bg-transparent text-gray-700 dark:text-gray-300 disabled:opacity-50 min-w-0 flex-1"
                    onKeyDown={e => handleTagInput(item.id, e)}
                    onPaste={(e) => handlePaste(item.id, e)}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    disabled={item.tags.length >= 15}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.tags.length < 3 ? 
                    <span className="text-yellow-500">At least 3 meaningful tags required ({item.tags.length}/3)</span> : 
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
