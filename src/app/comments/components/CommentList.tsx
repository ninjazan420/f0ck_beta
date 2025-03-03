'use client';
import { useState, useEffect, useRef } from 'react';
import { Comment } from './Comment';
import { EmojiPicker } from '@/components/EmojiPicker';
import { GifSelector } from '@/components/GifSelector';
import Image from 'next/image';
import { ReactElement } from 'react';
import { useSession } from 'next-auth/react';
import { commentSocket } from '@/lib/websocket/commentSocket';

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
    nsfw: i % 3 === 0
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
}

export function CommentList({ 
  postId, 
  initialPage = 1, 
  limit = 10,
  status = 'approved',
  showModActions = false 
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
                src={url}
                alt="GIF"
                width={400}
                height={300}
                className=""
                unoptimized
              />
              {isGiphy && (
                <div className="text-[10px] text-gray-400 dark:text-gray-500 opacity-50 mt-0.5 pl-1">
                  Powered by GIPHY
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
                  src={cleanUrl}
                  alt="Embedded media"
                  width={400}
                  height={300}
                  className=""
                  unoptimized
                />
                {isGiphy && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 opacity-50 mt-0.5 pl-1">
                    Powered by GIPHY
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
        // Moderatoren und Admins können alle Kommentare sehen
        ...(session?.user?.role && ['moderator', 'admin'].includes(session.user.role) && { status: 'all' })
      });

      const response = await fetch(`/api/comments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch comments');

      const data = await response.json();
      
      // Stellen Sie sicher, dass jeder Kommentar eine korrekte ID hat
      const processedComments = data.comments.map((comment: any) => ({
        ...comment,
        id: comment._id || comment.id // Verwende _id, wenn id nicht definiert ist
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
    // WebSocket-Verbindung aufbauen
    const socketId = `comments-${postId || 'all'}-${status}`;
    commentSocket.subscribe(socketId, handleCommentUpdate);

    return () => {
      commentSocket.unsubscribe(socketId);
    };
  }, [postId, status]);

  const handleCommentUpdate = (update: { type: string; commentId: string; data?: any }) => {
    switch (update.type) {
      case 'new':
        if (update.data) {
          setComments(prev => [update.data, ...prev]);
        }
        break;
      case 'update':
        if (update.data) {
          setComments(prev => prev.map(comment => 
            comment.id === update.commentId ? { ...comment, ...update.data } : comment
          ));
        }
        break;
      case 'delete':
        setComments(prev => prev.filter(comment => comment.id !== update.commentId));
        break;
    }
  };

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

      if (!response.ok) throw new Error('Failed to report comment');
      
      // Optional: Aktualisiere den Kommentar in der UI
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                reports: [...(comment.reports || []), {
                  user: session?.user?.id,
                  reason,
                  createdAt: new Date().toISOString()
                }]
              }
            : comment
        )
      );
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
      return Promise.reject(error);
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    if (!commentId) {
      console.error('Cannot reply to comment with undefined ID');
      return Promise.reject(new Error('Comment ID is required for reply'));
    }
    
    try {
      console.log(`Replying to comment with ID: ${commentId}`);
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          postId,
          replyTo: commentId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to post reply: ${errorText}`);
        throw new Error('Failed to post reply');
      }

      const newComment = await response.json();
      
      // Sicherstellen, dass der neue Kommentar eine ID hat
      const processedComment = {
        ...newComment,
        id: newComment._id || newComment.id // Verwende _id, wenn id nicht definiert ist
      };
      
      // Füge den neuen Kommentar am Anfang der Liste hinzu
      setComments(prev => [processedComment, ...prev]);
    } catch (error) {
      console.error('Error posting reply:', error);
      throw error;
    }
  };

  const handleModAction = async (commentId: string, action: 'approve' | 'reject') => {
    if (!commentId) {
      console.error('Cannot moderate comment with undefined ID');
      return Promise.reject(new Error('Comment ID is required for moderation'));
    }
    
    try {
      console.log(`Moderating comment with ID: ${commentId}, action: ${action}`);
      
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          action
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to moderate comment: ${errorText}`);
        throw new Error('Failed to moderate comment');
      }
      
      // Aktualisiere den Kommentar in der UI
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error moderating comment:', error);
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

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Neue Kommentar-Box */}
      {!showModActions && (
        <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <div className="flex gap-2 mb-3 justify-between">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showPreview 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Post Anonymously
              </span>
            </label>
          </div>
          
          {showPreview ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 min-h-[100px] mb-3">
              {renderCommentContent(newComment)}
            </div>
          ) : (
            <textarea
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                if (e.target.value === '' && selectedGif) {
                  setSelectedGif(null);
                }
              }}
              placeholder="Write a comment..."
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none text-sm"
              rows={5}
            />
          )}
          
          {selectedGif && (
            <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 bg-white/20 dark:bg-gray-800/20 rounded-lg">
              <div className="relative">
                <button 
                  onClick={() => setSelectedGif(null)}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/90"
                  title="Remove GIF"
                >
                  ×
                </button>
                <div className="my-2">
                  <Image
                    src={selectedGif.url}
                    alt="Selected GIF"
                    width={400}
                    height={300}
                    className=""
                    unoptimized
                  />
                  {selectedGif.source === 'giphy' && (
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 opacity-50 mt-0.5 pl-1">
                      Powered by GIPHY
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1 text-center">
                Dieses GIF wird mit Ihrem Kommentar gesendet.
              </div>
            </div>
          )}
          
          <div className="mt-3 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {newComment.length}/500 characters
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowGifSelector(!showGifSelector);
                    setShowEmojiPicker(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Add GIF"
                >
                  🎨 GIF
                </button>
                {showGifSelector && (
                  <GifSelector
                    onSelect={(gifData) => handleGifSelect(gifData)}
                    onClose={() => setShowGifSelector(false)}
                  />
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowGifSelector(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Add emoji"
                >
                  😊 Emoji
                </button>
                {showEmojiPicker && (
                  <EmojiPicker
                    onSelect={(emoji) => handleEmojiSelect(emoji)}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
              </div>
              <button
                onClick={() => setNewComment('')}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={(!newComment.trim() && !selectedGif) || loading}
                className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  isAnonymous ? 'Post Anonymously' : 'Post Comment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Antwortsektion (wenn aktiv) */}
      {replyToId && (
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reply to comment
            </h3>
            <button 
              onClick={() => setReplyToId(null)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
          
          <textarea
            name="reply"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none text-sm"
            rows={3}
          />
          
          <div className="mt-3 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {replyText.length}/500 characters
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyGifSelector(!showReplyGifSelector);
                    setShowReplyEmojiPicker(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Add GIF"
                >
                  🎨 GIF
                </button>
                {showReplyGifSelector && (
                  <GifSelector
                    onSelect={(url) => handleGifSelect(url, true)}
                    onClose={() => setShowReplyGifSelector(false)}
                  />
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyEmojiPicker(!showReplyEmojiPicker);
                    setShowReplyGifSelector(false);
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Add emoji"
                >
                  😊 Emoji
                </button>
                {showReplyEmojiPicker && (
                  <EmojiPicker
                    onSelect={(emoji) => handleEmojiSelect(emoji, true)}
                    onClose={() => setShowReplyEmojiPicker(false)}
                  />
                )}
              </div>
              <button
                onClick={() => {
                  setReplyText('');
                  setReplyToId(null);
                }}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReply(replyToId!, replyText)}
                disabled={!replyText.trim() || loading}
                className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : 'Reply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kommentarliste */}
      <div className="space-y-4">
        {comments.map((comment, index) => {
          // Fallback-ID für Kommentare ohne ID verwenden
          const uniqueId = comment.id || `comment-fallback-${index}`;
          
          // Sicherstellen, dass alle erforderlichen Felder vorhanden sind
          const commentData = {
            ...comment,
            id: comment.id || uniqueId, // Sicherstellen, dass id immer gesetzt ist
            content: comment.content || comment.text || '', // Unterstützung für beide Feldnamen
            author: comment.author || {
              id: comment.user?.id || null,
              username: comment.user?.name || 'Anonymous',
              avatar: comment.user?.avatar || null
            },
            post: comment.post || { id: postId || '', title: '' },
            status: comment.status || 'approved',
            createdAt: comment.createdAt || new Date().toISOString()
          };
          
          return (
            <Comment
              key={`comment-${uniqueId}`}
              data={commentData}
              onReport={handleReport}
              onDelete={handleDelete}
              onReply={handleReply}
              onModerate={showModActions ? handleModAction : undefined}
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
