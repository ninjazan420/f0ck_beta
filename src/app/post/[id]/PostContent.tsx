'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { PostTagEditor } from '@/app/posts/components/PostTagEditor';
import { PostModerator } from '@/app/posts/components/PostModerator';

export default function PostContent({ postData, postId }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(postData.stats?.likes || 0);
  const [favoriteCount, setFavoriteCount] = useState(postData.stats?.favorites || 0);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Konvertieren der Tags in das richtige Format
  const tagNames = Array.isArray(postData.tags) 
    ? postData.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
    : [];
    
  // Lade den Benutzer-Interaktionsstatus beim Laden der Komponente
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
        
        // Zeige eine Benachrichtigung an
        toast.success(liked ? 'Like entfernt' : 'Beitrag geliked');
        
        // Refresh page to update other components
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Fehler beim Aktualisieren des Likes');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFavorite = async () => {
    if (!session) {
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
        
        toast.success(favorited ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt');
        
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Fehler beim Aktualisieren der Favoriten');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Post-Inhalt */}
      <h1 className="text-2xl font-bold">{postData.title}</h1>
      
      {/* Interaktionsleiste über dem Bild */}
      <div className="my-2 flex items-center space-x-4">
        <button 
          onClick={handleLike}
          disabled={isProcessing}
          className={`flex items-center gap-1 ${liked ? 'text-blue-500' : 'text-gray-500'}`}
          aria-label={liked ? "Unlike post" : "Like post"}
        >
          <span className="text-lg">👍</span>
          <span>{likeCount}</span>
        </button>
        
        <button 
          onClick={handleFavorite}
          disabled={isProcessing}
          className={`flex items-center gap-1 ${favorited ? 'text-yellow-500' : 'text-gray-500'}`}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <span className="text-lg">⭐</span>
          <span>{favoriteCount}</span>
        </button>
        
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('URL kopiert');
          }}
          className="text-gray-500 flex items-center gap-1"
          aria-label="Copy link"
        >
          <span className="text-lg">🔗</span>
          <span>Teilen</span>
        </button>
      </div>
      
      {/* Bild */}
      <div className="my-4">
        <img 
          src={postData.imageUrl} 
          alt={postData.title} 
          className="max-w-full h-auto rounded-lg"
        />
      </div>
      
      {/* PostModerator-Komponente */}
      <PostModerator postId={postId} />
      
      {/* PostTagEditor-Komponente */}
      <PostTagEditor postId={postId} initialTags={tagNames} />
      
      {/* Weitere Post-Inhalte */}
    </>
  );
} 