import { useEffect, useState } from 'react';
import { CommentBox } from './CommentBox';
import { CommentList } from './CommentList';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState<any>(null);

  // Load post status first to check if comments are disabled
  useEffect(() => {
    async function fetchPostStatus() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${postId}/status`);
        if (response.ok) {
          const data = await response.json();
          console.log("Post status data:", data); // Debugging log
          setCommentsDisabled(!!data.commentsDisabled);
        }
      } catch (error) {
        console.error('Error loading post status:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPostStatus();
  }, [postId]);

  const handleCommentAdded = (comment: any) => {
    setNewComment(comment);
  };

  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  // Log für Debug-Zwecke
  console.log("CommentSection commentsDisabled:", commentsDisabled);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Comments</h2>
      
      {commentsDisabled && (
        <div className="p-4 bg-red-50/50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30 my-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-red-500 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-red-700 dark:text-red-300">Comments have been disabled by a moderator</h3>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                Existing comments remain visible, but no new comments can be added.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <CommentBox 
        postId={postId} 
        onCommentAdded={handleCommentAdded}
        disabled={commentsDisabled}
      />
      
      <CommentList
        postId={postId}
        newComment={newComment}
        showPostPreview={false}
      />
    </div>
  );
} 