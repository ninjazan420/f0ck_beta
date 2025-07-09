'use client';
import { useState, useEffect, ReactElement, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EmojiPicker } from '@/components/EmojiPicker';
import { GifSelector } from '@/components/GifSelector';
import { useSession } from 'next-auth/react';
import { MentionService } from '@/lib/services/mentionService';
import { MentionSelector } from '@/app/comments/components/MentionSelector';

const DEFAULT_AVATAR = '/images/defaultavatar.png';

interface Comment {
  id: string;
  user: {
    id: string | null;
    name: string;
    avatar: string | null;
    isAnonymous?: boolean;
    role?: 'user' | 'premium' | 'moderator' | 'admin' | 'banned';
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
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentionUsers, setMentionUsers] = useState<any[]>([]);
  const [mentionPosition, setMentionPosition] = useState<{ top: number, left: number } | null>(null);
  const [highlightedMentionIndex, setHighlightedMentionIndex] = useState(0);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [mentionSearchDebug, setMentionSearchDebug] = useState<string>("No @-text detected");
  const [mentionError, setMentionError] = useState<string | null>(null);

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

  // Füge einen neuen useEffect hinzu, um den Post-Status abzurufen
  useEffect(() => {
    async function fetchPostStatus() {
      try {
        const response = await fetch(`/api/posts/${postId}/status`);
        if (response.ok) {
          const data = await response.json();
          setCommentsDisabled(!!data.commentsDisabled);
        }
      } catch (error) {
        console.error('Error fetching post status:', error);
      }
    }

    fetchPostStatus();
  }, [postId]);

  // Hilfsfunktionen aus der Comment-Komponente
  const getUserUrl = (username: string) => {
    // Kein Link für Anonymous-Nutzer
    if (username === 'Anonymous') return '';
    return `/user/${username.toLowerCase()}`;
  };

