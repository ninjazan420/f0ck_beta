'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Hilfsfunktion um zu prüfen, ob der Nutzer in einem Eingabefeld tippt
function isUserTypingInInput(): boolean {
  const activeElement = document.activeElement;
  const isInputField = activeElement instanceof HTMLInputElement ||
                       activeElement instanceof HTMLTextAreaElement ||
                       activeElement instanceof HTMLSelectElement ||
                       (activeElement?.getAttribute('contenteditable') === 'true');
  return !!isInputField;
}

interface PostNavigationProps {
  currentId: string;
  nextPostId?: string | null;
  previousPostId?: string | null;
}

export function PostNavigation({ currentId, nextPostId, previousPostId }: PostNavigationProps) {
  const router = useRouter();

  // Add keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Wenn der Nutzer in einem Eingabefeld tippt, die Navigation nicht auslösen
      if (isUserTypingInInput()) {
        return;
      }

      // Neuerer Post: Left arrow or A (zum nächsten Post in der Reihenfolge)
      if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && nextPostId) {
        router.push(`/post/${nextPostId}`);
      }
      // Älterer Post: Right arrow or D (zum vorherigen Post in der Reihenfolge)
      else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && previousPostId) {
        router.push(`/post/${previousPostId}`);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentId, previousPostId, nextPostId, router]);

  return (
    <div className="flex items-center justify-between">
      {nextPostId ? (
        <Link
          href={`/post/${nextPostId}`}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          ← Next
        </Link>
      ) : (
        <div className="p-2 invisible">← Next</div>
      )}

      <Link
        href="/posts"
        className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
      >
        Back to Posts
      </Link>

      {previousPostId ? (
        <Link
          href={`/post/${previousPostId}`}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          Previous →
        </Link>
      ) : (
        <div className="p-2 invisible">Previous →</div>
      )}
    </div>
  );
}
