import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CommentBoxProps {
  postId: string;
  onCommentAdded: (comment: any) => void;
  disabled?: boolean;
}

export function CommentBox({ postId, onCommentAdded, disabled = false }: CommentBoxProps) {
  const { data: session } = useSession();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [post, setPost] = useState<{id: string, commentsDisabled?: boolean} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lade Post-Informationen einschließlich Status
  useEffect(() => {
    async function fetchPostStatus() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${postId}/status`);
        if (response.ok) {
          const data = await response.json();
          console.log("CommentBox received post status:", data); // Debug-Info
          
          // Normalisiere die Daten, damit wir eine einheitliche Eigenschaft haben
          setPost({
            id: data.id,
            // Prüfe beide möglichen Eigenschaftsnamen
            commentsDisabled: data.commentsDisabled || data.hasCommentsDisabled || false
          });
        }
      } catch (error) {
        console.error('Error fetching post status:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPostStatus();
  }, [postId]);
  
  // Logging zur Debug-Überprüfung
  console.log("CommentBox disabled prop:", disabled);
  console.log("CommentBox post state:", post);
  
  // Funktion zum Senden des Kommentars
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || isSubmitting || disabled) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: comment,
          postId,
          isAnonymous
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }
      
      const newComment = await response.json();
      
      // Zurücksetzen des Formulars
      setComment('');
      setIsAnonymous(false);
      
      // Callback für hinzugefügten Kommentar
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Am besten direkt nach dem Laden-Indikator prüfen
  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Wenn Kommentare deaktiviert sind, zeigen wir nur die Hinweismeldung an
  if (post?.commentsDisabled || disabled) {
    return (
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
              Existing comments remain visible, but new comments cannot be added.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Wenn nicht eingeloggt, Login-Aufforderung anzeigen
  if (!session) {
    return (
      <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="mb-2 text-gray-600 dark:text-gray-400">
          Please log in to leave a comment.
        </p>
        <Link href="/login" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
          Sign In
        </Link>
      </div>
    );
  }
  
  // Neues Design für die Kommentarbox, das auch im deaktivierten Zustand angezeigt wird
  return (
    <div className={`rounded-lg border ${disabled ? 'border-gray-300 dark:border-gray-700/30 bg-gray-100/50 dark:bg-gray-800/30' : 'border-purple-200 dark:border-purple-800/30 bg-purple-50/50 dark:bg-purple-900/10'}`}>
      <div className="p-4">
        {/* Hinweis anzeigen, wenn Kommentare deaktiviert sind */}
        {disabled && (
          <div className="relative mb-4 px-3 py-2 bg-red-100/80 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
            Comments are currently disabled for this post
          </div>
        )}
        
        <div className={`${disabled ? 'opacity-60' : ''}`}>
          <textarea
            placeholder={disabled ? "Comments are disabled" : "Write a comment..."}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            rows={4}
            disabled={disabled || isSubmitting}
          ></textarea>
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  disabled={disabled || isSubmitting}
                />
                <div className={`relative w-11 h-6 bg-gray-200 rounded-full peer ${disabled ? 'opacity-50' : 'peer-focus:outline-hidden peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800'} dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600`}></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Anonymous
                </span>
              </label>
            </div>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || isSubmitting || !comment.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 