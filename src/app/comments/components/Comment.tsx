'use client';

import { useState, ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EmojiPicker } from '@/components/EmojiPicker';
import { GifSelector } from '@/components/GifSelector';

const DEFAULT_AVATAR = '/images/defaultavatar.png';

interface CommentProps {
  data: {
    id: string;
    user: {      
      id: string | null;  // null für anonyme User
      name: string;
      avatar: string | null;
      isAnonymous?: boolean;  // Neues Flag für anonyme Kommentare
      style?: { type: string; color?: string; gradient?: string[]; animate?: boolean }; // Neues Feld für Stil
    };
    text: string;
    post: {
      id: string;
      title: string;
      imageUrl: string;  // Direkte URL vom Post
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
  };
}

export function Comment({ data }: CommentProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showGifSelector, setShowGifSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const formattedDate = new Date(data.createdAt).toLocaleString();

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

  const handleReply = () => {
    if (!replyText.trim()) return;
    
    // Hier würde die API-Logik für das Senden der Antwort implementiert
    console.log(`Replying to comment ${data.id}: ${replyText}`);
    setReplyText('');
    setShowReplyBox(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      setReplyText(before + emoji + after);
    }
    setShowEmojiPicker(false);
  };

  const handleGifSelect = (gifUrl: string) => {
    const cleanGifUrl = gifUrl.split('?')[0];
    setReplyText(text => text.trim() + ' ' + cleanGifUrl + ' ');
    setShowGifSelector(false);
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

  return (
    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      {/* Reply Preview */}
      {data.replyTo && (
        <div className="mb-3 pl-4 border-l-2 border-purple-200 dark:border-purple-800/30 bg-purple-50/30 dark:bg-purple-900/10 rounded-r-lg py-2">
          <Link href={`/comments/${data.replyTo.id}`} className="block hover:bg-purple-50/50 dark:hover:bg-purple-900/20 rounded transition-colors">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Reply to{' '}
              {data.replyTo.user.isAnonymous ? (
                <span className="text-gray-600 dark:text-gray-400">Anonymous</span>
              ) : (
                <span className="text-purple-600 hover:underline cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = getUserUrl(data.replyTo.user.name);
                      }}>
                  {data.replyTo.user.name}
                </span>
              )}:
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-[family-name:var(--font-geist-sans)] line-clamp-1">
              {data.replyTo.preview}
            </div>
          </Link>
        </div>
      )}

      <div className="flex gap-4">
        {/* Avatar */}
        {data.user.isAnonymous ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              ANON
            </div>
          </div>
        ) : (
          <Link href={getUserUrl(data.user.name)} className="block">
            <div className={`w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0 
              transition-all duration-300
              ${data.user.style ? getAvatarStyle(data.user.style) : 'hover:ring-2 hover:ring-purple-400 dark:hover:ring-purple-600'}`}
            >
              <Image 
                src={data.user.avatar || DEFAULT_AVATAR} // Fallback hinzugefügt
                alt={`${data.user.name}'s avatar`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </Link>
        )}

        {/* Comment Content */}
        <div className="flex-grow">
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              {data.user.isAnonymous ? (
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Anonymous
                </span>
              ) : (
                <>
                  <Link
                    href={getUserUrl(data.user.name)} 
                    className={`font-medium hover:opacity-80 transition-opacity ${getNickStyle(data.user.style)}`}
                  >
                    {data.user.name}
                  </Link>
                  {data.user.style && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/40 text-white border border-purple-500/50">
                      PREMIUM
                    </span>
                  )}
                </>
              )}
              <span className="text-sm text-gray-500">
                on{' '}
                <Link 
                  href={`/post/${data.post.id}`}
                  className="hover:text-purple-600 dark:hover:text-purple-400"
                >
                  {data.post.title}
                </Link>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href={`/comments/${data.id}`}
                className="text-sm text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2"
              >
                <span title={new Date(data.createdAt).toLocaleString()}>
                  {new Date(data.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <span>•</span>
                <span>
                  {new Date(data.createdAt).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </Link>
              <Link 
                href={`/comments/${data.id}/likes`}
                className="flex items-center gap-1 group"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {data.likes}
                </span>
                <span className="text-xs text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  likes
                </span>
              </Link>
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <div className="flex-grow text-gray-700 dark:text-gray-300 font-[family-name:var(--font-geist-sans)]">
              {renderCommentContent(data.text)}
            </div>

            {/* Thumbnail */}
            <Link 
              href={`/post/${data.post.id}`}
              className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-cover bg-center">
                {data.post.imageUrl && (
                  <Image
                    src={data.post.imageUrl} // Direkte Verwendung der URL ohne Proxy
                    alt={data.post.title}
                    width={80}
                    height={80}
                    className={`object-cover w-full h-full transition-all duration-200 ${
                      data.post.nsfw ? 'group-hover:blur-none blur-md' : ''
                    }`}
                    priority
                  />
                )}
              </div>
              {data.post.type === 'video' && (
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 border-l-[5px] border-l-white border-y-[3px] border-y-transparent" />
                </div>
              )}
              {data.post.type === 'gif' && (
                <div className="absolute bottom-1 right-1">
                  <span className="text-[10px] font-bold bg-black/50 text-white px-1.5 rounded">
                    GIF
                  </span>
                </div>
              )}
              {data.post.nsfw && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:opacity-0">
                  <span className="text-[10px] font-bold text-white px-1.5 py-0.5 bg-red-500/80 rounded">
                    NSFW
                  </span>
                </div>
              )}
            </Link>
          </div>

          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <button className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1">
              <span className="text-base">❤️</span> {data.likes}
            </button>
            <button 
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
            >
              <span className="text-base">💬</span> Reply
            </button>
          </div>

          {/* Reply Box */}
          {showReplyBox && (
            <div className="mt-4 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${data.user.name}...`}
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
                      onClick={() => setShowGifSelector(true)}
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
                      onClick={() => setShowEmojiPicker(true)}
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
                    onClick={() => {
                      setShowReplyBox(false);
                      setReplyText('');
                    }}
                    className="px-3 py-1 rounded-lg text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="px-3 py-1 rounded-lg text-sm text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50"
                  >
                    Reply
                  </button>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
