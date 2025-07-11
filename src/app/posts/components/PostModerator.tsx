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
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isAd, setIsAd] = useState(false);
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
          console.log("Post status data received:", data); // Debug-Ausgabe
          setCommentsBlocked(!!data.commentsDisabled);
          setIsPinned(!!data.isPinned);
          setIsAd(!!data.isAd);
        }
        
        // Prüfen, ob dieser Post der featured post ist
        const featuredResponse = await fetch('/api/featured');
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          setIsFeatured(featuredData.featured?.id === parseInt(postId, 10));
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
        
        // Numerische ID in String umwandeln
        const postIdString = String(postId);
        
        const response = await fetch(`/api/moderation/posts/${postIdString}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason: 'Moderation - Post deletion'
          })
        });
        
        if (response.ok) {
          toast.success('Post was successfully deleted');
          setStatusMessage('Post was deleted');
          setStatusType('default');
          setShowStatusBanner(true);
          
          // Redirect to posts page
          setTimeout(() => {
            router.push('/posts');
          }, 1500);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error deleting post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Error deleting post');
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
      
      // Numerische ID in String umwandeln
      const postIdString = String(postId);
      
      const response = await fetch(`/api/posts/${postIdString}/comments-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disabled: !commentsBlocked,
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
  
  const toggleFeaturePost = async () => {
    try {
      setIsProcessing(true);
      const method = isFeatured ? 'DELETE' : 'POST';
      const message = isFeatured ? 'Post removed from homepage' : 'Post featured on homepage';
      
      // Numerische ID in String umwandeln
      const postIdString = String(postId);
      
      const response = await fetch('/api/moderation/feature', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: postIdString })
      });
      
      if (response.ok) {
        setIsFeatured(!isFeatured);
        
        // Show status banner
        setStatusMessage(message);
        setStatusType('success');
        setShowStatusBanner(true);
        
        if (typeof toast !== 'undefined') {
          toast.success(message);
        }
        
        // Aktualisiere die Startseite, falls sichtbar
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${isFeatured ? 'unfeaturing' : 'featuring'} post`);
      }
    } catch (error) {
      console.error(`Error ${isFeatured ? 'unfeaturing' : 'featuring'} post:`, error);
      
      if (typeof toast !== 'undefined') {
        toast.error(error instanceof Error ? error.message : 'An error occurred');
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const togglePinPost = async () => {
    try {
      setIsProcessing(true);
      const message = isPinned ? 'Post unpinned from posts page' : 'Post pinned to the top of posts page';
      
      // Numerische ID in String umwandeln
      const postIdString = String(postId);
      
      const response = await fetch(`/api/posts/${postIdString}/pin-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinned: !isPinned,
          reason: `Moderation - ${isPinned ? 'Unpin post' : 'Pin post'}`
        })
      });
      
      if (response.ok) {
        setIsPinned(!isPinned);
        
        // Show status banner
        setStatusMessage(message);
        setStatusType('success');
        setShowStatusBanner(true);
        
        if (typeof toast !== 'undefined') {
          toast.success(message);
        }
        
        // Aktualisiere die Seite, um die Änderungen zu sehen
        router.refresh();
        
        console.log("Pin status after toggle:", !isPinned);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${isPinned ? 'unpinning' : 'pinning'} post`);
      }
    } catch (error) {
      console.error(`Error ${isPinned ? 'unpinning' : 'pinning'} post:`, error);
      
      if (typeof toast !== 'undefined') {
        toast.error(error instanceof Error ? error.message : 'An error occurred');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAdStatus = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}/ad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isAd ? 'remove' : 'add'
        })
      });
      
      if (response.ok) {
        const message = isAd ? 'Post removed from ads' : 'Post marked as ad';
        
        // Optimistisches Update
        setIsAd(!isAd);
        
        // Show status banner
        setStatusMessage(message);
        setStatusType('success');
        setShowStatusBanner(true);
        
        if (typeof toast !== 'undefined') {
          toast.success(message);
        }
        
        // Aktualisiere die Seite, um die Änderungen zu sehen
        router.refresh();
        
        console.log("Ad status after toggle:", !isAd);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${isAd ? 'removing ad status from' : 'marking as ad'} post`);
      }
    } catch (error) {
      console.error(`Error ${isAd ? 'removing ad status from' : 'marking as ad'} post:`, error);
      
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
            <p className="font-medium text-sm">Delete Post</p>
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
            <p className="font-medium text-sm">{commentsBlocked ? "Enable Comments" : "Block Comments"}</p>
          </li>
          
          <li className="flex cursor-pointer items-center gap-3 px-4 py-2 text-blue-400 transition-all hover:bg-blue-500/20 hover:text-white"
              onClick={toggleFeaturePost}
              style={{ opacity: isProcessing ? 0.6 : 1, pointerEvents: isProcessing ? 'none' : 'auto' }}
          >
            <svg className="h-5 w-5" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
            </svg>
            <p className="font-medium text-sm">{isFeatured ? "Unfeature from Homepage" : "Feature on Homepage"}</p>
          </li>
          
          <li className="flex cursor-pointer items-center gap-3 px-4 py-2 text-amber-400 transition-all hover:bg-amber-500/20 hover:text-white"
              onClick={togglePinPost}
              style={{ opacity: isProcessing ? 0.6 : 1, pointerEvents: isProcessing ? 'none' : 'auto' }}
          >
            <svg className="h-5 w-5" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 10v10" />
              <path d="m12 10 4-4" />
              <path d="m12 10-4-4" />
              <path d="M4 4h16" />
            </svg>
            <p className="font-medium text-sm">{isPinned ? "Unpin Post" : "Pin this Post"}</p>
          </li>
          
          <li className="flex cursor-pointer items-center gap-3 px-4 py-2 text-purple-400 transition-all hover:bg-purple-500/20 hover:text-white"
              onClick={toggleAdStatus}
              style={{ opacity: isProcessing ? 0.6 : 1, pointerEvents: isProcessing ? 'none' : 'auto' }}
          >
            <svg className="h-5 w-5" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <p className="font-medium text-sm">{isAd ? "Remove AD Status" : "Mark as Advertising"}</p>
          </li>
        </ul>
      </div>
    </>
  );
}