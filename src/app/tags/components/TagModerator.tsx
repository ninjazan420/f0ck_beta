'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface TagModeratorProps {
  tagId: string;
  tagName: string;
}

export function TagModerator({ tagId, tagName }: TagModeratorProps) {
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Only show if user is a moderator or admin
  if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
    return null;
  }

  const handleDeleteTag = async () => {
    if (confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
      try {
        setIsProcessing(true);
        const response = await fetch('/api/moderation/tags', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tagId,
            reason: 'Moderation - Tag deletion'
          })
        });
        
        if (response.ok) {
          console.log('Tag successfully deleted!');
          if (typeof toast !== 'undefined') {
            toast.success('Tag has been deleted');
          }
          // Return to tags overview
          window.location.href = '/tags';
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error deleting tag');
        }
      } catch (error) {
        console.error('Error deleting tag:', error);
        if (typeof toast !== 'undefined') {
          toast.error(error instanceof Error ? error.message : 'An error occurred');
        } else {
          alert('Error deleting tag');
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 to-zinc-900/90 shadow-md">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-zinc-100">
          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
            <path d="M12 7v6l3 3"/>
          </svg>
          <h3 className="font-medium">Moderator Tools</h3>
        </div>
      </div>

      <ul className="border-t border-zinc-700/50">
        <li className="border-b border-zinc-700/50 last:border-b-0">
          <button 
            onClick={handleDeleteTag}
            disabled={isProcessing}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            {isProcessing ? 'Deleting...' : 'Delete Tag'}
          </button>
        </li>
      </ul>
    </div>
  );
} 