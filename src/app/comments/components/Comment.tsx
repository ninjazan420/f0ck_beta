'use client';

import { useState, ReactElement, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { EmojiPicker } from '@/components/EmojiPicker';
import { GifSelector } from '@/components/GifSelector';
import { getImageUrlWithCacheBuster } from '@/lib/utils';

const DEFAULT_AVATAR = '/images/defaultavatar.png';

interface CommentProps {
  data: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      avatar: string | null;
      role?: 'user' | 'premium' | 'moderator' | 'admin' | 'banned';
    };
    post: {
      id: string;
      title: string;
      numericId?: string;
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
  onModDelete?: (id: string) => Promise<void>;
}

export function Comment({ data, onReport, onDelete, onReply, onModDelete }: CommentProps) {
  const { data: session } = useSession();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showGifSelector, setShowGifSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [showEditPreview, setShowEditPreview] = useState(false);
  const [selectedGif, setSelectedGif] = useState<{ url: string, source: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Sicherstellen, dass data.author immer definiert ist
  const author = data.author || { id: '', username: 'Anonymous', avatar: null, role: 'user' };
  
  const formattedDate = new Date(data.createdAt).toLocaleString();

  const getUserUrl = (username: string) => {
    // Kein Link für Anonymous-Nutzer
    if (username === 'Anonymous') return '';
    return `/user/${username.toLowerCase()}`;
  };

  // Role badge rendering function similar to UserProfile component
  const getRoleBadge = (role?: string) => {
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
      default:
        return null;
    }
  };

  // Implement highlight effect for anchor links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === `#comment-${data.id}`) {
        // Highlight the comment
        setIsHighlighted(true);
        
        // Scroll to the comment after a brief delay
        setTimeout(() => {
          const element = document.getElementById(`comment-${data.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          setIsHighlighted(false);
        }, 4000);
      }
    }
  }, [data.id]);

  // Bei Aktivierung des Edit-Modus den aktuellen Text übernehmen
  const handleStartEdit = () => {
    setEditText(data.content);
    setIsEditing(true);
    setShowEditPreview(false);
  };

  // Speichern der Bearbeitung
  const handleSaveEdit = async () => {
    if (!editText.trim() || isSubmitting) return;

    // Sicherstellen, dass eine gültige ID vorhanden ist
    if (!data.id) {
      console.error('Cannot update comment: Invalid or missing ID');
      alert('Fehler beim Aktualisieren des Kommentars: Ungültige ID');
      setIsEditing(false);
      return;
    }

    try {
      setIsSubmitting(true);
      // Log für Debugging
      console.log(`Attempting to update comment with ID: ${data.id}`);
      
      // API-Aufruf zum Aktualisieren des Kommentars
      const response = await fetch(`/api/comments/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editText
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server responded with ${response.status}: ${errorText}`);
        throw new Error(`Failed to update comment: ${response.status}`);
      }

      const updatedComment = await response.json();
      console.log('Comment updated successfully:', updatedComment);

      // Aktualisiere den Kommentar in der UI
      data.content = editText;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Fehler beim Aktualisieren des Kommentars. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if ((!replyText.trim() && !selectedGif) || !onReply || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Füge das GIF am Ende des Kommentars hinzu, wenn eins ausgewählt ist
      let finalContent = replyText;
      if (selectedGif) {
        // Füge den GIF-Platzhalter am Ende des Texts hinzu
        finalContent = finalContent.trim() + ` [GIF:${selectedGif.url}] `;
      }
      
      await onReply(data.id, finalContent);
      setReplyText('');
      setSelectedGif(null);
      setShowPreview(false);
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

    // Sicherstellen, dass eine gültige ID vorhanden ist
    if (!data.id) {
      console.error('Cannot delete comment: Invalid or missing ID');
      alert('Fehler beim Löschen des Kommentars: Ungültige ID');
      return;
    }

    try {
      setIsSubmitting(true);
      // Log für Debugging
      console.log(`Attempting to delete comment with ID: ${data.id}`);
      await onDelete(data.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Fehler beim Löschen des Kommentars. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setReplyText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleGifSelect = (gifData: { url: string, id: string, source: string }) => {
    setSelectedGif({ url: gifData.url, source: gifData.source });
    setShowPreview(true);
    setShowGifSelector(false);
  };

  const canModerate = session?.user?.role && ['moderator', 'admin'].includes(session.user.role);
  
  // Debug-Informationen für die Autorisierung
  console.log('Comment authorization check:', {
    authorId: author.id,
    sessionUserId: session?.user?.id,
    canModerate,
    sessionUserRole: session?.user?.role
  });
  
  const isAuthor = session?.user?.id && author.id && (session.user.id === author.id);
  const isPending = data.status === 'pending';
  const isRejected = data.status === 'rejected';

  if (isRejected && !canModerate) return null;

  // Rendering-Funktion für den Kommentarinhalt
  const renderCommentContent = (text: string) => {
    if (!text) return null;
    
    // Einfacherer GIF-Platzhalter: [GIF:url]
    const gifRegex = /\[GIF:(https?:\/\/[^\]]+)\]/gi;
    
    // Verbesserte Regex für URL-Erkennung - erfasst mehr Bildformate und URLs
    const urlRegex = /(https?:\/\/[^\s]+\.(gif|png|jpg|jpeg|webp|bmp))(?:\?[^\s]*)?/gi;
    
    // Suche nach GIF-Platzhaltern und Standard-URLs
    const gifMatches = Array.from(text.matchAll(gifRegex) || []);
    const urlMatches = text.match(urlRegex) || [];
    
    // Wenn weder GIFs noch Bilder gefunden wurden, gib den Text zurück
    if (gifMatches.length === 0 && urlMatches.length === 0) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }
    
    // Ersetze GIF-Platzhalter und URLs mit Markierungen und teile den Text
    let processedText = text;
    
    // Ersetze zuerst GIF-Platzhalter
    processedText = processedText.replace(gifRegex, '\n[gif-media]\n');
    
    // Dann ersetze URL-Medien, aber nicht die, die bereits als GIF markiert sind
    const tempProcessedText = processedText;
    urlMatches.forEach(url => {
      // Prüfe, ob die URL bereits als GIF verarbeitet wurde
      if (!gifMatches.some(match => match[1] === url) && tempProcessedText.includes(url)) {
        processedText = processedText.replace(url, '\n[url-media]\n');
      }
    });
    
    const textParts = processedText.split('\n');
    const result: ReactElement[] = [];
    let gifIndex = 0;
    let urlIndex = 0;
    
    textParts.forEach((part, index) => {
      if (part === '[gif-media]') {
        if (gifIndex < gifMatches.length) {
          const match = gifMatches[gifIndex];
          const url = match[1];
          const isGiphy = url.includes('giphy.com');
          
          console.log(`Rendering GIF from placeholder: ${url}`);
          
          result.push(
            <div key={`gif-${index}`} className="my-2">
              <Image
                src={url}
                alt="GIF"
                width={400}
                height={300}
                className=""
                unoptimized
              />
              {isGiphy && (
                <div className="text-[10px] text-gray-400 dark:text-gray-500 opacity-50 mt-1 pl-1">
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
          gifIndex++;
        }
      } else if (part === '[url-media]') {
        if (urlIndex < urlMatches.length) {
          // Überspringe URLs, die bereits als GIFs verarbeitet wurden
          while (urlIndex < urlMatches.length && 
                 gifMatches.some(match => match[1] === urlMatches[urlIndex])) {
            urlIndex++;
          }
          
          if (urlIndex < urlMatches.length) {
            const url = urlMatches[urlIndex];
            const cleanUrl = url.split('?')[0];
            const isGiphy = cleanUrl.includes('giphy.com');
            
            console.log(`Rendering URL media: ${cleanUrl}`);
            
            result.push(
              <div key={`media-${index}`} className="my-2">
                <Image
                  src={cleanUrl}
                  alt="Embedded media"
                  width={400}
                  height={300}
                  className=""
                  unoptimized
                />
                {isGiphy && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 opacity-50 mt-0.5 pl-1">
                    <Image 
                      src="/powered_by_giphy.png" 
                      alt="Powered by GIPHY" 
                      width={70} 
                      height={20}
                      unoptimized
                    />
                  </div>
                )}
              </div>
            );
            urlIndex++;
          }
        }
      } else if (part.trim()) {
        result.push(<span key={`text-${index}`} className="whitespace-pre-wrap">{part}</span>);
      }
    });
    
    return result;
  };

  return (
    <div 
      id={`comment-${data.id}`}
      className={`comment-card p-4 rounded-lg transition-all duration-500 ${
        isRejected
          ? 'bg-red-50 border border-red-200 dark:bg-red-950/10 dark:border-red-900/30'
          : isPending
            ? 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/10 dark:border-yellow-900/30'
            : isHighlighted
              ? 'bg-purple-50/50 dark:bg-purple-900/20 border border-gray-200 dark:border-gray-800 ring-4 ring-purple-500/50 dark:ring-purple-500/30'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
      }`}
    >
      {/* Reply to section */}
      {data.replyTo && (
        <div className="mb-3">
          <Link href={data.post ? 
            // Verwende immer die numerische ID, wenn sie vorhanden ist (fallback auf String-ID)
            (data.post.numericId ? `/post/${data.post.numericId}#comment-${data.replyTo.id}` 
              : `/post/${String(data.post.id)}#comment-${data.replyTo.id}`)
            : `#comment-${data.replyTo.id}`} 
            className="block group transition-all duration-200">
              
            <div className="pl-3 py-2 border-l-2 border-purple-400 dark:border-purple-500 
                       bg-purple-50 dark:bg-purple-900/20 rounded-r-md
                       hover:bg-purple-100 dark:hover:bg-purple-900/30 
                       hover:border-l-3 hover:border-purple-500 dark:hover:border-purple-400
                       transition-all duration-200">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-corner-up-left">
                    <polyline points="9 14 4 9 9 4"></polyline>
                    <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                  </svg>
                  Reply to
                </span>
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                  {data.replyTo.author?.username || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-external-link">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-all">
                {data.replyTo.content.length > 100 
                  ? data.replyTo.content.substring(0, 100) + '...'
                  : data.replyTo.content}
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Main comment content */}
      <div className="flex items-start gap-3">
        {author.username === 'Anonymous' ? (
          <div className="flex-shrink-0">
            <Image
              src={author.avatar ? getImageUrlWithCacheBuster(author.avatar) : DEFAULT_AVATAR}
              alt={author.username}
              width={50}
              height={50}
            />
          </div>
        ) : (
          <Link href={getUserUrl(author.username)} className="flex-shrink-0">
            <Image
              src={author.avatar ? getImageUrlWithCacheBuster(author.avatar) : DEFAULT_AVATAR}
              alt={author.username}
              width={50}
              height={50}
            />
          </Link>
        )}

        <div className="flex-grow min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            {author.username === 'Anonymous' ? (
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {author.username}
              </span>
            ) : (
              <Link href={getUserUrl(author.username)} className="font-medium text-gray-900 dark:text-gray-100">
                {author.username}
              </Link>
            )}
            {getRoleBadge(author.role)}
            <Link 
              href={data.post ? 
                // Verwende immer die numerische ID, wenn sie vorhanden ist (fallback auf String-ID)
                (data.post.numericId ? `/post/${data.post.numericId}#comment-${data.id}` 
                  : `/post/${String(data.post.id)}#comment-${data.id}`)
                : `#comment-${data.id}`} 
              className="text-sm text-gray-500 hover:text-purple-500"
              title="Link to the post containing this comment"
            >
              {formattedDate}
            </Link>
            {data.status === 'pending' && (
              <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30">
                Pending
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              {showEditPreview ? (
                <div className="min-h-[100px] p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    {editText ? renderCommentContent(editText) : <span className="text-gray-400 dark:text-gray-500">Nothing to preview</span>}
                  </div>
                </div>
              ) : (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none text-sm"
                  rows={3}
                  title="Edit comment"
                  placeholder="Edit your comment..."
                />
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {editText.length}/500 characters
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
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSubmitting || !editText.trim()}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                      isSubmitting || !editText.trim()
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
              {renderCommentContent(data.content)}
            </div>
          )}

          {/* Action buttons */}
          {!isEditing && (
            <div className="mt-2 flex items-center gap-4">
              {session && (
                <>
                  <button
                    onClick={() => setShowReplyBox(true)}
                    className="text-sm text-gray-500 hover:text-purple-500 transition-colors"
                  >
                    Reply
                  </button>
                  {!isAuthor && (
                    <button
                      onClick={() => setShowReportDialog(true)}
                      className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Report
                    </button>
                  )}
                  {(isAuthor || canModerate) && (
                    <button
                      onClick={handleDelete}
                      className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                      disabled={isSubmitting}
                    >
                      Delete
                    </button>
                  )}
                  {isAuthor && (
                    <button
                      onClick={handleStartEdit}
                      className="text-sm text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {/* Moderatorlöschknopf */}
                  {onModDelete && canModerate && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => onModDelete(data.id)}
                        className="px-3 py-1 text-sm rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 hover:bg-red-500/30"
                        disabled={isSubmitting}
                      >
                        Delete (Mod)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Reply box */}
          {showReplyBox && (
            <div className="mt-4">
              <textarea
                value={replyText}
                onChange={(e) => {
                  setReplyText(e.target.value);
                  if (selectedGif) {
                    setSelectedGif(null);
                  }
                }}
                placeholder="Write a reply..."
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none text-sm"
                rows={3}
                name="reply"
              />
              
              {selectedGif && showPreview && (
                <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 bg-white/20 dark:bg-gray-800/20 rounded-lg">
                  <div className="relative">
                    <button 
                      onClick={() => {setSelectedGif(null); setShowPreview(false);}}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/90"
                      title="Remove GIF"
                    >
                      ×
                    </button>
                    <div className="my-2">
                      <Image
                        src={selectedGif.url}
                        alt="Selected GIF"
                        width={400}
                        height={300}
                        className=""
                        unoptimized
                      />
                      {selectedGif.source === 'giphy' && (
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 opacity-50 mt-0.5 pl-1">
                          <Image 
                            src="/powered_by_giphy.png" 
                            alt="Powered by GIPHY" 
                            width={70} 
                            height={20}
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1 text-center">
                    Dieses GIF wird mit Ihrem Kommentar gesendet.
                  </div>
                </div>
              )}

              <div className="mt-3 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {replyText.length}/500 characters
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
                    onClick={() => setShowReplyBox(false)}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || isSubmitting}
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
                    ) : 'Reply'}
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
    </div>
  );
}
