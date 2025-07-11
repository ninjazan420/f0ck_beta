'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { PostTagEditor } from '@/app/posts/components/PostTagEditor';
import { PostModerator } from '@/app/posts/components/PostModerator';
import Link from 'next/link';

export default function PostContent({ postData, postId }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(postData.stats?.likes || 0);
  const [dislikeCount, setDislikeCount] = useState(postData.stats?.dislikes || 0);
  const [favoriteCount, setFavoriteCount] = useState(postData.stats?.favorites || 0);
  const [commentCount, setCommentCount] = useState(postData.stats?.comments || 0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Konvertieren der Tags in das richtige Format
  const tagNames = Array.isArray(postData.tags)
    ? postData.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
    : [];

  // Lade den Benutzer-Interaktionsstatus und aktuelle Stats beim Laden der Komponente
  useEffect(() => {
    async function loadData() {
      try {
        // Lade Benutzer-Interaktionen, wenn ein Benutzer eingeloggt ist
        if (session?.user) {
          const interactionsResponse = await fetch(`/api/posts/${postId}/user-interactions`);
          if (interactionsResponse.ok) {
            const data = await interactionsResponse.json();
            setLiked(data.liked);
            setDisliked(data.disliked);
            setFavorited(data.favorited);
          }
        }

        // Lade aktuelle Stats (einheitlich wie bei anderen Seiten)
        const statsResponse = await fetch(`/api/posts/batch-stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postIds: [postId] })
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          const currentStats = statsData[postId];
          if (currentStats) {
            setLikeCount(currentStats.likes || 0);
            setDislikeCount(currentStats.dislikes || 0);
            setFavoriteCount(currentStats.favorites || 0);
            setCommentCount(currentStats.comments || 0);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }

    loadData();
  }, [postId, session]);

  const handleLike = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/post/${postId}`);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Aktuellen Zustand sichern
      const currentLiked = liked;
      const currentLikeCount = likeCount;
      const currentDisliked = disliked;
      const currentDislikeCount = dislikeCount;

      // UI optimistisch aktualisieren
      setLiked(!liked);
      setLikeCount(prev => prev + (liked ? -1 : 1));

      // Wenn der Benutzer bereits einen Dislike gegeben hat, entferne diesen
      if (disliked && !liked) {
        setDisliked(false);
        setDislikeCount(prev => Math.max(0, prev - 1));
      }

      const method = liked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${postId}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Daten aus der Antwort lesen
        const data = await response.json();

        // Server-Zustand übernehmen
        setLiked(data.liked);
        setLikeCount(data.likeCount);

        // Wenn ein Dislike entfernt wurde, aktualisiere auch den Dislike-Status
        if (data.dislikeCount !== undefined) {
          setDislikeCount(data.dislikeCount);
          setDisliked(false);
        }

        // Feedback zeigen
        const message = data.message || (liked ? 'Like entfernt' : 'Beitrag geliked');
        toast.success(message);

        // Aktualisiere die Seite
        router.refresh();
      } else {
        // Bei Fehler alten Zustand wiederherstellen
        setLiked(currentLiked);
        setLikeCount(currentLikeCount);
        setDisliked(currentDisliked);
        setDislikeCount(currentDislikeCount);

        // Fehlermeldung zeigen
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || 'Fehler bei der Aktualisierung des Likes');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Fehler beim Aktualisieren des Likes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDislike = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/post/${postId}`);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Aktuellen Zustand sichern
      const currentDisliked = disliked;
      const currentDislikeCount = dislikeCount;
      const currentLiked = liked;
      const currentLikeCount = likeCount;

      // UI optimistisch aktualisieren
      setDisliked(!disliked);
      setDislikeCount(prev => prev + (disliked ? -1 : 1));

      // Wenn der Benutzer bereits einen Like gegeben hat, entferne diesen
      if (liked && !disliked) {
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      }

      const method = disliked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${postId}/dislike`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Daten aus der Antwort lesen
        const data = await response.json();

        // Server-Zustand übernehmen
        setDisliked(data.disliked);
        setDislikeCount(data.dislikeCount);

        // Wenn ein Like entfernt wurde, aktualisiere auch den Like-Status
        if (data.likeCount !== undefined) {
          setLikeCount(data.likeCount);
          setLiked(false);
        }

        // Feedback zeigen
        const message = data.message || (disliked ? 'Dislike entfernt' : 'Beitrag disliked');
        toast.success(message);

        // Aktualisiere die Seite
        router.refresh();
      } else {
        // Bei Fehler alten Zustand wiederherstellen
        setDisliked(currentDisliked);
        setDislikeCount(currentDislikeCount);
        setLiked(currentLiked);
        setLikeCount(currentLikeCount);

        // Fehlermeldung zeigen
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || 'Fehler bei der Aktualisierung des Dislikes');
      }
    } catch (error) {
      console.error('Error updating dislike:', error);
      toast.error('Fehler beim Aktualisieren des Dislikes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFavorite = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/post/${postId}`);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Aktuellen Wert für die Wiederherstellung im Fehlerfall speichern
      const currentFavorited = favorited;
      const currentCount = favoriteCount;

      // Optimistisches UI-Update
      setFavorited(!favorited);
      setFavoriteCount(favoriteCount + (favorited ? -1 : 1));

      console.log('Sending favorite request:', {
        method: favorited ? 'DELETE' : 'POST',
        url: `/api/posts/${postId}/favorite`
      });

      const method = favorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${postId}/favorite`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Favorite response status:', response.status);
      const responseText = await response.text();
      console.log('Favorite response text:', responseText);

      if (response.ok) {
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse response JSON:', e);
          data = { favorited: !favorited, favoriteCount: favoriteCount + (favorited ? -1 : 1) };
        }

        console.log('Parsed favorite response:', data);
        setFavorited(data.favorited);
        setFavoriteCount(data.favoriteCount || data.favoritesCount);

        toast.success(favorited ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt');

        router.refresh();
      } else {
        // Bei Fehler zurück zum vorherigen Zustand
        setFavorited(currentFavorited);
        setFavoriteCount(currentCount);
        let error;
        try {
          error = JSON.parse(responseText);
        } catch (e) {
          error = { message: 'Failed to update favorites' };
        }
        throw new Error(error.message || 'Failed to update favorites');
      }
    } catch (error) {
      // Bei Ausnahme zurück zum vorherigen Zustand
      setFavorited(currentFavorited);
      setFavoriteCount(currentCount);
      console.error('Error updating favorites:', error);
      toast.error('Fehler beim Aktualisieren der Favoriten');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Post-Inhalt */}
      <h1 className="text-2xl font-bold">{postData.title}</h1>

      {/* Interaktionsleiste mit korrekter Kommentaranzahl */}
      <div className="my-2 p-3 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-xl flex items-center space-x-4">
        <button
          onClick={handleLike}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            liked
              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label={liked ? "Unlike post" : "Like post"}
        >
          <span className="text-xl">👍</span>
          <span>{likeCount}</span>
        </button>

        <button
          onClick={handleDislike}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            disliked
              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label={disliked ? "Remove dislike" : "Dislike post"}
        >
          <span className="text-xl">👎</span>
          <span>{dislikeCount}</span>
        </button>

        <button
          onClick={handleFavorite}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            favorited
              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
              : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <span className="text-xl">❤️</span>
          <span>{favoriteCount}</span>
        </button>

        <Link
          href={`/comments?post=${postId}`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="View comments"
        >
          <span className="text-xl">💬</span>
          <span>{commentCount}</span>
        </Link>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('URL kopiert');
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Copy link"
        >
          <span className="text-xl">🔗</span>
          <span>Teilen</span>
        </button>
      </div>

      {/* Bild */}
      <div className="my-4">
        <img
          src={postData.imageUrl}
          alt={postData.title}
          className="max-w-full h-auto rounded-lg"
        />
      </div>

      {/* PostModerator-Komponente */}
      <PostModerator postId={postId} />

      {/* PostTagEditor-Komponente */}
      <PostTagEditor postId={postId} initialTags={tagNames} />

      {/* Autoren-Infobox mit korrekten Statistiken */}
      {postData.author && (
        <div className="mt-4 p-4 rounded-lg bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            {postData.author.username !== 'anonymous' ? (
              <Link href={`/user/${postData.author.username}`}>
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {postData.author.avatar ? (
                    <img
                      src={postData.author.avatar}
                      alt={`${postData.author.username}'s avatar`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {postData.author.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500">?</span>
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-medium">
                {postData.author.username !== 'anonymous' ? (
                  <Link href={`/user/${postData.author.username}`} className="hover:underline">
                    {postData.author.username}
                  </Link>
                ) : (
                  'Anonymous'
                )}
              </h3>

              {postData.author.username !== 'anonymous' && postData.author.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {postData.author.bio}
                </p>
              )}

              {postData.author.username !== 'anonymous' && (
                <div className="flex flex-wrap gap-4 mt-2">
                  <Link href={`/posts?uploader=${postData.author.username}`} className="text-sm hover:text-purple-600 dark:hover:text-purple-400">
                    <span className="text-gray-500">uploads:</span> <span className="font-bold text-purple-600 dark:text-purple-400">{postData.author.stats.uploads}</span>
                  </Link>
                  <Link href={`/comments?author=${postData.author.username}`} className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
                    <span className="text-gray-500">comments:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{postData.author.stats.comments}</span>
                  </Link>
                  <Link href={`/posts?liked_by=${postData.author.username}`} className="text-sm hover:text-green-600 dark:hover:text-green-400">
                    <span className="text-gray-500">likes:</span> <span className="font-bold text-green-600 dark:text-green-400">{postData.author.stats.likes}</span>
                  </Link>
                  <Link href={`/posts?favorited_by=${postData.author.username}`} className="text-sm hover:text-pink-600 dark:hover:text-pink-400">
                    <span className="text-gray-500">favorites:</span> <span className="font-bold text-pink-600 dark:text-pink-400">{postData.author.stats.favorites}</span>
                  </Link>
                  <Link href={`/tags?creator=${postData.author.username}`} className="text-sm hover:text-orange-600 dark:hover:text-orange-400">
                    <span className="text-gray-500">tags:</span> <span className="font-bold text-orange-600 dark:text-orange-400">{postData.author.stats.tags}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}