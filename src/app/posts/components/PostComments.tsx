'use client';
import { useState, useEffect, ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EmojiPicker } from '@/components/EmojiPicker';
import { GifSelector } from '@/components/GifSelector';
import { useSession } from 'next-auth/react';

const DEFAULT_AVATAR = '/images/defaultavatar.png';

interface Comment {
  id: string;
  user: {      
    id: string | null;
    name: string;
    avatar: string | null;
    isAnonymous?: boolean;
    style?: { type: string; color?: string; gradient?: string[]; animate?: boolean };
    isCurrentUser: boolean;
  };
  text: string;
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
  post?: {
    id: string;
    numericId?: string | number;
  };
}

interface PostCommentsProps {
  postId: string;
}

export function PostComments({ postId }: PostCommentsProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(!session?.user);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifSelector, setShowGifSelector] = useState(false);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);
  const [showReplyGifSelector, setShowReplyGifSelector] = useState(false);
  const [showReplyPreview, setShowReplyPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showEditPreview, setShowEditPreview] = useState(false);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

  // Aktualisiere den isAnonymous-Status, wenn sich der Session-Status ändert
  useEffect(() => {
    setIsAnonymous(!session?.user);
  }, [session]);

  // Get the hash fragment from URL on page load and set it as the highlighted comment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#comment-')) {
        const commentId = hash.replace('#comment-', '');
        setHighlightedCommentId(commentId);
        
        // Scroll to the element after a short delay to ensure it's rendered
        setTimeout(() => {
          const element = document.getElementById(`comment-${commentId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
        
        // Clear the highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCommentId(null);
        }, 4000);
      }
    }
  }, [comments]); // Re-run when comments change

  // Hilfsfunktionen aus der Comment-Komponente
  const getUserUrl = (username: string) => `/user/${username.toLowerCase()}`;
  const getNickStyle = (style?: { type: string; color?: string; gradient?: string[]; animate?: boolean }) => {
    if (!style) return '';
    
    switch(style.type) {
      case 'solid':
        return `text-${style.color}`;
      case 'gradient':
        return `bg-gradient-to-r from-${style.gradient?.[0]} to-${style.gradient?.[1]} bg-clip-text text-transparent`;
      case 'animated':
        return `animate-pulse bg-gradient-to-r from-${style.gradient?.[0]} to-${style.gradient?.[1]} bg-clip-text text-transparent`;
      default:
        return '';
    }
  };

  const getAvatarStyle = (style?: { type: string; color?: string; gradient?: string[]; animate?: boolean }) => {
    if (!style) return '';
    
    switch(style.type) {
      case 'solid':
        return `ring-2 ring-${style.color}`;
      case 'gradient':
        return `ring-2 bg-gradient-to-r from-${style.gradient?.[0]} to-${style.gradient?.[1]} ring-purple-400`;
      case 'animated':
        return `ring-2 bg-gradient-to-r from-${style.gradient?.[0]} to-${style.gradient?.[1]} ring-purple-400 animate-pulse`;
      default:
        return '';
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    
    try {
      // Finde den Originalkommentar
      const originalComment = comments.find(c => c.id === commentId);
      if (!originalComment) {
        throw new Error('Original comment not found');
      }
      
      // Stelle sicher, dass eingeloggte Benutzer nicht unbeabsichtigt als anonym markiert werden
      const effectiveIsAnonymous = !session?.user ? true : isAnonymous;
      
      console.log('Submitting reply:', {
        content: replyText,
        postId,
        replyTo: commentId,
        isAnonymous: effectiveIsAnonymous,
      });
      
      // API-Aufruf zum Speichern des Kommentars
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyText,
          postId,
          replyTo: commentId,
          isAnonymous: effectiveIsAnonymous,
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to post reply: ${error}`);
      }
      
      // Antwort wurde erfolgreich gespeichert
      setReplyText('');
      setReplyToId(null);
      
      // Aktualisiere die Kommentarliste
      console.log('Reply saved successfully, refreshing comments');
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error posting reply:', error);
      alert(`Failed to post reply: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      console.log(`Fetching comments for postId: ${postId}`);
      const response = await fetch(`/api/comments?postId=${postId}&page=1&limit=50`);
      
      if (!response.ok) {
        console.error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
        throw new Error('Failed to fetch comments');
      }
      
      const responseText = await response.text();
      console.log(`Comments API response: ${responseText.substring(0, 200)}...`);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse comments response:', parseError);
        throw new Error('Failed to parse server response');
      }
      
      console.log(`Received ${data.comments.length} comments`);
      
      // Formatiere die Kommentare
      const formattedComments: Comment[] = data.comments.map((comment: any) => {
        console.log('Processing comment:', comment);
        
        // Prüfen, ob der Kommentar vom aktuellen Benutzer stammt, um Edit/Delete-Buttons anzuzeigen
        const isFromCurrentUser = session?.user && 
          (comment.author?._id === session.user.id || 
           comment.author?.id === session.user.id);
        
        return {
          id: comment._id || comment.id,
          user: {
            id: comment.author?._id || comment.author?.id || null,
            name: comment.author?.username || 'Anonymous',
            avatar: comment.author?.avatar || null,
            isAnonymous: !comment.author,
            isCurrentUser: isFromCurrentUser // Neues Flag für aktuelle Benutzerkommentare
          },
          text: comment.content,
          likes: 0, // Anzahl der Likes sollte vom Server kommen
          createdAt: comment.createdAt,
          ...(comment.replyTo ? {
            replyTo: {
              id: comment.replyTo._id || comment.replyTo.id,
              user: {
                name: comment.replyTo.author?.username || 'Anonymous',
                isAnonymous: !comment.replyTo.author
              },
              preview: comment.replyTo.content.substring(0, 100)
            }
          } : {}),
          ...(comment.post ? {
            post: {
              id: comment.post.id,
              numericId: comment.post.numericId
            }
          } : {})
        };
      });
      
      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchComments();
  }, [postId, refreshKey]);

  // Funktion zum Hinzufügen eines neuen Kommentars zur Liste
  const addNewComment = (savedComment: any) => {
    try {
      // Erstelle ein korrekt formatiertes Kommentar-Objekt
      const formattedComment: Comment = {
        id: savedComment._id || savedComment.id,
        user: {
          id: session?.user?.id || null,
          name: session?.user?.name || 'Anonymous',
          avatar: session?.user?.image || null,
          isAnonymous: !session?.user || isAnonymous,
          isCurrentUser: true // Dieser Kommentar stammt vom aktuellen Benutzer
        },
        text: savedComment.content,
        likes: 0,
        createdAt: savedComment.createdAt || new Date().toISOString(),
        post: {
          id: savedComment.post || postId,
          numericId: postId // Wir nehmen die numeric ID aus der Prop
        },
        ...(savedComment.replyTo ? {
          replyTo: {
            id: savedComment.replyTo._id || savedComment.replyTo.id,
            user: {
              name: savedComment.replyTo.author?.username || 'Anonymous',
              isAnonymous: !savedComment.replyTo.author
            },
            preview: typeof savedComment.replyTo.content === 'string' 
              ? savedComment.replyTo.content.substring(0, 100) 
              : "..."
          }
        } : {})
      };
      
      // Füge den neuen Kommentar an den Anfang der Liste
      setComments(prev => [formattedComment, ...prev]);
    } catch (error) {
      console.error('Error formatting new comment:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    
    try {
      // Stelle sicher, dass eingeloggte Benutzer nicht unbeabsichtigt als anonym markiert werden
      const effectiveIsAnonymous = !session?.user ? true : isAnonymous;
      
      console.log('Submitting comment:', {
        content: newComment,
        postId,
        isAnonymous: effectiveIsAnonymous,
        session: session ? 'User is logged in' : 'No session'
      });
      
      // API-Aufruf zum Speichern des Kommentars
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          postId,
          isAnonymous: effectiveIsAnonymous,
        }),
      });
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${responseText}`);
      }
      
      try {
        // Parse der Antwort
        const savedComment = JSON.parse(responseText);
        console.log('Parsed comment response:', savedComment);
        
        // Füge den neuen Kommentar zur Liste hinzu
        addNewComment(savedComment);
        
        // Leere das Formular
        setNewComment('');
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert(`Failed to submit comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (replyToId) {
      const textarea = document.querySelector('textarea[name="reply"]') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);
        setReplyText(before + emoji + after);
      }
      setShowReplyEmojiPicker(false);
    } else {
      const textarea = document.querySelector('textarea:not([name="reply"])') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);
        setNewComment(before + emoji + after);
      }
      setShowEmojiPicker(false);
    }
  };

  const handleGifSelect = (gifUrl: string) => {
    // Entferne die zusätzlichen Parameter aus der GIF-URL
    const cleanGifUrl = gifUrl.split('?')[0];
    
    if (replyToId) {
      setReplyText(text => text.trim() + ' ' + cleanGifUrl + ' ');
      setShowReplyGifSelector(false);
    } else {
      setNewComment(text => text.trim() + ' ' + cleanGifUrl + ' ');
      setShowGifSelector(false);
    }
  };

  // Neue Funktion zum Parsen von Text und Umwandeln von URLs in Bilder
  const renderCommentContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+\.(gif|png|jpg|jpeg))(?:\?[^\s]*)?/gi;
    const matches = text.match(urlRegex) || [];
    const textParts = text.replace(urlRegex, '\n[media]\n').split('\n');
    const result: ReactElement[] = [];
    let mediaIndex = 0;
    
    textParts.forEach((part, index) => {
      if (part === '[media]') {
        if (matches[mediaIndex]) {
          const cleanUrl = matches[mediaIndex].split('?')[0];
          const isGiphy = cleanUrl.includes('giphy.com');
          result.push(
            <div key={`media-${index}`} className="my-1 max-w-md">
              <Image
                src={cleanUrl}
                alt="Embedded media"
                width={300}
                height={300}
                className="rounded-lg"
                unoptimized
              />
              {isGiphy && (
                <div className="text-[10px] text-gray-400 dark:text-gray-500 opacity-50 mt-0.5 pl-1">
                  Powered by GIPHY
                </div>
              )}
            </div>
          );
          mediaIndex++;
        }
      } else if (part.trim()) {
        result.push(<span key={`text-${index}`} className="whitespace-pre-wrap">{part}</span>);
      }
    });
    
    return result;
  };

  // Funktion zum Löschen eines Kommentars
  const handleDeleteComment = async (commentId: string) => {
    if (!commentId) {
      console.error('Cannot delete comment with undefined ID');
      return;
    }
    
    try {
      console.log(`Deleting comment with ID: ${commentId}`);
      
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to delete comment: ${errorText}`);
        throw new Error(`Failed to delete comment: ${response.status}`);
      }
      
      console.log('Comment deleted successfully');
      
      // Entferne den Kommentar aus der UI
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again later.');
    }
  };

  // Funktion zum Starten der Bearbeitung eines Kommentars
  const startEditComment = (comment: Comment) => {
    setEditCommentId(comment.id);
    setEditCommentText(comment.text);
    setShowEditPreview(false);
  };

  // Funktion zum Speichern der Bearbeitung
  const handleSaveEdit = async () => {
    if (!editCommentId || !editCommentText.trim()) {
      console.error('Cannot edit comment: Missing ID or content');
      return;
    }
    
    try {
      console.log(`Editing comment with ID: ${editCommentId}`);
      
      const response = await fetch(`/api/comments/${editCommentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editCommentText
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to update comment: ${errorText}`);
        throw new Error(`Failed to update comment: ${response.status}`);
      }
      
      const updatedComment = await response.json();
      console.log('Comment updated successfully:', updatedComment);
      
      // Aktualisiere den Kommentar in der UI
      setComments(prev => prev.map(comment => 
        comment.id === editCommentId 
          ? { ...comment, text: editCommentText } 
          : comment
      ));
      
      // Zurücksetzen des Bearbeitungsmodus
      setEditCommentId(null);
      setEditCommentText('');
      setShowEditPreview(false);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`loading-${i}`} className="animate-pulse">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-[family-name:var(--font-geist-mono)] text-gray-900 dark:text-gray-100">
        Comments ({comments.length})
      </h2>

      {/* Kommentar-Form */}
      <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-xl p-4 mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Add a Comment</h3>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                value=""
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Post Anonymously
              </span>
            </label>
            {showPreview && 
              <button
                onClick={() => setShowPreview(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
              >
                Edit
              </button>
            }
            {!showPreview && 
              <button
                onClick={() => setShowPreview(true)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
                disabled={!newComment}
              >
                Preview
              </button>
            }
          </div>
        </div>
        
        {showPreview ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 min-h-[100px] mb-3">
            {renderCommentContent(newComment)}
          </div>
        ) : (
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none text-sm"
            rows={5}
          />
        )}
        
        <div className="mt-3 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {newComment.length}/500 characters
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowGifSelector(!showGifSelector);
                  setShowEmojiPicker(false);
                }}
                className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Add GIF"
              >
                🎨 GIF
              </button>
              {showGifSelector && (
                <GifSelector
                  onSelect={handleGifSelect}
                  onClose={() => setShowGifSelector(false)}
                />
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowGifSelector(false);
                }}
                className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Add emoji"
              >
                😊 Emoji
              </button>
              {showEmojiPicker && (
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>
            <button
              onClick={() => setNewComment('')}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                isAnonymous ? 'Post Anonymously' : 'Post Comment'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div 
            key={comment.id} 
            id={`comment-${comment.id}`} 
            className={`bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-xl p-4 transition-all duration-500 ${
              highlightedCommentId === comment.id 
                ? 'ring-4 ring-purple-500/50 dark:ring-purple-500/30 bg-purple-50/50 dark:bg-purple-900/20' 
                : ''
            }`}
          >
            {/* Reply to section */}
            {comment.replyTo && (
              <div className="mb-3 pl-3 py-2 border-l-2 border-purple-300 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-900/10 rounded">
                <Link href={`/post/${comment.post?.numericId || postId}#comment-${comment.replyTo.id}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <span className="font-medium">{comment.replyTo.user.name}</span>: {comment.replyTo.preview}
                  {comment.replyTo.preview.length > 100 ? '...' : ''}
                </Link>
              </div>
            )}

            {/* Main comment content */}
            <div className="flex items-start gap-3">
              <Link href={getUserUrl(comment.user.name)} className="flex-shrink-0">
                <div className={`relative w-10 h-10 rounded-lg overflow-hidden ${getAvatarStyle(comment.user.style)}`}>
                  <Image
                    src={comment.user.avatar || DEFAULT_AVATAR}
                    alt={comment.user.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>

              <div className="flex-grow min-w-0">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Link href={getUserUrl(comment.user.name)} className={`font-medium ${getNickStyle(comment.user.style)}`}>
                      {comment.user.name}
                    </Link>
                    <Link 
                      href={`#comment-${comment.id}`} 
                      className="text-sm text-gray-500 hover:text-purple-500 transition-colors"
                      title="Permalink to this comment"
                    >
                      {new Date(comment.createdAt).toLocaleString()}
                    </Link>
                  </div>
                </div>

                {editCommentId === comment.id ? (
                  <div className="space-y-2">
                    {showEditPreview ? (
                      <div className="min-h-[100px] p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          {renderCommentContent(editCommentText) || <span className="text-gray-400 dark:text-gray-500">Nothing to preview</span>}
                        </div>
                      </div>
                    ) : (
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none text-sm min-h-[100px]"
                        title="Edit comment"
                        placeholder="Edit your comment..."
                      />
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {editCommentText.length}/500 characters
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowEditPreview(!showEditPreview)}
                          className={`px-3 py-1.5 text-sm rounded-lg ${
                            showEditPreview 
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {showEditPreview ? 'Edit' : 'Preview'}
                        </button>
                        <button
                          onClick={() => setEditCommentId(null)}
                          className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={isSubmitting || !editCommentText.trim()}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                            isSubmitting || !editCommentText.trim()
                              ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-purple-500 text-white hover:bg-purple-600'
                          }`}
                        >
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    {renderCommentContent(comment.text)}
                  </div>
                )}

                {/* Action buttons */}
                {editCommentId !== comment.id && (
                  <div className="mt-2 flex items-center gap-4">
                    <button
                      onClick={() => setReplyToId(comment.id)}
                      className="text-sm text-gray-500 hover:text-purple-500 transition-colors flex items-center gap-1"
                    >
                      <span className="text-base">💬</span> Reply
                    </button>

                    {/* Bearbeiten und Löschen nur für eigene Kommentare */}
                    {comment.user.isCurrentUser && (
                      <>
                        <button
                          onClick={() => startEditComment(comment)}
                          className="text-sm text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1"
                        >
                          <span className="text-base">✏️</span> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                          <span className="text-base">🗑️</span> Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
