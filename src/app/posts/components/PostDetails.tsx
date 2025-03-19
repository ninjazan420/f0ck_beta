'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostMetadata } from './PostMetadata';
import { PostTags } from './PostTags';
import { PostComments } from './PostComments';
import { ReverseSearch } from './ReverseSearch';
import { CommentList } from '@/app/comments/components/CommentList';
import { getImageUrlWithCacheBuster } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { EmojiPicker } from '@/components/EmojiPicker';
import { GifSelector } from '@/components/GifSelector';
import { PostModerator } from './PostModerator';
import { PostTagEditor } from '@/app/posts/components/PostTagEditor';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface PostData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  uploadDate: string;
  uploader: {
    id: string;
    name: string;
    avatar: string | null;
    bio: string;
    premium: boolean;
    admin: boolean;
    moderator: boolean;
    member: boolean;
    joinDate: string;
    stats: {
      totalPosts: number;
      totalLikes: number;
      totalViews: number;
      favorites?: number;
      comments?: number;
      tags?: number;
      level: number;
      xp: number;
      xpNeeded: number;
    };
  };
  stats: {
    views: number;
    likes: number;
    dislikes: number;
    comments: number;
    favorites: number;
  };
  meta: {
    width: number;
    height: number;
    size: number;
    format: string;
    source: string | null;
  };
  tags: Array<{
    id: string;
    name: string;
    type: 'general' | 'character' | 'copyright' | 'artist' | 'meta';
    count: number;
  }>;
  contentRating: 'safe' | 'sketchy' | 'unsafe';
  isAnimated: boolean;
}

const MOCK_POST: PostData = {
  id: "post-1",
  title: "Amazing Artwork #1",
  description: "This is a beautiful piece of art that I found.",
  imageUrl: "https://picsum.photos/1200/800",       // Geändert zu picsum
  thumbnailUrl: "https://picsum.photos/1200/800",   // Geändert zu picsum
  uploadDate: "2023-12-24T12:00:00Z",
  uploader: {
    id: "user1",
    name: "User1",
    avatar: null,
    bio: '',
    premium: true,
    admin: false,
    moderator: false,
    member: true,
    joinDate: "2023-01-15T08:30:00Z",
    stats: {
      totalPosts: 342,
      totalLikes: 15678,
      totalViews: 89432,
      level: 42,
      xp: 8234,
      xpNeeded: 10000
    }
  },
  stats: {
    views: 1234,
    likes: 567,
    dislikes: 12,
    comments: 89,
    favorites: 123
  },
  meta: {
    width: 1200,
    height: 800,
    size: 1024576, // in bytes
    format: "PNG",
    source: "https://original-source.com/image.png"
  },
  tags: [
    { id: "1", name: "artwork", type: "general", count: 5432 },
    { id: "2", name: "digital art", type: "meta", count: 3211 },
    { id: "3", name: "character name", type: "character", count: 789 },
    { id: "4", name: "artist name", type: "artist", count: 456 }
  ],
  contentRating: "safe",
  isAnimated: false
};

