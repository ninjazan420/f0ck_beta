import { useEffect } from 'react';
import { useRouter } from 'next/router';

function isUserTypingInInput(): boolean {
  const activeElement = document.activeElement;
  const isInputField = activeElement instanceof HTMLInputElement || 
                       activeElement instanceof HTMLTextAreaElement || 
                       activeElement instanceof HTMLSelectElement ||
                       (activeElement?.getAttribute('contenteditable') === 'true');
  return !!isInputField;
}

const PostNavigation: React.FC = () => {
  const router = useRouter();
  const previousPostId = 'previousPostId'; // Replace with actual previousPostId
  const nextPostId = 'nextPostId'; // Replace with actual nextPostId

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isUserTypingInInput()) {
        return;
      }
      
      if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && previousPostId) {
        router.push(`/post/${previousPostId}`);
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && nextPostId) {
        router.push(`/post/${nextPostId}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPostId, previousPostId, router]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default PostNavigation; 