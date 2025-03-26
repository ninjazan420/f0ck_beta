import { useEffect, useRef } from 'react';
import Image from 'next/image';

type User = {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
};

type MentionSelectorProps = {
  users: User[];
  onSelect: (user: User) => void;
  onClose: () => void;
  highlightedIndex: number;
};

export function MentionSelector({ users, onSelect, onClose, highlightedIndex }: MentionSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  useEffect(() => {
    if (containerRef.current && highlightedIndex >= 0 && highlightedIndex < users.length) {
      const highlightedItem = containerRef.current.children[highlightedIndex + 1] as HTMLElement; // +1 wegen dem Header
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, users.length]);
  
  if (users.length === 0) return null;
  
  return (
    <div 
      ref={containerRef}
      className="absolute z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto w-72"
      style={{ maxWidth: 'calc(100vw - 40px)' }}
    >
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 sticky top-0">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>Mention users</span>
          <span className="text-xs text-gray-400">
            {users.length > 1
              ? `${users.length} users found`
              : '1 user found'}
          </span>
        </div>
      </div>
      {users.map((user, index) => (
        <div 
          key={user.id}
          className={`flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
            index === highlightedIndex ? 'bg-purple-100 dark:bg-purple-900/30' : ''
          }`}
          onClick={() => onSelect(user)}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-2 flex-1 min-w-0">
            <div className="text-sm font-medium dark:text-gray-200 truncate">{user.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</div>
          </div>
          <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 text-xs ml-2">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Enter ↵</span>
          </div>
        </div>
      ))}
    </div>
  );
} 