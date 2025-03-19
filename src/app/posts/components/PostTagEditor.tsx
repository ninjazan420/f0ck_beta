'use client';
import { useState, useEffect, KeyboardEvent } from 'react';
import { useSession } from 'next-auth/react';
import { StatusBanner } from '@/components/StatusBanner';
import { toast } from 'react-hot-toast';

interface PostTagEditorProps {
  postId: string;
  initialTags: string[];
}

export function PostTagEditor({ postId, initialTags }: PostTagEditorProps) {
  const { data: session } = useSession();
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusBanner, setShowStatusBanner] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Only allow authenticated users to edit tags
  if (!session?.user) {
    return (
      <div className="mt-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const handleAddTag = async (tag: string) => {
    if (!tag.trim()) return;
    
    setIsAddingTag(true);
    try {
      // 1. Prüfen, ob das Tag bereits existiert
      const tagExists = await checkTagExists(tag);
      
      // 2. Wenn nicht, Tag erstellen (hier muss der creator korrekt übergeben werden)
      if (!tagExists) {
        await createTag(tag);
      }
      
      // 3. Tag zum Post hinzufügen
      await addTagToPost(tag);
      
      // 4. UI aktualisieren
      setTags(prev => [...prev, tag]);
      setInputValue('');
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Fehler beim Hinzufügen des Tags');
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
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
        body: JSON.stringify({ tags }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tags');
      }
      
      setStatusMessage('Tags updated successfully');
      setShowStatusBanner(true);
      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update tags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setTags(initialTags || []);
    setIsEditing(false);
    setError(null);
  };

  // Tag erstellen Funktion
  const createTag = async (tag: string) => {
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: tag, 
        // Keine creator-Info wird hier übergeben, wodurch der authUtility nicht weiß
        // welcher User beim withAuth-Wrapper verwendet werden soll
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create tag');
    }
    
    return response.json();
  };

  return (
    <>
      <StatusBanner
        show={showStatusBanner}
        message={statusMessage}
        type="default"
      />
      
      <div className="mt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-medium text-zinc-800 dark:text-zinc-200">Tags</h3>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 text-xs rounded-lg text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Edit
            </button>
          ) : (
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
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div 
              key={index} 
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1"
            >
              {tag}
              {isEditing && (
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => handleRemoveTag(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          {isEditing && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add tag..."
              className="px-2 py-1 text-sm border rounded bg-transparent text-gray-700 dark:text-gray-300"
              disabled={tags.length >= 30}
            />
          )}
        </div>
      </div>
    </>
  );
} 