  // Role badge rendering function similar to UserProfile component
  const getRoleBadge = (role?: string, username?: string) => {
    // Debug: Log the role to see what we're getting
    if (process.env.NODE_ENV !== 'production') {
      console.log('PostComment author role:', role, 'for user:', username);
    }

    switch(role) {
      case 'banned':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/40 text-white border border-black/50">
            BANNED ✝
          </span>
        );
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-red-500 to-orange-500 text-white">
            ADMIN
          </span>
        );
      case 'moderator':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/40 text-white border border-blue-500/50">
            MOD
          </span>
        );
      case 'premium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/40 text-white border border-purple-500/50">
            PREMIUM
          </span>
        );
      case 'user':
        // Don't show badge for regular users
        return null;
      default:
        return null;
    }
  };

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

      // Explizit isAnonymous für nicht-eingeloggte Benutzer setzen
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
            isCurrentUser: isFromCurrentUser, // Neues Flag für aktuelle Benutzerkommentare
            role: comment.author?.role || undefined
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
          isCurrentUser: true, // Dieser Kommentar stammt vom aktuellen Benutzer
          role: savedComment.author?.role || undefined
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

  // Verbesserte handleInputChange Funktion mit Zeichenlimit-Prüfung
  const handleInputChange = useCallback(async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const isReplyMode = !!replyToId;

    // Prüfe Zeichenlimit von 500
    if (text.length > 500) {
      // Kürze den Text auf 500 Zeichen
      const truncatedText = text.substring(0, 500);

      if (isReplyMode) {
        setReplyText(truncatedText);
      } else {
        setNewComment(truncatedText);
      }

      // Setze den Cursor an die richtige Position
      setTimeout(() => {
        if (e.target) {
          e.target.setSelectionRange(500, 500);
        }
      }, 0);

      return;
    }

    if (isReplyMode) {
      setReplyText(text);
    } else {
      setNewComment(text);
    }

    // Debug-Ausgabe zurücksetzen
    setMentionError(null);

    // @-Erwähnungen verarbeiten
    const cursorPosition = e.target.selectionStart || 0;
    const textUpToCursor = text.substring(0, cursorPosition);

    // Debug: Log the input text and cursor position
    if (process.env.NODE_ENV !== 'production') {
      console.log("Input text:", text);
      console.log("Cursor position:", cursorPosition);
      console.log("Text up to cursor:", textUpToCursor);
    }

    // Finde den letzten @-Erwähnungs-Anfang vor dem Cursor
    const lastAtSymbol = textUpToCursor.lastIndexOf('@');

    if (lastAtSymbol >= 0) {
      console.log("@ Symbol found at position:", lastAtSymbol);

      // Prüfen, ob vor dem @ ein Leerzeichen oder der Textanfang ist
      const isValidMentionStart = lastAtSymbol === 0 ||
                               /\s/.test(textUpToCursor[lastAtSymbol - 1]) ||
                               textUpToCursor[lastAtSymbol - 1] === '\n';

      const textBetweenAtAndCursor = textUpToCursor.substring(lastAtSymbol + 1);
      const hasSpace = /\s/.test(textBetweenAtAndCursor);

      setMentionSearchDebug(`@-Text: "${textBetweenAtAndCursor}", Valid: ${isValidMentionStart}, HasSpace: ${hasSpace}`);


      if (isValidMentionStart && !hasSpace) {
        setMentionSearch(textBetweenAtAndCursor);
        console.log("Searching for:", textBetweenAtAndCursor);

        // Position für den Vorschlagsblock berechnen
        if (commentInputRef.current) {
          const textarea = commentInputRef.current;
          const textareaRect = textarea.getBoundingClientRect();

          // Verbesserte Positionierung - direkt unter dem Cursor
          const cursorCoords = getCaretCoordinates(textarea, textarea.selectionStart || 0);

          // Berechne die absolute Position im Viewport
          setMentionPosition({
            top: cursorCoords.top + cursorCoords.height,
            left: cursorCoords.left
          });
        }

        try {

          // Benutzer suchen
          if (textBetweenAtAndCursor.length > 0) {
            console.log("API call with:", textBetweenAtAndCursor);
            const users = await MentionService.searchUsers(textBetweenAtAndCursor);
            console.log("Found users:", users);
            setMentionUsers(users);
            setHighlightedMentionIndex(0);
          } else {
            // For empty search text, show popular/active users
            console.log("Showing active users");
            const recentUsers = await MentionService.searchUsers('', 5);
            console.log("Active users:", recentUsers);
            setMentionUsers(recentUsers);
            setHighlightedMentionIndex(0);
          }

        } catch (error) {
          console.error("Error searching users:", error);
          setMentionError(`Search error: ${error}`);
          setMentionUsers([]);
        }
        return;
      }
    } else {
      // Wenn kein gültiges @-Muster gefunden wurde, Mentions-UI zurücksetzen
      setMentionSearch(null);
      setMentionUsers([]);
    }
  }, [replyToId]);

  // Verbesserte Funktion zur Berechnung der Cursor-Position
  function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
    // Erstelle ein temporäres Element mit den gleichen Styles
    const div = document.createElement('div');
    const style = div.style;
    const computed = getComputedStyle(element);

    // Kopiere die wichtigen Styles für die Textdarstellung
    style.whiteSpace = 'pre-wrap';
    style.wordWrap = 'break-word';
    style.position = 'absolute';
    style.visibility = 'hidden';
    style.overflow = 'hidden';
    style.width = computed.width;
    style.height = 'auto';
    style.fontSize = computed.fontSize;
    style.fontFamily = computed.fontFamily;
    style.lineHeight = computed.lineHeight;
    style.padding = computed.padding;
    style.border = computed.border;
    style.boxSizing = computed.boxSizing;

    // Kopiere weitere relevante Styles
    const properties = [
      'direction', 'overflowX', 'overflowY',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch',
      'fontSizeAdjust', 'textAlign', 'textTransform',
      'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing'
    ];

    properties.forEach(prop => {
      style[prop as any] = computed[prop as any];
    });

    // Füge das Element zum DOM hinzu
    document.body.appendChild(div);

    // Teile den Text an der Cursor-Position
    const text = element.value.substring(0, position);
    const textNode = document.createTextNode(text);
    const span = document.createElement('span');
    span.appendChild(document.createTextNode(element.value.substring(position) || '.'));

    div.appendChild(textNode);
    div.appendChild(span);

    // Berechne die Position relativ zum Viewport
    const elementRect = element.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    // Berechne die Position relativ zum Textarea
    const coordinates = {
      top: span.offsetTop + parseInt(computed.paddingTop) + element.scrollTop,
      left: span.offsetLeft + parseInt(computed.paddingLeft),
      height: parseInt(computed.lineHeight)
    };

    // Entferne das temporäre Element
    document.body.removeChild(div);

    return coordinates;
  }

  // Benutzer aus Vorschlagsliste auswählen
  const handleMentionSelect = (user: any) => {
    const isReplyMode = !!replyToId;
    const currentText = isReplyMode ? replyText : newComment;
    const cursorPosition = commentInputRef.current?.selectionStart || 0;

    // Finde den @-Text und ersetze ihn durch den vollständigen Benutzernamen
    const textUpToCursor = currentText.substring(0, cursorPosition);
    const lastAtSymbol = textUpToCursor.lastIndexOf('@');

    if (lastAtSymbol >= 0) {
      const newText =
        currentText.substring(0, lastAtSymbol) +
        `@${user.username} ` +
        currentText.substring(cursorPosition);

      if (isReplyMode) {
        setReplyText(newText);
      } else {
        setNewComment(newText);
      }

      // Setze den Cursor nach dem eingefügten Benutzernamen
      setTimeout(() => {
        if (commentInputRef.current) {
          const newPosition = lastAtSymbol + user.username.length + 2; // +2 für @ und Leerzeichen
          commentInputRef.current.focus();
          commentInputRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }

    setMentionSearch(null);
    setMentionUsers([]);
  };

  // Taste für Erwähnungsauswahl
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Wenn Mentions-Vorschläge angezeigt werden
    if (mentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedMentionIndex(prev =>
          prev < mentionUsers.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedMentionIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && mentionUsers.length > 0) {
        e.preventDefault();
        handleMentionSelect(mentionUsers[highlightedMentionIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMentionSearch(null);
        setMentionUsers([]);
      }
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
                  <Image
                    src="/powered_by_giphy.png"
                    alt="Powered by GIPHY"
                    width={150}
                    height={22}
                    unoptimized
                  />
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

  // Füge diese Funktion zur Klasse hinzu
  useEffect(() => {
    // Wenn die Komponente gemountet wird, initialisiere das leere Suchfeld
    if (commentInputRef.current && session?.user) {
      const fetchInitialUsers = async () => {
        try {
          const recentUsers = await MentionService.searchUsers('', 5);
          setMentionUsers(recentUsers);
        } catch (error) {
          console.error("Failed to fetch initial users:", error);
        }
      };

      // Initialisierung nur bei Bedarf ausführen
      commentInputRef.current.addEventListener('focus', () => {
        if (mentionUsers.length === 0) {
          fetchInitialUsers();
        }
      });
    }
  }, [session, mentionUsers.length]);

  // Für das visuelle Feedback in Echtzeit
  const formatTextWithMentions = (text: string) => {
    if (!text) return null;

    // Ersetze @username mit einer hervorgehobenen Version
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const parts = text.split(mentionRegex);

    if (parts.length <= 1) return text;

    // Erstelle formatierte Vorschau
    const formattedPreview = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Normaler Text
        formattedPreview.push(parts[i]);
      } else {
        // Benutzername (Teil der einem @ folgte)
        const username = parts[i];
        formattedPreview.push(`<span class="mention">@${username}</span>`);
      }
    }

    return formattedPreview.join('');
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>

      {commentsDisabled ? (
        <div className="p-4 bg-red-50/50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-red-500 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-red-700 dark:text-red-300">Comments have been disabled by a moderator</h3>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                This comment section has been locked. Existing comments are still visible, but you cannot add new ones.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Kommentarformular */}
          <div className="mt-4 relative">
        <textarea
          ref={commentInputRef}
          placeholder={replyToId ? "Write a reply..." : "Leave a comment..."}
          value={replyToId ? replyText : newComment}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          rows={4}
        />

        {/* Debug-Anzeige (nur während der Entwicklung) */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="text-xs text-gray-500 mt-1">
            <div>{mentionSearchDebug}</div>
            {mentionError && <div className="text-red-500">{mentionError}</div>}
            <div>Suggestions: {mentionUsers.length}</div>
          </div>
        )}

        {/* Erwähnung wird eingegeben - zeige Vorschläge */}
        {mentionSearch !== null && mentionUsers.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              zIndex: 50,
              maxHeight: '300px',
              overflowY: 'auto',
              width: 'auto',
              maxWidth: '90%',
              marginTop: '4px'
            }}
            className="mention-selector-container"
          >
            <MentionSelector
              users={mentionUsers}
              onSelect={handleMentionSelect}
              onClose={() => {
                setMentionSearch(null);
                setMentionUsers([]);
              }}
              highlightedIndex={highlightedMentionIndex}
            />
          </div>
        )}

        {/* No results found */}
        {mentionSearch !== null && mentionUsers.length === 0 && mentionSearch.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              zIndex: 50,
              marginTop: '4px'
            }}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-sm"
          >
            <div className="text-gray-500 dark:text-gray-400">
              No users found for "@{mentionSearch}"
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Post anonymously
              </span>
            </label>
          </div>

          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</div>
            <div
              className="prose prose-sm dark:prose-dark max-w-none"
              dangerouslySetInnerHTML={{
                __html: formatTextWithMentions(newComment)
              }}
            />
          </div>
        )}
      </div>
        </>
      ) : (
        <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="mb-2 text-gray-600 dark:text-gray-400">
            Please log in to leave a comment.
          </p>
          <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
            Sign in
          </Link>
        </div>
      )}

      {/* Kommentarliste - diese wird auch angezeigt, wenn Kommentare deaktiviert sind */}
      <CommentList
        postId={postId}
        limit={10}
        showModActions={true}
        infiniteScroll={true}
        showPostPreview={false}
      />
    </div>
  );
}
