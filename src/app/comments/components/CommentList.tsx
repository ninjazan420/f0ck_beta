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
  const loaderRef = useRef<HTMLDivElement>(null);
  const CHUNK_SIZE = 24;

  const handleEmojiSelect = (emoji: string) => {
    if (replyToId) {
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

  const handleGifSelect = (gifUrl: string) => {
    const cleanGifUrl = gifUrl.split('?')[0];
    
    if (replyToId) {
      setReplyText(text => text.trim() + ' ' + cleanGifUrl + ' ');
      setShowReplyGifSelector(false);
    } else {
      setNewComment(text => text.trim() + ' ' + cleanGifUrl + ' ');
      setShowGifSelector(false);
    }
  };

  const renderCommentContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+\.(gif|png|jpg|jpeg))(?:\?[^\s]*)?/gi;
    const matches = text.match(urlRegex) || [];
    const textParts = text.replace(urlRegex, '\n[media]\n').split('\n');
    const result: ReactElement[] = [];
    let mediaIndex = 0;
    
    textParts.forEach((part, index) => {
      if (part === '[media]') {
        if (matches[mediaIndex]) {
          const cleanUrl = matches[mediaIndex].split('?')[0];
          const isGiphy = cleanUrl.includes('giphy.com');
          result.push(
            <div key={`media-${index}`} className="my-1">
              <Image
                src={cleanUrl}
                alt="Embedded media"
                width={300}
                height={300}
                className="rounded-lg"
                unoptimized
              />
              {isGiphy && (
                <div className="text-[10px] text-gray-400 dark:text-gray-500 opacity-50 mt-0.5 pl-1">
                  Powered by GIPHY
                </div>
              )}
            </div>
          );
          mediaIndex++;
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
      
      if (pageNum === 1) {
        setComments(data.comments);
      } else {
        setComments(prev => [...prev, ...data.comments]);
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
    try {
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          action: 'delete'
        })
      });

      if (!response.ok) throw new Error('Failed to delete comment');
      
      // Entferne den Kommentar aus der UI
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          postId,
          replyTo: commentId
        })
      });

      if (!response.ok) throw new Error('Failed to post reply');

      const newComment = await response.json();
      
      // Füge den neuen Kommentar am Anfang der Liste hinzu
      setComments(prev => [newComment, ...prev]);
    } catch (error) {
      console.error('Error posting reply:', error);
      throw error;
    }
  };

  const handleModAction = async (commentId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          action
        })
      });

      if (!response.ok) throw new Error('Failed to moderate comment');
      
      // Aktualisiere den Kommentar in der UI
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error moderating comment:', error);
      throw error;
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
          <div className="flex gap-2 mb-3">
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
            <label className="ml-auto flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-600 dark:text-gray-400">Post Anonymously</span>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-gray-200 dark:bg-gray-700 peer-checked:bg-purple-600 rounded-full transition-colors"></div>
                <div className="absolute left-[2px] top-[2px] w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-3"></div>
              </div>
            </label>
          </div>

          {showPreview ? (
            <div className="min-h-[100px] p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
              <div className="text-sm text-gray-800 dark:text-gray-200">
                {renderCommentContent(newComment) || <span className="text-gray-400 dark:text-gray-500">Nothing to preview</span>}
              </div>
            </div>
          ) : (
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none text-sm min-h-[100px]"
            />
          )}

          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500">
              {newComment.length}/500 characters
            </span>
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
                    onSelect={handleGifSelect}
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
                    onSelect={handleEmojiSelect}
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
                onClick={() => setNewComment('')}
                className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnonymous ? 'Post Anonymously' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview des Reply-Texts */}
      {replyText && (
        <div className="mt-2 p-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
          <div className="text-sm text-gray-800 dark:text-gray-200">
            {renderCommentContent(replyText)}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.map(comment => (
          <Comment
            key={comment.id}
            data={comment}
            onReport={handleReport}
            onDelete={handleDelete}
            onReply={handleReply}
            onModerate={showModActions ? handleModAction : undefined}
          />
        ))}
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
