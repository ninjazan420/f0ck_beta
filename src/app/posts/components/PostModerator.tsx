'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { StatusBanner } from '@/components/StatusBanner';
import { useRouter } from 'next/navigation';

interface PostModeratorProps {
  postId: string;
}

export function PostModerator({ postId }: PostModeratorProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [commentsBlocked, setCommentsBlocked] = useState(false);
  const [showStatusBanner, setShowStatusBanner] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'default' | 'success'>('default');
  
  // Fetch post status on mount
  useEffect(() => {
    async function fetchPostStatus() {
      try {
        const response = await fetch(`/api/posts/${postId}/status`);
        if (response.ok) {
          const data = await response.json();
          setCommentsBlocked(!!data.commentsDisabled);
        }
      } catch (error) {
        console.error('Error fetching post status:', error);
      }
    }
    
    fetchPostStatus();
  }, [postId]);
  
  // Only show if user is a moderator or admin
  if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
    return null;
  }

  const handleDeletePost = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        setIsProcessing(true);
        const response = await fetch('/api/moderation/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            targetType: 'post',
            targetId: postId,
            reason: 'Moderation - Post deletion'
          })
        });
        
        if (response.ok) {
          console.log('Post successfully deleted!');
          // Show status banner
          setStatusMessage('Post was deleted');
          setStatusType('default');
          setShowStatusBanner(true);
          
          // If toast is available
          if (typeof toast !== 'undefined') {
            toast.success('Post was deleted');
          }
          
          // Redirect to posts page instead of homepage
          setTimeout(() => {
            router.push('/posts');
          }, 1500);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error deleting post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        if (typeof toast !== 'undefined') {
          toast.error('Error deleting post');
        } else {
          alert('Error deleting post');
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  const toggleCommentsBlocked = async () => {
    try {
      setIsProcessing(true);
      const action = commentsBlocked ? 'enableComments' : 'disableComments';
      const message = commentsBlocked ? 'Comments enabled' : 'Comments disabled';
      
      const response = await fetch('/api/moderation/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          targetType: 'post',
          targetId: postId,
          reason: `Moderation - ${message}`
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCommentsBlocked(!commentsBlocked);
        console.log(`Comments successfully ${commentsBlocked ? 'enabled' : 'disabled'}!`);
        
        // Show status banner
        setStatusMessage(message);
        setStatusType('success');
        setShowStatusBanner(true);
        
        if (typeof toast !== 'undefined') {
          toast.success(message);
        }
      } else {
        throw new Error(data.error || `Error ${commentsBlocked ? 'enabling' : 'disabling'} comments`);
      }
    } catch (error) {
      console.error(`Error ${commentsBlocked ? 'enabling' : 'disabling'} comments:`, error);
      
      if (typeof toast !== 'undefined') {
        toast.error(error instanceof Error ? error.message : 'An error occurred');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <StatusBanner 
        show={showStatusBanner} 
        message={statusMessage} 
        type={statusType} 
      />
      
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
              onClick={handleDeletePost}
              style={{ opacity: isProcessing ? 0.6 : 1, pointerEvents: isProcessing ? 'none' : 'auto' }}
          >
            <svg className="h-5 w-5" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line y2={17} y1={11} x2={10} x1={10} />
              <line y2={17} y1={11} x2={14} x1={14} />
            </svg>
            <p className="font-medium">Delete Post</p>
          </li>
        </ul>

        <ul className="border-t border-zinc-700/50">
          <li className="flex cursor-pointer items-center gap-3 px-4 py-2 text-purple-400 transition-all hover:bg-purple-500/20 hover:text-white"
              onClick={toggleCommentsBlocked}
              style={{ opacity: isProcessing ? 0.6 : 1, pointerEvents: isProcessing ? 'none' : 'auto' }}
          >
            <svg className="h-5 w-5" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle r={3} cy={12} cx={12} />
            </svg>
            <p className="font-medium">{commentsBlocked ? "Enable Comments" : "Block Comments"}</p>
          </li>
        </ul>
      </div>
    </>
  );
} 