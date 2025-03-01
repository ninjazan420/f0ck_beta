'use client';
import { useState, useEffect, ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EmojiPicker } from '@/components/EmojiPicker';
import { GifSelector } from '@/components/GifSelector';

const DEFAULT_AVATAR = '/images/defaultavatar.png';

interface Comment {
  id: string;
  user: {      
    id: string | null;
    name: string;
    avatar: string | null;
    isAnonymous?: boolean;
    style?: { type: string; color?: string; gradient?: string[]; animate?: boolean };
  };
  text: string;
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

interface PostCommentsProps {
  postId: string;
}

export function PostComments({ postId }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifSelector, setShowGifSelector] = useState(false);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);
  const [showReplyGifSelector, setShowReplyGifSelector] = useState(false);

  // Hilfsfunktionen aus der Comment-Komponente
  const getUserUrl = (username: string) => `/user/${username.toLowerCase()}`;
  const getNickStyle = (style?: { type: string; color?: string; gradient?: string[]; animate?: boolean }) => {
    if (!style) return '';
    
    switch(style.type) {
      case 'solid':
        return `text-${style.color}`;
      case 'gradient':
        return `bg-gradient-to-r from-${style.gradient?.[0]} to-${style.gradient?.[1]} bg-clip-text text-transparent`;
      case 'animated':
        return `animate-pulse bg-gradient-to-r from-${style.gradient?.[0]} to-${style.gradient?.[1]} bg-clip-text text-transparent`;
      default:
        return '';
    }
  };

  const getAvatarStyle = (style?: { type: string; color?: string; gradient?: string[]; animate?: boolean }) => {
    if (!style) return '';
    
    switch(style.type) {
      case 'solid':
        return `ring-2 ring-${style.color}`;
      case 'gradient':
        return `ring-2 bg-gradient-to-r from-${style.gradient?.[0]} to-${style.gradient?.[1]} ring-purple-400`;
      case 'animated':
        return `ring-2 bg-gradient-to-r from-${style.gradient?.[0]} to-${style.gradient?.[1]} ring-purple-400 animate-pulse`;
      default:
        return '';
    }
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return;
    
    // Mock: Füge die Antwort als neuen Kommentar hinzu
    const mockReply: Comment = {
      id: `comment-${Date.now()}`,
      user: {
        id: 'current-user',
        name: 'CurrentUser',
        avatar: null,
        style: {
          type: 'gradient',
          gradient: ['purple-400', 'pink-600'],
          animate: true
        }
      },
      text: replyText,
      likes: 0,
      createdAt: new Date().toISOString(),
      replyTo: {
        id: commentId,
        user: {
          name: comments.find(c => c.id === commentId)?.user.name || '',
          isAnonymous: comments.find(c => c.id === commentId)?.user.isAnonymous
        },
        preview: comments.find(c => c.id === commentId)?.text.substring(0, 100) || ''
      }
    };

    setComments([mockReply, ...comments]);
    setReplyText('');
    setReplyToId(null);
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    // Hier würde die API-Logik zum Speichern implementiert
    console.log(`New comment for post ${postId}: ${newComment}`);
    
    // Mock: Füge den Kommentar temporär hinzu
    const mockNewComment: Comment = {
      id: `comment-${Date.now()}`,
      user: {
        id: 'current-user',
        name: 'CurrentUser',
        avatar: null,
        style: {
          type: 'gradient',
          gradient: ['purple-400', 'pink-600'],
          animate: true
        }
      },
      text: newComment,
      likes: 0,
      createdAt: new Date().toISOString()
    };

    setComments([mockNewComment, ...comments]);
    setNewComment('');
  };

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
    // Entferne die zusätzlichen Parameter aus der GIF-URL
    const cleanGifUrl = gifUrl.split('?')[0];
    
    if (replyToId) {
      setReplyText(text => text.trim() + ' ' + cleanGifUrl + ' ');
      setShowReplyGifSelector(false);
    } else {
      setNewComment(text => text.trim() + ' ' + cleanGifUrl + ' ');
      setShowGifSelector(false);
    }
  };

  // Neue Funktion zum Parsen von Text und Umwandeln von URLs in Bilder
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

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock-Kommentare mit Premium-Styles
      const mockComments: Comment[] = Array.from({ length: 5 }, (_, i) => ({
        id: `comment-${i + 1}`,
        user: {
          id: i % 3 === 0 ? null : `user${i}`,
          name: i % 3 === 0 ? 'Anonymous' : `User${i}`,
          avatar: null,
          isAnonymous: i % 3 === 0,
          // Premium Style für jeden zweiten nicht-anonymen User
          style: i % 3 !== 0 && i % 2 === 0 ? {
            type: 'gradient',
            gradient: ['purple-400', 'pink-600'],
            animate: true
          } : undefined
        },
        text: `This is a sample comment ${i + 1} for post ${postId}`,
        likes: Math.floor(Math.random() * 50),
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
        ...(i % 2 === 0 ? {
          replyTo: {
            id: `comment-${i-1}`,
            user: {
              name: `User${i-1}`,
              isAnonymous: false
            },
            preview: "Previous comment text..."
          }
        } : {})
      }));

      setComments(mockComments);
      setLoading(false);
    };

    fetchComments();
  }, [postId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-100">
        Comments ({comments.length})
      </h2>

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
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {newComment || <span className="text-gray-400 dark:text-gray-500">Nothing to preview</span>}
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
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnonymous ? 'Post Anonymously' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 rounded-xl bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800"
          >
            {/* Kommentar Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className={`relative w-8 h-8 rounded-full overflow-hidden ${getAvatarStyle(comment.user.style)}`}>
                <Image
                  src={comment.user.avatar || DEFAULT_AVATAR}
                  alt={comment.user.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1">
                {comment.user.isAnonymous ? (
                  <span className="text-sm text-gray-600 dark:text-gray-400">Anonymous</span>
                ) : (
                  <>
                    <Link
                      href={getUserUrl(comment.user.name)}
                      className={`text-sm font-medium hover:underline ${getNickStyle(comment.user.style)}`}
                    >
                      {comment.user.name}
                    </Link>
                    {comment.user.style && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/40 text-white border border-purple-500/50">
                        PREMIUM
                      </span>
                    )}
                  </>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span title={new Date(comment.createdAt).toLocaleString()}>
                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(comment.createdAt).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Antwort-Vorschau */}
            {comment.replyTo && (
              <div className="mb-3 pl-4 border-l-2 border-purple-200 dark:border-purple-800/30 bg-purple-50/30 dark:bg-purple-900/10 rounded-r-lg py-2">
                <Link href={`/comments/${comment.replyTo.id}`} className="block hover:bg-purple-50/50 dark:hover:bg-purple-900/20 rounded transition-colors">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Reply to{' '}
                    {comment.replyTo.user.isAnonymous ? (
                      <span className="text-gray-600 dark:text-gray-400">Anonymous</span>
                    ) : (
                      <span className="text-purple-600 hover:underline cursor-pointer" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (comment.replyTo?.user?.name) {
                                window.location.href = getUserUrl(comment.replyTo.user.name);
                              }
                            }}>
                        {comment.replyTo.user.name}
                      </span>
                    )}:
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 font-[family-name:var(--font-geist-sans)] line-clamp-1">
                    {comment.replyTo.preview}
                  </div>
                </Link>
              </div>
            )}

            {/* Kommentar-Text mit Bild-Rendering */}
            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {renderCommentContent(comment.text)}
            </div>

            {/* Kommentar Footer */}
            <div className="mt-3 flex items-center gap-4">
              <button className="text-sm text-gray-500 hover:text-purple-500 transition-colors flex items-center gap-1">
                <span className="text-base">❤️</span> {comment.likes}
              </button>
              <button
                onClick={() => setReplyToId(comment.id)}
                className="text-sm text-gray-500 hover:text-purple-500 transition-colors flex items-center gap-1"
              >
                <span className="text-base">💬</span> Reply
              </button>
            </div>

            {/* Antwort-Textfeld */}
            {replyToId === comment.id && (
              <div className="mt-4 space-y-2">
                <textarea
                  name="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.user.name}...`}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none text-sm"
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {replyText.length}/500 characters
                  </span>
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
                          onSelect={handleGifSelect}
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
                          onSelect={handleEmojiSelect}
                          onClose={() => setShowReplyEmojiPicker(false)}
                        />
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setReplyToId(null);
                        setReplyText('');
                      }}
                      className="px-3 py-1 rounded-lg text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(comment.id)}
                      disabled={!replyText.trim()}
                      className="px-3 py-1 rounded-lg text-sm text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                </div>
                {replyText && (
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    {renderCommentContent(replyText)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
