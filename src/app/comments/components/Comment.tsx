'use client';

import Link from 'next/link';

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
                <img 
                  src={data.user.avatar} 
                  alt="" 
                  className="w-full h-full object-cover"
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

          <p className="text-gray-700 dark:text-gray-300 font-[family-name:var(--font-geist-sans)]">
            {data.text}
          </p>
        </div>
      </div>
    </div>
  );
}
