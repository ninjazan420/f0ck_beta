'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Switch from '@/components/ui/Switch';

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

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    comments: true,
    replies: true,
    likes: true,
    favorites: true,
    mentions: false,
    system: false
  });
  const [showSettings, setShowSettings] = useState(false);

  const fetchNotifications = async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/notifications?limit=15&page=${pageNum}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      
      if (append) {
        setNotifications(prev => [...prev, ...data.notifications]);
      } else {
        setNotifications(data.notifications);
      }
      
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Simulierte Funktion zum Speichern der Einstellungen
  const saveNotificationSettings = async () => {
    try {
      // In einer echten Anwendung würde dies ein API-Aufruf sein
      setLoading(true);
      
      // Simuliere eine API-Anfrage mit einem Timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In einer echten Anwendung würden die Einstellungen in der Datenbank gespeichert
      toast.success('Notification settings saved successfully');
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
      } else {
        throw new Error('Failed to mark notifications as read');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Löschen aller Benachrichtigungen
  const clearAllNotifications = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setNotifications([]);
        toast.success('All notifications cleared');
      } else {
        throw new Error('Failed to clear notifications');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    } finally {
      setLoading(false);
    }
  };

  // Anwenden der Filter auf die Benachrichtigungen
  const filteredNotifications = notifications.filter(notification => {
    switch (notification.type) {
      case 'comment': return notificationSettings.comments;
      case 'reply': return notificationSettings.replies;
      case 'like': return notificationSettings.likes;
      case 'favorite': return notificationSettings.favorites;
      case 'mention': return notificationSettings.mentions;
      case 'system': return notificationSettings.system;
      default: return true;
    }
  });

  useEffect(() => {
    fetchNotifications(1);
    
    // In einer echten Anwendung würden die Einstellungen aus der Datenbank geladen
    // Hier simulieren wir das, indem wir die Standardeinstellungen verwenden
  }, []);

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: enUS });
    } catch (error) {
      return 'Unknown';
    }
  };

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

  const getNotificationLink = (notification: Notification) => {
    try {
      // Striktere ID-Priorisierung
      let postId;
      
      // Priorisiere die in den Daten gespeicherte postId
      if (notification.data?.postId) {
        postId = notification.data.postId;
      } 
      // Dann die numericId des verknüpften Dokuments
      else if (notification.relatedId?.numericId) {
        postId = notification.relatedId.numericId.toString();
      } 
      // Als letztes Mittel, verwende die MongoDB ObjectID
      else if (notification.relatedId?._id) {
        postId = notification.relatedId._id.toString();
      } 
      // Wenn keine ID gefunden wurde, leite zur Hauptseite weiter
      else {
        return '/posts';
      }
      
      // Spezifische Link-Generierung basierend auf dem Benachrichtigungstyp
      switch (notification.type) {
        case 'comment':
          // Link zum Post mit Anker zum Kommentar
          return `/post/${postId}#comment-${notification.data?.commentId || ''}`;
        case 'reply':
          // Link zum Post mit Anker zum Antwort-Kommentar
          return `/post/${postId}#comment-${notification.relatedId?._id || notification.data?.commentId || ''}`;
        case 'like':
        case 'favorite':
          // Link direkt zum Post
          return `/post/${postId}`;
        case 'mention':
          if (notification.relatedModel === 'Comment') {
            // Bei Erwähnungen in Kommentaren zum Kommentar springen
            return `/post/${postId}#comment-${notification.relatedId?._id || ''}`;
          }
          return '/account';
        default:
          return `/post/${postId}`;
      }
    } catch (error) {
      console.error('Error generating notification link:', error);
      return '/notifications';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={markAllAsRead}
            disabled={loading || notifications.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
          >
            Mark all as read
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            {showSettings ? 'Hide settings' : 'Settings'}
          </button>
          
          <button
            onClick={clearAllNotifications}
            disabled={loading || notifications.length === 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            Clear all
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium">Comments</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications when someone comments on your posts
                </p>
              </div>
              <Switch 
                checked={notificationSettings.comments}
                onChange={e => setNotificationSettings({...notificationSettings, comments: e.target.checked})}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium">Replies</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications when someone replies to your comments
                </p>
              </div>
              <Switch 
                checked={notificationSettings.replies}
                onChange={e => setNotificationSettings({...notificationSettings, replies: e.target.checked})}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium">Likes</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications when someone likes your posts
                </p>
              </div>
              <Switch 
                checked={notificationSettings.likes}
                onChange={e => setNotificationSettings({...notificationSettings, likes: e.target.checked})}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium">Favorites</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications when someone adds your posts to favorites
                </p>
              </div>
              <Switch 
                checked={notificationSettings.favorites}
                onChange={e => setNotificationSettings({...notificationSettings, favorites: e.target.checked})}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium">Mentions</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications when someone mentions you
                </p>
              </div>
              <Switch 
                checked={notificationSettings.mentions}
                onChange={e => setNotificationSettings({...notificationSettings, mentions: e.target.checked})}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium">System Updates</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive important system notifications and updates
                </p>
              </div>
              <Switch 
                checked={notificationSettings.system}
                onChange={e => setNotificationSettings({...notificationSettings, system: e.target.checked})}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
            >
              Cancel
            </button>
            
            <button
              onClick={saveNotificationSettings}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>
      )}

      {loading && notifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-purple-600 rounded-full mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      ) : filteredNotifications.length === 0 && notifications.length > 0 ? (
        <div className="py-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">No matching notifications</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your notification filters in Settings.
          </p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-5xl mb-4">🔔</div>
          <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
          <p className="text-gray-500 dark:text-gray-400">
            When you receive notifications, they will appear here.
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {filteredNotifications.map((notification) => (
              <li key={notification._id} className={`transition-all ${!notification.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : 'bg-white dark:bg-gray-800'} rounded-xl shadow-xs border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-sm`}>
                <Link 
                  href={getNotificationLink(notification)}
                  className="block"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-900/30 dark:to-blue-900/30 p-3 rounded-full text-xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-200">
                              {notification.data?.actorName ? (
                                <>
                                  <span 
                                    className={notification.data.actorAnonymous ? 
                                      "font-medium" : 
                                      "font-medium text-purple-600 dark:text-purple-400"}
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
                            
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          
                          {/* Thumbnail als kleineres Element */}
                          {notification.data?.postThumbnail && (
                            <div className="sm:w-20 sm:h-20 h-24 w-full mt-2 sm:mt-0 flex-shrink-0">
                              <div className="relative h-full w-full overflow-hidden rounded-lg">
                                <img
                                  src={notification.data.postThumbnail}
                                  alt="Post thumbnail"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                  <p className="text-white text-xs p-1 truncate w-full">
                                    {notification.data.postTitle || 'View post'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <span className="flex-shrink-0 h-3 w-3 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={() => fetchNotifications(page + 1, true)}
                disabled={loading}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 