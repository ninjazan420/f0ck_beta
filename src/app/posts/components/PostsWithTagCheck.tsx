'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface PostsWithTagCheckProps {
  children: React.ReactNode;
}

export function PostsWithTagCheck({ children }: PostsWithTagCheckProps) {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');
  
  const [hasTagError, setHasTagError] = useState(false);
  const [isChecking, setIsChecking] = useState(!!tagParam);
  
  useEffect(() => {
    // If no tag parameter, return immediately
    if (!tagParam) {
      setIsChecking(false);
      setHasTagError(false);
      return;
    }
    
    // Perform tag check
    async function checkTagExists() {
      try {
        // Check if tag exists and has posts
        const response = await fetch(`/api/tags/validate?tag=${encodeURIComponent(tagParam)}`);
        const data = await response.json();
        
        // If no posts with this tag, show error
        setHasTagError(!data.hasPostsWithTag);
      } catch (error) {
        console.error('Error checking tag:', error);
        setHasTagError(false); // In case of doubt, show normal view
      } finally {
        setIsChecking(false);
      }
    }
    
    checkTagExists();
  }, [tagParam]);
  
  if (isChecking) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (hasTagError) {
    return (
      <div className="my-8 text-center">
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mx-auto max-w-lg">
          <h3 className="text-amber-800 dark:text-amber-200 font-medium mb-2">No posts found</h3>
          <p className="text-amber-700 dark:text-amber-300">
            No posts were found with the tag &quot;{tagParam}&quot;.
          </p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 