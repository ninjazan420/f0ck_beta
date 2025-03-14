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
      // Aktuellen Zustand sichern
      const currentLiked = liked;
      const currentCount = likeCount;
      
      // UI optimistisch aktualisieren
      setLiked(!liked);
      setLikeCount(prev => prev + (liked ? -1 : 1));
      
      const method = liked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${postId}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Daten aus der Antwort lesen
        const data = await response.json();
        
        // Server-Zustand übernehmen
        setLiked(data.liked);
        setLikeCount(data.likeCount);
        
        // Feedback zeigen
        const message = data.message || (liked ? 'Like entfernt' : 'Beitrag geliked');
        toast.success(message);
        
        // Aktualisiere die Seite
        router.refresh();
      } else {
        // Bei Fehler alten Zustand wiederherstellen
        setLiked(currentLiked);
        setLikeCount(currentCount);
        
        // Fehlermeldung zeigen
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || 'Fehler bei der Aktualisierung des Likes');
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
      // Aktuellen Wert für die Wiederherstellung im Fehlerfall speichern
      const currentFavorited = favorited;
      const currentCount = favoriteCount;
      
      // Optimistisches UI-Update
      setFavorited(!favorited);
      setFavoriteCount(favoriteCount + (favorited ? -1 : 1));
      
      console.log('Sending favorite request:', {
        method: favorited ? 'DELETE' : 'POST',
        url: `/api/posts/${postId}/favorite`
      });
      
      const method = favorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${postId}/favorite`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Favorite response status:', response.status);
      const responseText = await response.text();
      console.log('Favorite response text:', responseText);
      
      if (response.ok) {
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse response JSON:', e);
          data = { favorited: !favorited, favoriteCount: favoriteCount + (favorited ? -1 : 1) };
        }
        
        console.log('Parsed favorite response:', data);
        setFavorited(data.favorited);
        setFavoriteCount(data.favoriteCount || data.favoritesCount);
        
        toast.success(favorited ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt');
        
        router.refresh();
      } else {
        // Bei Fehler zurück zum vorherigen Zustand
        setFavorited(currentFavorited);
        setFavoriteCount(currentCount);
        let error;
        try {
          error = JSON.parse(responseText);
        } catch (e) {
          error = { message: 'Failed to update favorites' };
        }
        throw new Error(error.message || 'Failed to update favorites');
      }
    } catch (error) {
      // Bei Ausnahme zurück zum vorherigen Zustand
      setFavorited(currentFavorited);
      setFavoriteCount(currentCount);
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