'use client';

import { useSession } from 'next-auth/react';
import { CommentList } from '@/app/comments/components/CommentList';

export function CommentModeration() {
  const { data: session } = useSession();

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

  return (
    <CommentList 
      limit={20}
      initialPage={1}
      status="all"
      showModActions={true}
    />
  );
} 