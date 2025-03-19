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
            {notification.content}
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
      {/* Benachrichtigungsglocke mit Badge für ungelesene Nachrichten */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full focus:outline-none"
        aria-label="Notifications"
      >
        <svg 
          className="w-5 h-5" 
          fill="full" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
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
                onClick={markAllAsRead}
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
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications available
              </div>
            ) : (
              <ul>
                {notifications.map(notification => (
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