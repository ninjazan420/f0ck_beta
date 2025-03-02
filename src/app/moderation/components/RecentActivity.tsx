'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Activity {
  id: string;
  action: string;
  targetType: string;
  reason: string;
  moderator: string;
  createdAt: string;
  target: {
    id: string;
    type: string;
    username?: string;
    content?: string;
    title?: string;
    numericId?: number;
    imageUrl?: string;
  } | null;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        console.log("Starte API-Aufruf für Moderationsaktivitäten");
        const response = await fetch('/api/moderation/activity?limit=10');
        
        if (!response.ok) {
          console.error("Fehler bei API-Aufruf:", response.status, response.statusText);
          throw new Error('Fehler beim Laden der Aktivitäten');
        }
        
        const data = await response.json();
        console.log("Aktivitätsdaten erhalten:", data);
        setActivities(data.activities);
      } catch (err) {
        console.error('Fehler beim Abrufen der Aktivitäten:', err);
        setError('Aktivitätsdaten konnten nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'delete': return '🗑️';
      case 'warn': return '⚠️';
      case 'ban': return '🚫';
      case 'unban': return '✅';
      case 'approve': return '👍';
      case 'reject': return '👎';
      case 'upload': return '📤';
      default: return '📋';
    }
  };

  const getTargetName = (activity: Activity) => {
    if (!activity.target) return 'Unbekanntes Ziel';
    
    switch (activity.targetType) {
      case 'user': return activity.target.username || `Benutzer #${activity.target.id}`;
      case 'comment': return `Kommentar ${activity.target.id.substring(0, 6)}...`;
      case 'post': return activity.target.title || `Beitrag #${activity.target.numericId || activity.target.id}`;
      default: return `${activity.targetType} #${activity.target.id}`;
    }
  };

  const getTargetLink = (activity: Activity) => {
    if (!activity.target) return null;
    
    switch (activity.targetType) {
      case 'user': 
        return `/user/${activity.target.username || activity.target.id}`;
      case 'post': 
        const postId = activity.target.numericId || activity.target.id;
        return `/post/${postId}`;
      case 'comment': 
        if (activity.target.postId) {
          return `/post/${activity.target.postId}#comment-${activity.target.id}`;
        }
        return null;
      default: 
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: de });
  };

  return (
    <div className="settings-card p-6 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30">
      <h2 className="text-xl font-[family-name:var(--font-geist-mono)] mb-4 text-black dark:text-gray-400">
        Recent Activity
      </h2>
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-3 rounded bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/30">
            <p className="text-sm text-gray-600 dark:text-gray-400">Keine Aktivitäten verfügbar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activities.map((activity) => (
              <div key={activity.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/30">
                <div className="flex items-start gap-3">
                  {activity.target?.imageUrl && (
                    <Link 
                      href={getTargetLink(activity) || '#'}
                      className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-800"
                    >
                      <Image
                        src={activity.target.imageUrl}
                        alt={activity.target.title || 'Post image'}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                    </Link>
                  )}
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start">
                      <span className="text-lg mr-2">{getActivityIcon(activity.action)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          <span className="capitalize">{activity.action}</span>: {' '}
                          {getTargetLink(activity) ? (
                            <Link href={getTargetLink(activity)!} className="hover:underline">
                              {getTargetName(activity)}
                            </Link>
                          ) : (
                            getTargetName(activity)
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.action === 'upload' ? 'Von' : 'Durch'} {activity.moderator} • {formatTime(activity.createdAt)}
                        </p>
                        {activity.action !== 'upload' && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                            Grund: {activity.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 