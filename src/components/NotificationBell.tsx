'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Link from 'next/link';

type Notification = {
  _id: string;
  type: 'comment' | 'reply' | 'like' | 'favorite' | 'mention' | 'system';
  content: string;
  relatedId?: any;
  relatedModel?: string;
  createdAt: string;
  read: boolean;
  data?: any;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Benachrichtigungen abrufen
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const cacheBuster = Date.now();
      const response = await fetch(`/api/notifications?limit=20&_=${cacheBuster}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Benachrichtigung als gelesen markieren
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      
      if (response.ok) {
        // Lokalen Zustand aktualisieren
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true } 
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Alle Benachrichtigungen als gelesen markieren
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      });
      
      if (response.ok) {
        // Lokalen Zustand aktualisieren
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Klick außerhalb des Dropdowns schließt es
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Benachrichtigungen bei Komponenten-Mount laden
  useEffect(() => {
    fetchNotifications();
    
    // Polling alle 60 Sekunden
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Vollständig überarbeitete und garantierte Link-Funktion
  const getNotificationLink = (notification: Notification) => {
    try {
      // Für das Debugging: Logge die vorhandenen IDs
      console.log("Notification link data:", {
        dataPostId: notification.data?.postId,
        relatedIdNumericId: notification.relatedId?.numericId,
        relatedIdMongo: notification.relatedId?._id,
        type: notification.type,
      });
      
      // Ermittle die korrekte Post-ID mit strikter Priorisierung
      let postId;
      
      // Verwende die korrekte Art von ID (String, Nummer, etc.)
      if (notification.data?.postId) {
        postId = notification.data.postId;
        console.log("Using data.postId:", postId);
      } else if (notification.relatedId?.numericId) {
        postId = notification.relatedId.numericId;
        console.log("Using relatedId.numericId:", postId);
      } else if (notification.relatedId?._id) {
        postId = notification.relatedId._id;
        console.log("Using relatedId._id:", postId);
      } else {
        // Fallback zu einer sicheren URL
        console.log("No valid ID found, using fallback");
        return '/posts';
      }
      
      // Spezifische Link-Generierung je nach Benachrichtigungstyp
      switch (notification.type) {
        case 'comment':
          return `/post/${postId}#comment-${notification.data?.commentId || ''}`;
        case 'reply':
          return `/post/${postId}#comment-${notification.relatedId?._id || notification.data?.commentId || ''}`;
        case 'like':
        case 'favorite':
          return `/post/${postId}`;
        case 'mention':
          if (notification.relatedModel === 'Comment') {
            return `/post/${postId}#comment-${notification.relatedId?._id || ''}`;
          }
          return '/account';
        default:
          return `/post/${postId}`;
      }
    } catch (error) {
      console.error('Error generating notification link:', error, notification);
      return '/notifications';
    }
  };

  // Icon für den Benachrichtigungstyp
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬';
      case 'reply': return '↩️';
      case 'like': return '👍';
      case 'favorite': return '❤️';
      case 'mention': return '@️';
      case 'system': return '🔔';
      default: return '📝';
    }
  };

  // Formatierte Zeit für die Benachrichtigung
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: enUS });
    } catch (error) {
      return 'Unknown';
    }
  };

  // Erweiterung der Notification-Anzeige: Vorschaubild hinzufügen
  const renderNotification = (notification: Notification) => {
    return (
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-xl">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 dark:text-gray-200">
            {notification.data?.actorName ? (
              <>
                <span 
                  className={notification.data.actorAnonymous ? 
                    "font-medium" : 
                    "font-medium text-purple-600 dark:text-purple-400 cursor-pointer hover:underline"}
                  onClick={(e) => {
                    if (!notification.data.actorAnonymous) {
                      e.stopPropagation();
                      window.location.href = `/user/${notification.data.actorUsername || notification.data.actorName}`;
                    }
                  }}
                >
                  {notification.data.actorName}
                </span>
                {' '}
                {notification.type === 'comment' && 'commented on your post'}
                {notification.type === 'reply' && 'replied to your comment'}
                {notification.type === 'like' && 'liked your post'}
                {notification.type === 'favorite' && 'added your post to favorites'}
                {notification.type === 'mention' && 'mentioned you'}
                {notification.type === 'system' && notification.content}
              </>
            ) : (
              notification.content
            )}
          </p>
          
          {/* Zeige Thumbnails für relevante Benachrichtigungen */}
          {notification.data?.postThumbnail && (
            <div className="mt-2 rounded-md overflow-hidden">
              <div className="relative h-16 overflow-hidden rounded-lg">
                <img 
                  src={notification.data.postThumbnail} 
                  alt={notification.data.postTitle || "Post thumbnail"} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <p className="text-white text-xs p-1 truncate w-full">
                    {notification.data.postTitle || "View post"}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatTime(notification.createdAt)}
          </p>
        </div>
        
        {!notification.read && (
          <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
        )}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Benachrichtigungsglocke mit transparentem Hintergrund */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 rounded-md bg-transparent hover:bg-gray-700/10 dark:hover:bg-gray-600/10 transition-colors focus:outline-hidden"
        aria-label="Notifications"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          height={24} 
          width={24} 
          xmlns="http://www.w3.org/2000/svg" 
          aria-hidden="true" 
          className="w-5 h-5 text-gray-800 dark:text-white transition-colors"
        >
          <path 
            d="M12 5.365V3m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175 0 .593 0 1.292-.538 1.292H5.538C5 18 5 17.301 5 16.708c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 12 5.365ZM8.733 18c.094.852.306 1.54.944 2.112a3.48 3.48 0 0 0 4.646 0c.638-.572 1.236-1.26 1.33-2.112h-6.92Z" 
            strokeWidth={2} 
            strokeLinejoin="round" 
            strokeLinecap="round" 
            stroke="currentColor" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute bottom-0.5 left-0.5 w-2 h-2 bg-green-500 rounded-full flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          </span>
        )}
      </button>

      {/* Dropdown für Benachrichtigungen */}
      {isOpen && (
        <div className="absolute right-0 w-80 mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-sm">Notifications</h3>
            
            {unreadCount > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-red-500 dark:text-red-400">
                {error}
              </div>
            ) : notifications.filter(n => !n.read).length === 0 && unreadCount === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No new notifications
              </div>
            ) : (
              <ul>
                {notifications
                  .filter(notification => !notification.read || notifications.indexOf(notification) < 5)
                  .slice(0, 10)
                  .map(notification => (
                    <li 
                      key={notification._id} 
                      className={`border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <Link 
                        href={getNotificationLink(notification)}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification._id);
                          }
                          setIsOpen(false);
                        }}
                        className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        {renderNotification(notification)}
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700">
            <Link 
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-xs text-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 