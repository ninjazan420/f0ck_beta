'use client';

import { useState, useEffect } from 'react';

interface PostStats {
  [postId: string]: {
    likes: number;
    comments: number;
    favorites: number;
  }
}

export function PostStatsUpdater() {
  const [stats, setStats] = useState<PostStats>({});
  
  // Poll for stats updates every 30 seconds
  useEffect(() => {
    let isMounted = true;
    
    const updateVisiblePostStats = async () => {
      try {
        // Find all visible post IDs in the DOM
        const postElements = document.querySelectorAll('[data-post-id]');
        const postIds = Array.from(postElements).map(el => 
          el.getAttribute('data-post-id')
        ).filter(Boolean) as string[];
        
        if (postIds.length === 0) return;
        
        // Fetch stats for all visible posts
        const response = await fetch('/api/posts/batch-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postIds })
        });
        
        if (!response.ok) return;
        
        const newStats = await response.json();
        if (!isMounted) return;
        
        setStats(newStats);
        
        // Update the stats in the DOM
        Object.entries(newStats).forEach(([postId, postStats]) => {
          const likeEl = document.querySelector(`[data-like-count="${postId}"]`);
          const commentEl = document.querySelector(`[data-comment-count="${postId}"]`);
          const favoriteEl = document.querySelector(`[data-favorite-count="${postId}"]`);
          
          if (likeEl) likeEl.textContent = postStats.likes.toString();
          if (commentEl) commentEl.textContent = postStats.comments.toString();
          if (favoriteEl) favoriteEl.textContent = postStats.favorites.toString();
        });
      } catch (error) {
        console.error('Error updating post stats:', error);
      }
    };
    
    // Update immediately and then every 30 seconds
    updateVisiblePostStats();
    const interval = setInterval(updateVisiblePostStats, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  
  // This is an invisible component - it just manages stats updates
  return null;
} 