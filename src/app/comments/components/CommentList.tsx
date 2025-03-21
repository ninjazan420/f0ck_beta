'use client';
import { useState, useEffect, useRef } from 'react';
import { Comment } from './Comment';
import { EmojiPicker } from '@/components/EmojiPicker';
import { GifSelector } from '@/components/GifSelector';
import Image from 'next/image';
import { ReactElement } from 'react';
import { useSession } from 'next-auth/react';
import { commentSocket } from '@/lib/websocket/commentSocket';
import { getImageUrlWithCacheBuster } from '@/lib/utils';

interface CommentData {
  id: string;
  user: {
    id: string | null;
    name: string;
    avatar: string | null;
    isAnonymous?: boolean;
    style?: {
      type: string;
      gradient: string[];
      animate: boolean;
    };
  };
  text: string;
  post: {
    id: string;
    title: string;
    imageUrl: string; // Stellen Sie sicher, dass dies immer gefüllt ist
    type: 'image' | 'video' | 'gif';
    nsfw?: boolean;
    numericId: string;
  };
  likes: number;
  createdAt: string;
  replyTo?: {
    id: string;
    user: {
      name: string;
      isAnonymous?: boolean;
    };
    preview: string;
  };
}

// Dummy-Daten für die Vorschau
const MOCK_COMMENTS: CommentData[] = Array.from({ length: 20 }, (_, i) => ({
  id: `comment-${i}`,
  user: {
    id: i % 3 === 0 ? null : `user${i % 5}`,
    name: i % 3 === 0 ? 'Anonymous' : `User${i % 5}`,
    avatar: null,
    isAnonymous: i % 3 === 0,
    style: i % 5 === 1 ? {
      type: 'gradient',
      gradient: ['purple-400', 'pink-600'],
      animate: true
    } : undefined
  },
  text: i % 3 === 0 
    ? "This is a longer comment that shows how multiple lines would look like in the comment section."
    : "Nice post!",
  post: {
    id: `${Math.floor(i / 4)}`,  // Deterministischer Post-ID
    title: `Amazing Artwork ${Math.floor(i / 4) + 1}`,
    imageUrl: `https://picsum.photos/seed/${i}/400/300`, // Deterministisches Bild mit seed
    type: 'image',
    nsfw: i % 3 === 0,
    numericId: `${Math.floor(i / 4)}`
  },
  likes: i * 5, // Deterministische Like-Anzahl
  createdAt: new Date(2024, 0, 1, 0, i * 30).toISOString(), // Deterministische Dates
  ...(i % 4 === 0 ? {
    replyTo: {
      id: `comment-${i-1}`,
      user: { 
        name: `User${((i-1) % 5) || 5}`,
        isAnonymous: (i-1) % 3 === 0
      },
      preview: "This is the original comment that was replied to..."
    }
  } : {})
}));

interface CommentListProps {
  postId?: string;
  initialPage?: number;
  limit?: number;
  status?: 'pending' | 'reported' | 'all' | 'approved';
  showModActions?: boolean;
  hideDuplicateButtons?: boolean;
  filters?: {
    username: string;
    searchText: string;
    dateFrom: string;
    dateTo: string;
    minLikes: number;
  };
  infiniteScroll?: boolean;
}

