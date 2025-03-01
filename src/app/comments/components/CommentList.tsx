'use client';
import { useState, useEffect, useRef } from 'react';
import { Comment } from './Comment';
import { EmojiPicker } from '@/components/EmojiPicker';
import { GifSelector } from '@/components/GifSelector';
import Image from 'next/image';
import { ReactElement } from 'react';

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
  filters: {
    username: string;
    searchText: string;
    dateFrom: string;
    dateTo: string;
    minLikes: number;
  };
  infiniteScroll: boolean;
}

export function CommentList({ filters, infiniteScroll }: CommentListProps) {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
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
          result.push(
            <div key={`media-${index}`} className="my-2 relative w-[300px] aspect-square">
              <Image
                src={cleanUrl}
                alt="Embedded media"
                fill
                className="object-contain rounded-lg"
                unoptimized
              />
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

  // Simuliere API-Call mit Pagination
  const fetchComments = async (pageNum: number, filters: CommentListProps['filters']) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const startIndex = (pageNum - 1) * CHUNK_SIZE;
    const filteredComments = MOCK_COMMENTS.filter(comment => {
      if (filters.username && !comment.user.name.toLowerCase().includes(filters.username.toLowerCase())) return false;
      if (filters.searchText && !comment.text.toLowerCase().includes(filters.searchText.toLowerCase())) return false;
      if (filters.minLikes && comment.likes < filters.minLikes) return false;
      if (filters.dateFrom && new Date(comment.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(comment.createdAt) > new Date(filters.dateTo)) return false;
      return true;
    });

    const chunk = filteredComments.slice(startIndex, startIndex + CHUNK_SIZE);
    const hasMoreComments = startIndex + CHUNK_SIZE < filteredComments.length;

    setIsLoading(false);
    return { comments: chunk, hasMore: hasMoreComments };
  };

  // Handle infinite scroll
  useEffect(() => {
    if (!infiniteScroll || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore) {
          const nextPage = Math.floor(displayedComments.length / CHUNK_SIZE) + 1;
          const { comments, hasMore: more } = await fetchComments(nextPage, filters);
          
          setDisplayedComments(prev => [...prev, ...comments]);
          setHasMore(more);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [infiniteScroll, hasMore, isLoading, displayedComments.length, filters]);

  // Reset and load initial comments when filters or scroll mode changes
  useEffect(() => {
    const loadInitial = async () => {
      const { comments, hasMore } = await fetchComments(1, filters);
      setDisplayedComments(comments);
      setHasMore(hasMore);
      setPage(1);
    };

    loadInitial();
  }, [filters, infiniteScroll]);

  // Handle manual pagination
  const handlePageChange = async (newPage: number) => {
    const { comments, hasMore } = await fetchComments(newPage, filters);
    setDisplayedComments(comments);
    setHasMore(hasMore);
    setPage(newPage);
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    
    // Mock-Kommentar erstellen
    const mockNewComment: CommentData = {
      id: `comment-${Date.now()}`,
      user: {
        id: isAnonymous ? null : 'current-user',
        name: isAnonymous ? 'Anonymous' : 'CurrentUser',
        avatar: null,
        isAnonymous: isAnonymous,
        style: !isAnonymous ? {
          type: 'gradient',
          gradient: ['purple-400', 'pink-600'],
          animate: true
        } : undefined
      },
      text: newComment,
      post: {
        id: 'current-post',
        title: 'Current Post',
        imageUrl: '/images/defaultpost.png',
        type: 'image'
      },
      likes: 0,
      createdAt: new Date().toISOString()
    };

    // Kommentar zur Liste hinzufügen
    setDisplayedComments(prev => [mockNewComment, ...prev]);
    setNewComment('');
  };

  return (
    <div className="space-y-4">
      {/* Neue Kommentar-Box */}
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
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnonymous ? 'Post Anonymously' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview des Reply-Texts */}
      {replyText && (
        <div className="mt-2 p-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
          <div className="text-sm text-gray-800 dark:text-gray-200">
            {renderCommentContent(replyText)}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {displayedComments.map(comment => (
          <Comment key={comment.id} data={comment} />
        ))}
      </div>

      {infiniteScroll ? (
        hasMore && (
          <div ref={loaderRef} className="w-full h-20 flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            ) : (
              <div className="text-sm text-gray-500">Scroll for more</div>
            )}
          </div>
        )
      ) : (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            Page {page}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasMore || isLoading}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
