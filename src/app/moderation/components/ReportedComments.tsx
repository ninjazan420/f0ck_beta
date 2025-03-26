'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { Comment } from '@/app/comments/components/Comment';

interface ReportedComment {
  id: string;
  content: string;
  author: any;
  createdAt: string;
  post: {
    id: string;
    title: string;
  };
  reports: Array<{
    user: {
      username: string;
      name: string;
    };
    reason: string;
    createdAt: string;
  }>;
}

export function ReportedComments() {
  const { data: session } = useSession();
  const [comments, setComments] = useState<ReportedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportedComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/moderation/reported-comments?_cache=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setComments(data.comments || []);
      } catch (err) {
        console.error('Error fetching reported comments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reported comments');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role && ['moderator', 'admin'].includes(session.user.role)) {
      fetchReportedComments();
      
      // Auto-refresh every 30 seconds
      const intervalId = setInterval(fetchReportedComments, 30000);
      return () => clearInterval(intervalId);
    }
  }, [session]);

  const handleModerateComment = async (commentId: string, action: 'approve' | 'delete' | 'ignore') => {
    try {
      const response = await fetch('/api/moderation/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action === 'delete' ? 'delete' : (action === 'approve' ? 'approve' : 'ignore'),
          targetType: 'comment',
          targetId: commentId,
          reason: `Moderator ${action === 'delete' ? 'deleted' : (action === 'approve' ? 'approved' : 'ignored')} reported comment`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to moderate comment');
      }
      
      // Remove the comment from the list if delete or ignore
      if (action === 'delete' || action === 'ignore') {
        setComments(comments.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('Error during comment moderation:', error);
    }
  };

  if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
    return (
      <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20">
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
          Access Denied
        </h2>
        <p className="text-red-600 dark:text-red-300">
          You do not have permission to access moderation features.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20">
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
          Error Loading Reports
        </h2>
        <p className="text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          No Reported Comments
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          There are currently no reported comments to review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="border border-red-300 dark:border-red-700/50 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Reported Comment
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              In post: <span className="font-medium">{comment.post.title}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Reports: <span className="font-medium">{comment.reports.length}</span>
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <Comment 
              data={comment}
              onModDelete={() => handleModerateComment(comment.id, 'delete')}
            />
          </div>
          
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-gray-800 dark:text-gray-200">Report Reasons:</h4>
            {comment.reports.map((report, idx) => (
              <div key={idx} className="p-2 bg-white dark:bg-gray-800/80 rounded text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{report.user?.name || report.user?.username || "Anonymous"}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{report.reason}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex gap-3 justify-end">
            <button
              onClick={() => handleModerateComment(comment.id, 'ignore')}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded"
            >
              Ignore Report
            </button>
            <button
              onClick={() => handleModerateComment(comment.id, 'delete')}
              className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Delete Comment
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 