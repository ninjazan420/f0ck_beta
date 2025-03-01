'use client';

import { useState, ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { EmojiPicker } from '@/components/EmojiPicker';
import { GifSelector } from '@/components/GifSelector';

const DEFAULT_AVATAR = '/images/defaultavatar.png';

interface CommentProps {
  data: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      avatar: string | null;
    };
    post: {
      id: string;
      title: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    replyTo?: {
      id: string;
      author: {
        username: string;
      };
      content: string;
    };
    createdAt: string;
    reports?: Array<{
      user: string;
      reason: string;
      createdAt: string;
    }>;
  };
  onReport?: (id: string, reason: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onReply?: (id: string, content: string) => Promise<void>;
  onModerate?: (id: string, action: 'approve' | 'reject') => Promise<void>;
}

export function Comment({ data, onReport, onDelete, onReply, onModerate }: CommentProps) {
  const { data: session } = useSession();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showGifSelector, setShowGifSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedDate = new Date(data.createdAt).toLocaleString();

  const getUserUrl = (username: string) => `/user/${username.toLowerCase()}`;

  const handleReply = async () => {
    if (!replyText.trim() || !onReply || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onReply(data.id, replyText);
      setReplyText('');
      setShowReplyBox(false);
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim() || !onReport || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onReport(data.id, reportReason);
      setReportReason('');
      setShowReportDialog(false);
    } catch (error) {
      console.error('Error reporting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onDelete(data.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setReplyText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleGifSelect = (gifUrl: string) => {
    setReplyText(prev => prev + ` ${gifUrl} `);
    setShowGifSelector(false);
  };

  const canModerate = session?.user?.role && ['moderator', 'admin'].includes(session.user.role);
  const isAuthor = session?.user?.id === data.author.id;
  const isPending = data.status === 'pending';
  const isRejected = data.status === 'rejected';

  if (isRejected && !canModerate) return null;

  return (
    <div className={`p-4 rounded-lg ${isPending ? 'bg-yellow-50/10' : 'bg-white/50'} dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30`}>
      {/* Reply to section */}
      {data.replyTo && (
        <div className="mb-2 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
          <Link href={`#comment-${data.replyTo.id}`} className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{data.replyTo.author.username}</span>: {data.replyTo.content.substring(0, 100)}
            {data.replyTo.content.length > 100 ? '...' : ''}
          </Link>
        </div>
      )}

      {/* Main comment content */}
      <div className="flex items-start gap-3">
        <Link href={getUserUrl(data.author.username)} className="flex-shrink-0">
          <Image
            src={data.author.avatar || DEFAULT_AVATAR}
            alt={data.author.username}
            width={40}
            height={40}
            className="rounded-lg"
          />
        </Link>

        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={getUserUrl(data.author.username)} className="font-medium text-gray-900 dark:text-gray-100">
              {data.author.username}
            </Link>
            <span className="text-sm text-gray-500">{formattedDate}</span>
            {isPending && (
              <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30">
                Pending
              </span>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            {data.content}
          </div>

          {/* Action buttons */}
          <div className="mt-2 flex items-center gap-4">
            {session && (
              <>
                <button
                  onClick={() => setShowReplyBox(true)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  Reply
                </button>
                {!isAuthor && (
                  <button
                    onClick={() => setShowReportDialog(true)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
                  >
                    Report
                  </button>
                )}
                {(isAuthor || canModerate) && (
                  <button
                    onClick={handleDelete}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
                    disabled={isSubmitting}
                  >
                    Delete
                  </button>
                )}
                {/* Moderationsaktionen */}
                {onModerate && canModerate && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onModerate(data.id, 'approve')}
                      className="px-3 py-1 text-sm rounded-lg bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30 hover:bg-green-500/30"
                      disabled={isSubmitting}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onModerate(data.id, 'reject')}
                      className="px-3 py-1 text-sm rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 hover:bg-red-500/30"
                      disabled={isSubmitting}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Reply box */}
          {showReplyBox && (
            <div className="mt-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEmojiPicker(true)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    😊
                  </button>
                  <button
                    onClick={() => setShowGifSelector(true)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    GIF
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReplyBox(false)}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || isSubmitting}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Report dialog */}
          {showReportDialog && (
            <div className="mt-4">
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Why are you reporting this comment?"
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason.trim() || isSubmitting}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="mt-2">
          <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
        </div>
      )}

      {/* GIF selector */}
      {showGifSelector && (
        <div className="mt-2">
          <GifSelector onSelect={handleGifSelect} onClose={() => setShowGifSelector(false)} />
        </div>
      )}
    </div>
  );
}
