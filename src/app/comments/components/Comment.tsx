'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    // Hier würde die API-Logik für das Senden der Antwort implementiert
    console.log(`Replying to comment ${data.id}: ${replyText}`);
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      {/* Reply Preview */}
      {data.replyTo && (
        <div className="mb-3 pl-4 border-l-2 border-purple-200 dark:border-purple-800/30 bg-purple-50/30 dark:bg-purple-900/10 rounded-r-lg py-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Reply to{' '}
            {data.replyTo.user.isAnonymous ? (
              <span className="text-gray-600 dark:text-gray-400">Anonymous</span>
            ) : (
              <Link 
                href={getUserUrl(data.replyTo.user.name)} 
                className="text-purple-600 hover:underline"
              >
                {data.replyTo.user.name}
              </Link>
            )}:
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 font-[family-name:var(--font-geist-sans)] line-clamp-1">
            {data.replyTo.preview}
          </div>
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
              {data.user.avatar ? (
                <Image 
                  src={data.user.avatar || '/images/default-avatar.png'} // Fallback hinzugefügt
                  alt={`${data.user.name}'s avatar`}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {data.user.name[0].toUpperCase()}
                </div>
              )}
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
                className="text-sm text-gray-500 hover:text-purple-600 dark:hover:text-purple-400"
              >
                {formattedDate}
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
            <p className="flex-grow text-gray-700 dark:text-gray-300 font-[family-name:var(--font-geist-sans)]">
              {data.text}
            </p>

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
            <button className="hover:text-purple-600 dark:hover:text-purple-400">
              ❤️ {data.likes}
            </button>
            <button 
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
            >
              💬 Reply
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
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowReplyBox(false)}
                  className="px-3 py-1 rounded-lg text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="px-3 py-1 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
