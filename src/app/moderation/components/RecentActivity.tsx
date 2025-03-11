'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
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
    numericId?: number | string;
    imageUrl?: string;
  } | null;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        console.log("Starting API call for moderation activities");
        
        // Use timestamp for cache busting, but not as part of the actual query
        const cacheBuster = Date.now();
        const response = await fetch(`/api/moderation/activity?limit=15&_cache=${cacheBuster}`);
        
        if (!response.ok) {
          console.error("Error in API call:", response.status, response.statusText);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.activities || !Array.isArray(data.activities)) {
          console.error("Invalid data format:", data);
          throw new Error('Invalid data format received');
        }
        
        setActivities(data.activities);
        setLastUpdateTime(new Date());
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err instanceof Error ? err.message : 'Activity data could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchActivities();
    
    // Auto update every 60 seconds
    const intervalId = setInterval(fetchActivities, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'comment': return '💬';
      case 'delete': return '🗑️';
      case 'approve': return '✅';
      case 'reject': return '❌';
      case 'upload': return '📤';
      case 'report': return '🚩';
      case 'disableComments': return '🔒';
      case 'enableComments': return '🔓';
      case 'ban': return '🚫';
      case 'unban': return '🔄';
      case 'warn': return '⚠️';
      default: return '📝';
    }
  };

  // Generate a descriptive action message
  const getActionMessage = (activity: Activity) => {
    if (!activity.target) {
      return getActionText(activity.action);
    }

    const targetId = activity.target.numericId || activity.target.id;
    
    switch (activity.action) {
      case 'delete':
        if (activity.targetType === 'post') {
          return `deleted post`;
        } else if (activity.targetType === 'comment') {
          return `deleted comment`;
        } else {
          return `deleted ${activity.targetType}`;
        }
      
      case 'disableComments':
        return `disabled comments on post`;
      
      case 'enableComments':
        return `enabled comments on post`;
      
      case 'approve':
        if (activity.targetType === 'comment') {
          return `approved comment`;
        } else {
          return `approved ${activity.targetType}`;
        }
      
      case 'reject':
        if (activity.targetType === 'comment') {
          return `rejected comment`;
        } else {
          return `rejected ${activity.targetType}`;
        }
      
      case 'ban':
        if (activity.targetType === 'user') {
          return `banned user ${activity.target.username || targetId}`;
        } else {
          return `banned ${activity.targetType}`;
        }
      
      case 'unban':
        if (activity.targetType === 'user') {
          return `unbanned user ${activity.target.username || targetId}`;
        } else {
          return `unbanned ${activity.targetType}`;
        }
      
      case 'warn':
        if (activity.targetType === 'user') {
          return `warned user ${activity.target.username || targetId}`;
        } else {
          return `warned ${activity.targetType}`;
        }
        
      default:
        return `${getActionText(activity.action)} ${activity.targetType}`;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'delete': return 'Delete';
      case 'approve': return 'Approve';
      case 'reject': return 'Reject';
      case 'upload': return 'Upload';
      case 'report': return 'Report';
      case 'disableComments': return 'Disable Comments';
      case 'enableComments': return 'Enable Comments';
      case 'ban': return 'Ban';
      case 'unban': return 'Unban';
      case 'warn': return 'Warn';
      default: return action;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: enUS });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  // Generate link for the activity
  const getTargetLink = (activity: Activity) => {
    if (!activity.target) return null;
    
    const targetId = activity.target.numericId || activity.target.id;
    
    switch (activity.targetType) {
      case 'post':
        return `/post/${targetId}`;
      case 'comment':
        return `/post/${activity.target.postId || ''}#comment-${activity.target.id}`;
      case 'user':
        return `/user/${activity.target.username || targetId}`;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-right text-gray-500 dark:text-gray-400 mb-2">
        Last update: {formatTime(lastUpdateTime.toISOString())}
      </div>
      
      {loading && activities.length === 0 ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 text-xs bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded"
          >
            Try Again
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="p-3 rounded bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/30">
          <p className="text-sm text-gray-600 dark:text-gray-400">No moderation activities available yet</p>
        </div>
      ) : (
        activities.map((activity) => {
          const targetLink = getTargetLink(activity);
          
          return (
            <div key={activity.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/30">
              <div className="flex items-start gap-3">
                {activity.target?.imageUrl && (
                  <Link 
                    href={targetLink || '#'}
                    className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-800"
                  >
                    <Image
                      src={activity.target.imageUrl}
                      alt="Post thumbnail"
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
                        <Link href={targetLink || '#'} className={targetLink ? "hover:underline" : ""}>
                          {getActionMessage(activity)}
                        </Link>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.moderator} • <Link href={targetLink || '#'} className={targetLink ? "hover:underline" : ""}>{formatTime(activity.createdAt)}</Link>
                      </p>
                      {activity.reason && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                          Reason: {activity.reason}
                        </p>
                      )}
                      
                      {/* Display comment content if available */}
                      {activity.targetType === 'comment' && activity.target?.content && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800/80 rounded text-xs text-gray-700 dark:text-gray-300">
                          <p className="line-clamp-2">{activity.target.content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      
      {loading && activities.length > 0 && (
        <div className="flex justify-center p-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
} 