export function PostDetails({ postId }: { postId: string }) {
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Zustände für Kommentare
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(!session?.user);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifSelector, setShowGifSelector] = useState(false);
  const [selectedGif, setSelectedGif] = useState<{ url: string, source: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshComments, setRefreshComments] = useState(0); // State für Kommentar-Aktualisierung
  const [commentsDisabled, setCommentsDisabled] = useState(false);

  // Aktualisiere den isAnonymous-Status, wenn sich der Session-Status ändert
  useEffect(() => {
    setIsAnonymous(!session?.user);
  }, [session]);
  
  // Funktionen für Kommentare
  const handleEmojiSelect = (emoji: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      setNewComment(before + emoji + after);
    }
    setShowEmojiPicker(false);
  };

  const handleGifSelect = (gifData: { url: string, id: string, source: string }) => {
    setSelectedGif({ url: gifData.url, source: gifData.source });
    setShowGifSelector(false);
  };

  const handleSubmitComment = async () => {
    if ((!newComment.trim() && !selectedGif) || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      let finalContent = newComment;
      if (selectedGif) {
        finalContent = finalContent.trim() + ` [GIF:${selectedGif.url}] `;
      }
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: finalContent,
          postId,
          isAnonymous
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to post comment: ${errorText}`);
        throw new Error('Failed to post comment');
      }

      // Die API sendet den erstellten Kommentar zurück
      const savedComment = await response.json();
      console.log('Comment posted successfully:', savedComment);

      // Zurücksetzen des Formulars
      setNewComment('');
      setSelectedGif(null);
      setShowPreview(false);
      
      // Nur die Kommentarliste aktualisieren
      setRefreshComments(prev => prev + 1);
      
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderung von Kommentarinhalten mit GIFs und Links
  const renderCommentContent = (text: string) => {
    if (!text) return null;
    
    // GIF-Vorschau anzeigen, wenn vorhanden
    if (selectedGif) {
      return (
        <div className="space-y-2">
          <span className="whitespace-pre-wrap">{text}</span>
          {selectedGif && (
            <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-sm">
              <Image
                src={selectedGif.url}
                alt="GIF"
                width={300}
                height={200}
                className="w-full h-auto"
                unoptimized={true}
              />
              <div className="bg-black/10 dark:bg-white/10 px-2 py-1 text-[10px] text-gray-600 dark:text-gray-400">
                via {selectedGif.source}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Einfacher Text für die Vorschau
    return <span className="whitespace-pre-wrap">{text}</span>;
  };

  // Voting Handler
  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/posts/${postId}`);
      return;
    }
    
    // Vermeide mehrere Anfragen gleichzeitig
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Neue, vereinheitlichte API verwenden
      const endpoint = `/api/posts/${postId}/interactions`;
      
      // Bestimme, ob wir hinzufügen oder entfernen
      const isLike = voteType === 'like';
      const shouldRemove = isLike ? userVote === 'like' : userVote === 'dislike';
      
      console.log(`Sending interaction request with type: ${voteType}, remove: ${shouldRemove}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: voteType,
          remove: shouldRemove
        })
      });
      
      console.log(`Vote response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to ${shouldRemove ? 'remove' : 'add'} ${voteType}: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Vote response data:`, data);
      
      // Update der lokalen Zustände mit den genauen Werten aus der API
      setPost(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            likes: data.likeCount,
            dislikes: data.dislikeCount
          }
        };
      });
      
      // Update des Benutzervotings basierend auf dem API-Ergebnis
      if (isLike) {
        setUserVote(data.liked ? 'like' : null);
      } else {
        setUserVote(data.disliked ? 'dislike' : null);
      }
    } catch (error) {
      console.error(`Error with vote operation:`, error);
      alert(`Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Favorite Handler
  const handleFavorite = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/posts/${postId}`);
      return;
    }
    
    // Vermeide mehrere Anfragen gleichzeitig
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const endpoint = `/api/posts/${postId}/favorite`;
      
      console.log(`Sending ${method} request to ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Favorite response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to ${method} favorite: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Favorite response data:`, data);
      
      // Update der lokalen Zustände
      setIsFavorited(!isFavorited);
      setPost(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          favorites: data.favoriteCount
        }
      }));
      
      // Benachrichtigung anzeigen
      toast.success(
        isFavorited 
          ? 'Aus Favoriten entfernt' 
          : 'Zu Favoriten hinzugefügt'
      );
      
      // Router aktualisieren, damit alle Komponenten die neue Daten erhalten
      router.refresh();
      
    } catch (error) {
      console.error('Error handling favorite:', error);
      toast.error('Fehler beim Aktualisieren der Favoriten');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role badge rendering function similar to the one used in comments
  const getRoleBadge = (isAdmin: boolean, isModerator: boolean, isPremium: boolean) => {
    if (isAdmin) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r from-red-500 to-orange-500 text-white">
          ADMIN
        </span>
      );
    } else if (isModerator) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/40 text-white border border-blue-500/50">
          MOD
        </span>
      );
    } else if (isPremium) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/40 text-white border border-purple-500/50">
          PREMIUM
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-500/40 text-white border border-gray-500/50">
          MEMBER
        </span>
      );
    }
  };

  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          setPost(null);
          setLoading(false);
          return;
        }

        // Für alle Posts verwenden wir die API-Daten
        const postData = await response.json();
        // Detailliertes Debugging für Bio-Daten
        console.log('API response für Post:', JSON.stringify(postData, null, 2));
        console.log('API author data:', postData.author);
        
        // Detailliertes Debugging für Tag-Daten
        console.log('API tags data:', postData.tags);
        console.log('Tags type:', typeof postData.tags);
        console.log('Is tags array?', Array.isArray(postData.tags));
        if (Array.isArray(postData.tags)) {
          console.log('Tags length:', postData.tags.length);
          console.log('First tag (if exists):', postData.tags[0]);
        }
        
        if (postData.author) {
          console.log('Author bio exists?', postData.author.hasOwnProperty('bio'));
          console.log('Author bio value:', postData.author.bio);
          console.log('Author bio type:', typeof postData.author.bio);
          console.log('Populate fields in author:', Object.keys(postData.author).join(', '));
        }
        setPost({
          id: postId,
          title: postData.title,
          description: postData.description || '',
          imageUrl: postData.imageUrl,
          thumbnailUrl: postData.thumbnailUrl,
          uploadDate: new Date(postData.createdAt).toISOString(),
          uploader: postData.author ? {
            id: postData.author._id,
            name: postData.author.username,
            avatar: postData.author.avatar,
            bio: postData.author.bio || '',
            premium: Boolean(postData.author.premium),
            admin: postData.author.role === 'admin',
            moderator: postData.author.role === 'moderator',
            member: postData.author.role === 'member' || !postData.author.role,
            joinDate: new Date(postData.author.createdAt).toISOString(),
            stats: postData.author.stats || {
              totalPosts: 0,
              totalLikes: 0,
              totalViews: 0,
              level: 1,
              xp: 0,
              xpNeeded: 100
            }
          } : {
            id: 'anonymous',
            name: 'Anonymous',
            avatar: null,
            bio: '',
            premium: false,
            admin: false,
            moderator: false,
            member: true,
            joinDate: new Date(postData.createdAt).toISOString(),
            stats: {
              totalPosts: 0,
              totalLikes: 0,
              totalViews: 0,
              level: 1,
              xp: 0,
              xpNeeded: 100
            }
          },
          stats: postData.stats,
          meta: postData.meta,
          tags: postData.tags || [],
          contentRating: postData.contentRating,
          isAnimated: false
        });
      } catch (error) {
        console.error('Failed to fetch post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    async function fetchPostStatus() {
      try {
        const response = await fetch(`/api/posts/${postId}/status`);
        if (response.ok) {
          const data = await response.json();
          console.log("PostDetails received post status:", data);
          setCommentsDisabled(!!data.commentsDisabled || !!data.hasCommentsDisabled);
        }
      } catch (error) {
        console.error('Error fetching post status:', error);
      }
    }
    
    fetchPostStatus();
  }, [postId]);

  useEffect(() => {
    if (session?.user && post) {
      async function loadUserInteractions() {
        try {
          const response = await fetch(`/api/posts/${postId}/user-interactions`);
          if (response.ok) {
            const data = await response.json();
            setUserVote(data.liked ? 'like' : data.disliked ? 'dislike' : null);
            setIsFavorited(data.favorited);
          }
        } catch (error) {
          console.error('Error loading user interactions:', error);
        }
      }
      
      loadUserInteractions();
    }
  }, [session, postId, post]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 rounded-xl bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-center">
        <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] text-red-800 dark:text-red-200 mb-2">
          Post not found
        </h2>
        <p className="text-red-600 dark:text-red-300">
          The post with ID &quot;{postId}&quot; does not exist.
        </p>
      </div>
    );
  }

  // Extrahieren der Tag-Namen für den TagEditor
  const tagNames = Array.isArray(post.tags) 
    ? post.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
    : [];

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
        {/* Left Column - Image and Comments */}
        <div className="space-y-6">
          {/* Image Container */}
          <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
            <Image
              src={getImageUrlWithCacheBuster(post.imageUrl)}
              alt={post.title}
              width={800}
              height={600}
              className="w-full h-auto"
              unoptimized={true}
            />
            
            {/* Content Rating Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                post.contentRating === 'safe' 
                  ? 'bg-green-500/40 text-white border border-green-500/50'
                  : post.contentRating === 'sketchy'
                    ? 'bg-yellow-500/40 text-white border border-yellow-500/50'
                    : 'bg-red-500/40 text-white border border-red-500/50'
              }`}>
                {post.contentRating.toUpperCase()}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => handleVote('like')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                  userVote === 'like'
                    ? 'bg-green-500/80 text-white'
                    : 'bg-gray-900/50 hover:bg-gray-900/60 text-white backdrop-blur-sm'
                }`}
              >
                <span className="text-base">👍</span>
                <span>{post.stats.likes}</span>
              </button>
              <button
                onClick={() => handleVote('dislike')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                  userVote === 'dislike'
                    ? 'bg-red-500/80 text-white'
                    : 'bg-gray-900/50 hover:bg-gray-900/60 text-white backdrop-blur-sm'
                }`}
              >
                <span className="text-base">👎</span>
                <span>{post.stats.dislikes}</span>
              </button>
              <button
                onClick={handleFavorite}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                  isFavorited
                    ? 'bg-purple-500/80 text-white'
                    : 'bg-gray-900/50 hover:bg-gray-900/60 text-white backdrop-blur-sm'
                }`}
              >
                <span className="text-base">{isFavorited ? '❤️' : '🤍'}</span>
                <span>{post.stats.favorites}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            
            {/* Kommentarbox oder Hinweis, je nach Status */}
            {commentsDisabled ? (
              <div className="p-4 bg-red-50/50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30 my-4">
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
                      Existing comments remain visible, but new comments cannot be added.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Add a Comment</h3>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Post Anonymously
                      </span>
                    </label>
                    {showPreview ? (
                      <button
                        onClick={() => setShowPreview(false)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowPreview(true)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        disabled={!newComment}
                      >
                        Preview
                      </button>
                    )}
                  </div>
                </div>
                
                {showPreview ? (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 min-h-[100px] mb-3">
                    {renderCommentContent(newComment)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 resize-none text-sm"
                      rows={5}
                    />
                    
                    {/* GIF-Vorschau */}
                    {selectedGif && (
                      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-sm">
                        <Image
                          src={selectedGif.url}
                          alt="GIF"
                          width={300}
                          height={200}
                          className="w-full h-auto"
                          unoptimized={true}
                        />
                        <div className="bg-black/10 dark:bg-white/10 px-2 py-1 text-[10px] text-gray-600 dark:text-gray-400">
                          via {selectedGif.source}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-gray-500">
                    {newComment.length}/500 characters
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowGifSelector(!showGifSelector);
                        setShowEmojiPicker(false);
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      🎨 GIF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowGifSelector(false);
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      😊 Emoji
                    </button>
                    <button
                      onClick={() => setNewComment('')}
                      className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitComment}
                      disabled={(!newComment.trim() && !selectedGif) || isSubmitting}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        (!newComment.trim() && !selectedGif) || isSubmitting
                          ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
                
                {showEmojiPicker && (
                  <EmojiPicker
                    onSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
                
                {showGifSelector && (
                  <GifSelector
                    onSelect={handleGifSelect}
                    onClose={() => setShowGifSelector(false)}
                  />
                )}
              </div>
            )}
            
            <CommentList 
              postId={postId} 
              status="approved" 
              limit={20}
              key={`comments-${refreshComments}`}
            />
          </div>
        </div>

        {/* Right Column - Metadata and Tags */}
        <div className="space-y-6">
          {/* Uploader Info - mit korrekten Links */}
          <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
            <div className="flex gap-3">
              {/* Avatar column - nur verlinken, wenn kein anonymer Upload */}
              {post.uploader.name !== 'Anonymous' ? (
                <Link href={`/user/${post.uploader.name}`} className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {post.uploader.avatar ? (
                      <Image 
                        src={getImageUrlWithCacheBuster(post.uploader.avatar)} 
                        alt={post.uploader.name} 
                        width={64} 
                        height={64} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-2xl text-gray-400">
                        {post.uploader.name[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {post.uploader.avatar ? (
                      <Image 
                        src={getImageUrlWithCacheBuster(post.uploader.avatar)} 
                        alt={post.uploader.name} 
                        width={64} 
                        height={64} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-2xl text-gray-400">
                        {post.uploader.name[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* User info column */}
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  {post.uploader.name !== 'Anonymous' ? (
                    <Link href={`/user/${post.uploader.name}`} className="text-lg font-medium hover:underline">
                      {post.uploader.name}
                    </Link>
                  ) : (
                    <span className="text-lg font-medium">
                      {post.uploader.name}
                    </span>
                  )}
                  {getRoleBadge(post.uploader.admin, post.uploader.moderator, post.uploader.premium)}
                </div>
                
                {/* Bio line if exists */}
                {post.uploader.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {post.uploader.bio}
                  </p>
                )}
                
                {/* Member since line */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Member since {new Date(post.uploader.joinDate).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            {/* User Stats - Mit klickbaren Elementen aber ursprünglichem Design */}
            <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400 space-x-3 border-t pt-2 border-gray-200 dark:border-gray-700">
              <Link href={`/posts?uploader=${post.uploader.name}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                <span>{post.uploader.stats?.uploads || 0} uploads</span>
              </Link>
              <Link href={`/comments?author=${post.uploader.name}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                <span>{post.uploader.stats?.comments || 0} comments</span>
              </Link>
              <Link href={`/posts?liked=${post.uploader.name}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                <span>{post.uploader.stats?.likes || 0} likes</span>
              </Link>
              <Link href={`/posts?favorited=${post.uploader.name}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                <span>{post.uploader.stats?.favorites || 0} favs</span>
              </Link>
              <Link href={`/tags?creator=${post.uploader.name}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                <span>{post.uploader.stats?.tags || 0} tags</span>
              </Link>
            </div>
          </div>

          {/* Description */}
          {post.description && (
            <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {post.description}
              </p>
            </div>
          )}

          {/* Tags - mit postId übergeben */}
          <PostTags tags={post.tags} postId={post.id} />

          {/* Moderator Actions */}
          <PostModerator postId={post.id} />

          {/* Reverse Image Search */}
          <ReverseSearch imageUrl={post.imageUrl} />
          
          {/* Metadata */}
          <PostMetadata meta={{...post.meta, uploadDate: post.uploadDate}} />
        </div>
      </div>
    </div>
  );
}