export function CommentList({ 
  postId, 
  initialPage = 1, 
  limit = 10,
  status = 'approved',
  showModActions = false,
  hideDuplicateButtons = false,
  filters,
  infiniteScroll = false
}: CommentListProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [displayedComments, setDisplayedComments] = useState<CommentData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifSelector, setShowGifSelector] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);
  const [showReplyGifSelector, setShowReplyGifSelector] = useState(false);
  const [selectedGif, setSelectedGif] = useState<{ url: string, source: string } | null>(null);
  const [selectedReplyGif, setSelectedReplyGif] = useState<{ url: string, source: string } | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const CHUNK_SIZE = 24;

  const handleEmojiSelect = (emoji: string, isReply = false) => {
    if (isReply || replyToId) {
      const textarea = document.querySelector('textarea[name="reply"]') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);
        setReplyText(before + emoji + after);
      }
      setShowReplyEmojiPicker(false);
    } else {
      const textarea = document.querySelector('textarea:not([name="reply"])') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);
        setNewComment(before + emoji + after);
      }
      setShowEmojiPicker(false);
    }
  };

  const handleGifSelect = (gifData: { url: string, id: string, source: string }, isReply = false) => {
    if (isReply || replyToId) {
      setSelectedReplyGif({ url: gifData.url, source: gifData.source });
      setShowReplyGifSelector(false);
    } else {
      setSelectedGif({ url: gifData.url, source: gifData.source });
      setShowGifSelector(false);
    }
  };

  const renderCommentContent = (text: string) => {
    if (!text) return null;
    
    // Einfacherer GIF-Platzhalter: [GIF:url]
    const gifRegex = /\[GIF:(https?:\/\/[^\]]+)\]/gi;
    
    // Verbesserte Regex für URL-Erkennung - erfasst mehr Bildformate und URLs
    const urlRegex = /(https?:\/\/[^\s]+\.(gif|png|jpg|jpeg|webp|bmp))(?:\?[^\s]*)?/gi;
    
    // Suche nach GIF-Platzhaltern und Standard-URLs
    const gifMatches = Array.from(text.matchAll(gifRegex) || []);
    const urlMatches = text.match(urlRegex) || [];
    
    // Wenn weder GIFs noch Bilder gefunden wurden, gib den Text zurück
    if (gifMatches.length === 0 && urlMatches.length === 0) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }
    
    // Ersetze GIF-Platzhalter und URLs mit Markierungen und teile den Text
    let processedText = text;
    
    // Ersetze zuerst GIF-Platzhalter
    processedText = processedText.replace(gifRegex, '\n[gif-media]\n');
    
    // Dann ersetze URL-Medien, aber nicht die, die bereits als GIF markiert sind
    const tempProcessedText = processedText;
    urlMatches.forEach(url => {
      // Prüfe, ob die URL bereits als GIF verarbeitet wurde
      if (!gifMatches.some(match => match[1] === url) && tempProcessedText.includes(url)) {
        processedText = processedText.replace(url, '\n[url-media]\n');
      }
    });
    
    const textParts = processedText.split('\n');
    const result: ReactElement[] = [];
    let gifIndex = 0;
    let urlIndex = 0;
    
    textParts.forEach((part, index) => {
      if (part === '[gif-media]') {
        if (gifIndex < gifMatches.length) {
          const match = gifMatches[gifIndex];
          const url = match[1];
          const isGiphy = url.includes('giphy.com');
          
          console.log(`Rendering GIF from placeholder: ${url}`);
          
          result.push(
            <div key={`gif-${index}`} className="my-2">
              <Image
                src={getImageUrlWithCacheBuster(url)}
                alt="GIF"
                width={400}
                height={300}
                className=""
                unoptimized
              />
              {isGiphy && (
                <div className="text-[10px] text-gray-400 dark:text-gray-500 opacity-50 mt-0.5 pl-1">
                  <Image 
                    src="/powered_by_giphy.png" 
                    alt="Powered by GIPHY" 
                    width={70} 
                    height={20}
                    unoptimized
                  />
                </div>
              )}
            </div>
          );
          gifIndex++;
        }
      } else if (part === '[url-media]') {
        if (urlIndex < urlMatches.length) {
          // Überspringe URLs, die bereits als GIFs verarbeitet wurden
          while (urlIndex < urlMatches.length && 
                 gifMatches.some(match => match[1] === urlMatches[urlIndex])) {
            urlIndex++;
          }
          
          if (urlIndex < urlMatches.length) {
            const url = urlMatches[urlIndex];
            const cleanUrl = url.split('?')[0];
            const isGiphy = cleanUrl.includes('giphy.com');
            
            console.log(`Rendering URL media: ${cleanUrl}`);
            
            result.push(
              <div key={`media-${index}`} className="my-2">
                <Image
                  src={getImageUrlWithCacheBuster(cleanUrl)}
                  alt="Embedded media"
                  width={400}
                  height={300}
                  className=""
                  unoptimized
                />
                {isGiphy && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 opacity-50 mt-0.5 pl-1">
                    <Image 
                      src="/powered_by_giphy.png" 
                      alt="Powered by GIPHY" 
                      width={150} 
                      height={22}
                      unoptimized
                    />
                  </div>
                )}
              </div>
            );
            urlIndex++;
          }
        }
      } else if (part.trim()) {
        result.push(<span key={`text-${index}`} className="whitespace-pre-wrap">{part}</span>);
      }
    });
    
    return result;
  };

  const fetchComments = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        ...(postId && { postId }),
        ...(filters?.username && { username: filters.username }),
        ...(filters?.searchText && { searchText: filters.searchText }),
        ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters?.dateTo && { dateTo: filters.dateTo }),
        ...(filters?.minLikes && filters.minLikes > 0 && { minLikes: filters.minLikes.toString() }),
        ...(session?.user?.role && ['moderator', 'admin'].includes(session.user.role) && { status: 'all' })
      });

      const response = await fetch(`/api/comments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch comments');

      const data = await response.json();
      
      const processedComments = data.comments.map((comment: any) => ({
        ...comment,
        id: comment._id || comment.id
      }));
      
      if (pageNum === 1) {
        setComments(processedComments);
      } else {
        setComments(prev => [...prev, ...processedComments]);
      }

      setHasMore(data.pagination.current < data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(initialPage);
  }, [initialPage, postId]);

  useEffect(() => {
    // Nur verbinden, wenn postId definiert ist
    if (!postId) return;
    
    // Vereinfache die Socket-ID - WICHTIG: Verwende eine einfache Zeichenkette als ID
    const socketId = `comments-${postId}`;
    
    // Korrekt: Trenne die vorherige Verbindung (falls vorhanden)
    commentSocket.unsubscribe(socketId);
    
    // Korrekt: Erstelle eine neue Verbindung mit einer separaten Callback-Funktion
    const handleCommentUpdate = (update: any) => {
      if (!update || typeof update !== 'object') return;
      
      // Sichere Verarbeitung von WebSocket-Updates
      if (update.type === 'new' && update.data) {
        setComments(prev => [update.data, ...prev]);
      } 
      else if (update.type === 'update' && update.data && update.commentId) {
        setComments(prev => prev.map(comment => 
          comment.id === update.commentId ? { ...comment, ...update.data } : comment
        ));
      }
      else if (update.type === 'delete' && update.commentId) {
        setComments(prev => prev.filter(comment => comment.id !== update.commentId));
      }
    };

    commentSocket.subscribe(socketId, handleCommentUpdate);

    return () => {
      commentSocket.unsubscribe(socketId);
    };
  }, [postId]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchComments(page + 1);
    }
  };

  const handleReport = async (commentId: string, reason: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          action: 'report',
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to report comment');
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error reporting comment:', error);
      throw error;
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!commentId) {
      console.error('Cannot delete comment with undefined ID');
      return Promise.reject(new Error('Comment ID is required'));
    }
    
    try {
      console.log(`Deleting comment with ID: ${commentId}`);
      
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to delete comment: ${errorText}`);
        return Promise.reject(new Error(`Failed to delete comment: ${response.status}`));
      }
      
      console.log('Comment deleted successfully');
      
      // Entferne den Kommentar aus der UI
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  const handleModDelete = async (commentId: string) => {
    if (!commentId) {
      console.error('Cannot delete comment with undefined ID');
      return Promise.reject(new Error('Comment ID is required for moderation delete'));
    }
    
    try {
      console.log(`Moderator deleting comment with ID: ${commentId}`);
      
      const response = await fetch(`/api/comments/${commentId}/modDelete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to delete comment as moderator: ${errorText}`);
        throw new Error('Failed to delete comment as moderator');
      }
      
      // Entferne den Kommentar aus der UI
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment as moderator:', error);
      throw error;
    }
  };

  const handleReply = async (parentId: string, content: string): Promise<any> => {
    if (!content.trim()) {
      return Promise.reject(new Error('Reply content cannot be empty'));
    }
    
    try {
      // Wenn kein Benutzer eingeloggt ist, muss isAnonymous auf true gesetzt sein
      const effectiveIsAnonymous = !session?.user ? true : isAnonymous;
      
      console.log('Posting reply with params:', { content, postId, replyTo: parentId, isAnonymous: effectiveIsAnonymous });
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          postId, // Dies könnte undefined sein, wenn auf der /comments-Seite
          replyTo: parentId,
          isAnonymous: effectiveIsAnonymous
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Reply error response:', errorData);
        throw new Error('Failed to post reply');
      }
      
      const savedReply = await response.json();
      
      // Füge den neuen Kommentar am Anfang der Liste hinzu
      setComments(prev => [savedReply, ...prev]);
    } catch (error) {
      console.error('Error posting reply:', error);
      throw error;
    }
  };

  const handleSubmitComment = async () => {
    if ((!newComment.trim() && !selectedGif) || loading) return;
    setLoading(true);
    
    try {
      let finalContent = newComment;
      if (selectedGif) {
        finalContent = finalContent.trim() + ` [GIF:${selectedGif.url}] `;
      }
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: finalContent,
          postId,
          isAnonymous
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to post comment: ${errorText}`);
        throw new Error('Failed to post comment');
      }

      const savedComment = await response.json();
      console.log('New comment saved:', savedComment);
      
      // Sicherstellen, dass der neue Kommentar eine ID hat
      const processedComment = {
        ...savedComment,
        id: savedComment._id || savedComment.id // Verwende _id, wenn id nicht definiert ist
      };
      
      // Füge den neuen Kommentar am Anfang der Liste hinzu
      setComments(prev => [processedComment, ...prev]);
      
      // Zurücksetzen des Formulars
      setNewComment('');
      setSelectedGif(null);
      setShowPreview(false);
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle anchor links to comments
  useEffect(() => {
    if (typeof window !== 'undefined' && comments.length > 0) {
      // Check if there's a hash in the URL
      const hash = window.location.hash;
      if (hash && hash.startsWith('#comment-')) {
        const commentId = hash.substring('#comment-'.length);
        
        // Check if the comment is loaded
        const targetComment = comments.find(comment => 
          comment.id === commentId || comment._id === commentId);
        
        if (targetComment) {
          // Scroll to the comment after a brief delay
          setTimeout(() => {
            const element = document.getElementById(`comment-${commentId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        } else if (hasMore) {
          // If we haven't found it but have more comments to load, load the next page
          setPage(prevPage => prevPage + 1);
          fetchComments(page + 1);
        }
      }
    }
  }, [comments, hasMore]);

  // Füge einen useEffect hinzu, der auf Filter-Änderungen reagiert
  useEffect(() => {
    // Reset Pagination und lade neue gefilterte Kommentare
    setPage(1);
    setComments([]);
    fetchComments(1);
  }, [filters]); // Abhängigkeit von filters hinzugefügt

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Liste der Kommentare */}
      <div className="space-y-4">
        {comments.map((comment, index) => {
          const uniqueId = `${comment.id || 'comment'}-${index}`;
          
          // Erweiterte Normalisierung des Kommentar-Objekts für die Comment-Komponente
          const commentData = {
            id: comment.id || uniqueId, // Sicherstellen, dass id immer gesetzt ist
            content: comment.content || comment.text || '', // Unterstützung für beide Feldnamen
            author: comment.author || {
              id: comment.user?.id || null,
              username: comment.user?.name || 'Anonymous',
              avatar: comment.user?.avatar || null
            },
            post: {
              // Stelle sicher, dass post.id korrekt ist
              id: comment.post?._id || comment.post?.id || 
                  (typeof comment.post === 'string' ? comment.post : '') || 
                  postId || '',
              title: comment.post?.title || '',
              // Numerische ID des Posts für die URL
              numericId: comment.post?.numericId || comment.post?.id || ''
            },
            status: comment.status || 'approved',
            createdAt: comment.createdAt || new Date().toISOString(),
            replyTo: comment.replyTo ? {
              id: comment.replyTo._id || comment.replyTo.id || '',
              author: {
                username: comment.replyTo.author?.username || comment.replyTo.user?.name || 'Anonymous'
              },
              content: comment.replyTo.content || comment.replyTo.text || ''
            } : undefined
          };
          
          return (
            <Comment
              key={`comment-${uniqueId}`}
              data={commentData}
              onReport={handleReport}
              onDelete={handleDelete}
              onReply={handleReply}
              onModDelete={showModActions ? handleModDelete : undefined}
            />
          );
        })}
      </div>

      {loading && (
        <div className="p-4 text-center text-gray-500">
          Loading comments...
        </div>
      )}

      {!loading && hasMore && (
        <button
          onClick={handleLoadMore}
          className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          Load more comments
        </button>
      )}

      {!loading && !hasMore && comments.length > 0 && (
        <div className="p-4 text-center text-gray-500">
          No more comments to load
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No comments yet
        </div>
      )}
    </div>
  );
}
