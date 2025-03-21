'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { StatusBanner } from '@/components/StatusBanner';

interface PostTagsProps {
  tags: Array<{id: string; name: string; type?: string; count?: number}>;
  postId: string;
}

export function PostTags({ tags, postId }: PostTagsProps) {
  const { data: session } = useSession();
  const [editMode, setEditMode] = useState(false);
  const [tagList, setTagList] = useState(tags.map(tag => tag.name));
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusBanner, setShowStatusBanner] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    
    // Validate tag format
    if (!normalizedTag) return;
    
    // Validate tag format (only letters, numbers, German umlauts, and underscore)
    if (!/^[a-z0-9äöüß_-]+$/.test(normalizedTag)) {
      setError('Tags can only contain letters, German umlauts, numbers, underscores, and hyphens');
      return;
    }
    
    // Check length
    if (normalizedTag.length > 20) {
      setError('Tags can be at most 20 characters long');
      return;
    }
    
    // Check for duplicates
    if (tagList.includes(normalizedTag)) {
      setError('This tag already exists');
      return;
    }
    
    // Check for maximum number of tags
    if (tagList.length >= 30) {
      setError('Maximum of 30 tags allowed');
      return;
    }
    
    setTagList([...tagList, normalizedTag]);
    setInputValue('');
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const handleRemoveTag = (index: number) => {
    setTagList(tagList.filter((_, i) => i !== index));
  };

  const handleSaveTags = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/posts/${postId}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: tagList }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tags');
      }
      
      setStatusMessage('Tags updated successfully');
      setShowStatusBanner(true);
      setEditMode(false);
      
      // Force full page reload to ensure tag statistics are updated
      window.location.reload();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update tags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setTagList(tags.map(tag => tag.name));
    setEditMode(false);
    setError(null);
  };

  return (
    <>
      <StatusBanner
        show={showStatusBanner}
        message={statusMessage}
        type="default"
      />
      
      <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400">
            Tags
          </h3>
          
          {/* Show edit button only for authenticated users */}
          {session?.user && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-2 py-1 text-xs rounded-lg text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Edit
            </button>
          )}
          
          {editMode && (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-2 py-1 text-xs rounded-lg text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTags}
                className="px-2 py-1 text-xs rounded-lg text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mb-2">
            {error}
          </div>
        )}
        
        {/* Display tags differently based on mode */}
        {tags.length === 0 && !editMode ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            No Tags available yet. Be the first who adds some!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {/* In edit mode, show tags with delete button */}
            {editMode ? (
              <>
                {tagList.map((tag, index) => (
                  <div 
                    key={index} 
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button 
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => handleRemoveTag(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tag..."
                  className="px-2 py-1 text-sm border rounded bg-transparent text-gray-700 dark:text-gray-300"
                  disabled={tagList.length >= 30}
                />
              </>
            ) : (
              // In view mode, show tags as links with the original gradient design
              tags.map((tag, index) => (
                <Link 
                  key={index}
                  href={`/posts?tag=${encodeURIComponent(tag.name)}`}
                  className="px-2 py-1 rounded-lg text-xs font-medium 
                    bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent
                    hover:opacity-80 transition-opacity
                    border border-gray-200 dark:border-gray-700"
                >
                  {tag.name}
                  <span className="ml-1 text-gray-400">({tag.count || 0})</span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
