'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { deletePostAndCleanupReferences } from '@/lib/moderation';

interface ModActionsPanelProps {
  post: {
    _id: string;
    isAd?: boolean;
  };
}

export function ModActionsPanel({ post }: ModActionsPanelProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      setIsDeleting(true);
      try {
        const result = await deletePostAndCleanupReferences(post._id, 'Moderation - Post deletion');
        
        if (result.success) {
          toast.success('Post deleted successfully');
          router.push('/');
        } else {
          throw new Error(result.error || 'Error deleting post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Error deleting post');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleAd = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/posts/${post._id}/ad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: post.isAd ? 'remove' : 'add'
        })
      });
      
      if (response.ok) {
        const message = post.isAd ? 'Post removed from ads' : 'Post marked as ad';
        toast.success(message);
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error updating ad status');
      }
    } catch (error) {
      console.error('Error updating ad status:', error);
      toast.error('Error updating AD status');
    } finally {
      setIsProcessing(false);
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
        <li className="flex cursor-pointer items-center gap-3 px-4 py-2 text-zinc-400 transition-all hover:bg-red-500/20 hover:text-white"
            onClick={handleDelete}
            style={{ opacity: isDeleting ? 0.6 : 1, pointerEvents: isDeleting ? 'none' : 'auto' }}
        >
          <svg className="h-5 w-5" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line y2={17} y1={11} x2={10} x1={10} />
            <line y2={17} y1={11} x2={14} x1={14} />
          </svg>
          <p className="font-medium text-sm">Delete Post</p>
        </li>
        
        <li className="flex cursor-pointer items-center gap-3 px-4 py-2 text-purple-400 transition-all hover:bg-purple-500/20 hover:text-white"
            onClick={handleToggleAd}
            style={{ opacity: isProcessing ? 0.6 : 1, pointerEvents: isProcessing ? 'none' : 'auto' }}
        >
          <svg className="h-5 w-5" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <p className="font-medium text-sm">{post.isAd ? "Remove AD Status" : "Mark as AD"}</p>
        </li>
      </ul>
    </div>
  );
}