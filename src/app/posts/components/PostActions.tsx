'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface PostActionsProps {
  postId: string;
  initialLikes: number;
  initialFavorites: number;
  initialLiked?: boolean;
  initialFavorited?: boolean;
}

export function PostActions({ 
  postId,
  initialLikes = 0,
  initialFavorites = 0,
  initialLiked = false,
  initialFavorited = false
}: PostActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [favoriteCount, setFavoriteCount] = useState(initialFavorites);
  const [liked, setLiked] = useState(initialLiked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load initial states from server for authenticated users
  useEffect(() => {
    if (session?.user) {
      async function loadUserInteractions() {
        try {
          const response = await fetch(`/api/posts/${postId}/user-interactions`);
          if (response.ok) {
            const data = await response.json();
            setLiked(data.liked);
            setFavorited(data.favorited);
          }
        } catch (error) {
          console.error('Error loading user interactions:', error);
        }
      }
      
      loadUserInteractions();
    }
  }, [postId, session]);

  const handleLike = async () => {
    if (!session) {
      // Redirect to login if not authenticated
      router.push(`/login?callbackUrl=/post/${postId}`);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const method = liked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${postId}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
        
        // Update UI optimistically
        toast.success(liked ? 'Like removed' : 'Post liked');
        
        // Refresh page to update other components
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFavorite = async () => {
    if (!session) {
      // Redirect to login if not authenticated
      router.push(`/login?callbackUrl=/post/${postId}`);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const method = favorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${postId}/favorite`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorited(data.favorited);
        setFavoriteCount(data.favoritesCount);
        
        // Update UI optimistically
        toast.success(favorited ? 'Removed from favorites' : 'Added to favorites');
        
        // Refresh page to update other components
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Failed to update favorites');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <div className="flex space-x-4">
        <button 
          onClick={handleLike} 
          disabled={isProcessing}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            liked 
              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
              : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span className="text-lg">{liked ? '👍' : '👍'}</span>
          <span>{likeCount}</span>
        </button>
        
        <button 
          onClick={handleFavorite} 
          disabled={isProcessing}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            favorited 
              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' 
              : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span className="text-lg">{favorited ? '⭐' : '☆'}</span>
          <span>{favoriteCount}</span>
        </button>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Share:
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('URL copied to clipboard');
          }}
          className="ml-2 px-2 py-1 bg-white dark:bg-gray-700 rounded"
        >
          🔗 Copy Link
        </button>
      </div>
    </div>
  );
} 