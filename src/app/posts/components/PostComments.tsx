'use client';
import { useState } from 'react';
import { Comment } from '@/app/comments/components/Comment';

interface CommentData {
  id: string;
  user: {
    id: string | null;
    name: string;
    avatar: string | null;
    isAnonymous?: boolean;
    style?: {
      type: string;
      gradient: string[];
      animate: boolean;
    };
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
}

// Mock-Kommentare für die Vorschau
const MOCK_COMMENTS: CommentData[] = Array.from({ length: 5 }, (_, i) => ({
  id: `comment-${i}`,
  user: {
    id: i % 3 === 0 ? null : `user-${i}`,
    name: i % 3 === 0 ? 'Anonymous' : `User${i}`,
    avatar: null,
    isAnonymous: i % 3 === 0,
    style: i === 1 ? {
      type: 'gradient',
      gradient: ['purple-400', 'pink-600'],
      animate: true
    } : undefined
  },
  text: "This is an amazing piece of art! Love the colors and composition.",
  post: {
    id: "post-1",
    title: "Amazing Artwork #1"
  },
  likes: Math.floor(Math.random() * 50),
  createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
}));

export function PostComments({ postId }: { postId: string }) {
  const [comments] = useState<CommentData[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier würde die API-Logik zum Speichern des Kommentars implementiert
    console.log('Submitting comment:', newComment);
    setNewComment('');
  };

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 min-h-[100px] resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-500">
            Please keep it friendly and constructive
          </div>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <Comment key={comment.id} data={comment} />
        ))}
      </div>
    </div>
  );
}
