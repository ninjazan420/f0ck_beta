'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    // Hier würde die API-Logik implementiert
    console.log(`Replying to comment ${commentId}: ${replyText}`);
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
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            🎨 GIF
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            😊 Emoji
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
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnonymous ? 'Post Anonymously' : 'Post Comment'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
            {/* Reply Preview */}
            {comment.replyTo && (
              <div className="mb-3 pl-4 border-l-2 border-purple-200 dark:border-purple-800/30 bg-purple-50/30 dark:bg-purple-900/10 rounded-r-lg py-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Reply to{' '}
                  {comment.replyTo.user.isAnonymous ? (
                    <span className="text-gray-600 dark:text-gray-400">Anonymous</span>
                  ) : (
                    <Link href={getUserUrl(comment.replyTo.user.name)} className="text-purple-600 hover:underline">
                      {comment.replyTo.user.name}
                    </Link>
                  )}:
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-[family-name:var(--font-geist-sans)] line-clamp-1">
                  {comment.replyTo.preview}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {/* Avatar */}
              {comment.user.isAnonymous ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    ANON
                  </div>
                </div>
              ) : (
                <Link href={getUserUrl(comment.user.name)} className="block">
                  <div className={`w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0 
                    transition-all duration-300
                    ${comment.user.style ? getAvatarStyle(comment.user.style) : 'hover:ring-2 hover:ring-purple-400 dark:hover:ring-purple-600'}`}
                  >
                    {comment.user.avatar ? (
                      <Image 
                        src={comment.user.avatar}
                        alt={`${comment.user.name}'s avatar`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {comment.user.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </Link>
              )}

              {/* Comment Content */}
              <div className="flex-grow">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div className="flex items-center gap-2">
                    {comment.user.isAnonymous ? (
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        Anonymous
                      </span>
                    ) : (
                      <>
                        <Link
                          href={getUserUrl(comment.user.name)}
                          className={`font-medium hover:opacity-80 transition-opacity ${getNickStyle(comment.user.style)}`}
                        >
                          {comment.user.name}
                        </Link>
                        {comment.user.style && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/40 text-white border border-purple-500/50">
                            PREMIUM
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 font-[family-name:var(--font-geist-sans)]">
                  {comment.text}
                </p>

                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <button className="hover:text-purple-600 dark:hover:text-purple-400">
                    ❤️ {comment.likes}
                  </button>
                  <button 
                    onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                    className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
                  >
                    💬 Reply
                  </button>
                </div>

                {/* Reply Box */}
                {replyToId === comment.id && (
                  <div className="mt-4 space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.user.name}...`}
                      className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none text-sm"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReplyToId(null)}
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
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
