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

const DEFAULT_AVATAR = '/images/defaultavatar.png';

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

  // Voting Handler
  const handleVote = (type: 'like' | 'dislike') => {
    if (userVote === type) {
      setUserVote(null);
      setPost(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          likes: type === 'like' ? prev.stats.likes - 1 : prev.stats.likes,
          dislikes: type === 'dislike' ? prev.stats.dislikes - 1 : prev.stats.dislikes
        }
      } : null);
    } else {
      setUserVote(type);
      setPost(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          likes: type === 'like' ? prev.stats.likes + 1 : 
                 userVote === 'like' ? prev.stats.likes - 1 : prev.stats.likes,
          dislikes: type === 'dislike' ? prev.stats.dislikes + 1 : 
                    userVote === 'dislike' ? prev.stats.dislikes - 1 : prev.stats.dislikes
        }
      } : null);
    }
  };

  // Favorite Handler
  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    setPost(prev => prev ? {
      ...prev,
      stats: {
        ...prev.stats,
        favorites: isFavorited ? prev.stats.favorites - 1 : prev.stats.favorites + 1
      }
    } : null);
  };

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
            <CommentList postId={postId} />
          </div>
        </div>

        {/* Right Column - Metadata and Tags */}
        <div className="space-y-6">
          {/* Uploader Info - Nach oben verschoben */}
          <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              {post.uploader.id === 'anonymous' ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                  <Image 
                    src={getImageUrlWithCacheBuster(DEFAULT_AVATAR)}
                    alt="Anonymous user avatar"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <Link 
                  href={`/user/${post.uploader.name}`}
                  className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0"
                >
                  <Image
                    src={getImageUrlWithCacheBuster(post.uploader.avatar || DEFAULT_AVATAR)}
                    alt={`${post.uploader.name}'s avatar`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </Link>
              )}
              
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  {post.uploader.id === 'anonymous' ? (
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {post.uploader.name}
                    </span>
                  ) : (
                    <Link 
                      href={`/user/${post.uploader.name}`}
                      className={`font-medium ${
                        post.uploader.premium 
                          ? 'bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent' 
                          : 'text-gray-900 dark:text-gray-100'
                      } hover:opacity-80 transition-opacity`}
                    >
                      {post.uploader.name}
                    </Link>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    post.uploader.admin ? 'bg-red-500/40 text-white border border-red-500/50' :
                    post.uploader.moderator ? 'bg-blue-500/40 text-white border border-blue-500/50' :
                    'bg-gray-500/40 text-white border border-gray-500/50'
                  }`}>
                    {post.uploader.admin ? 'ADMIN' :
                     post.uploader.moderator ? 'MOD' :
                     'MEMBER'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                  {post.uploader.id === 'anonymous' ? (
                    <span>Posted on {new Date(post.uploadDate).toLocaleString()}</span>
                  ) : (
                    <span>Member since {new Date(post.uploader.joinDate).toLocaleString()}</span>
                  )}
                  {post.uploader.premium && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      ⭐ PREMIUM
                    </span>
                  )}
                </div>
                
                {/* Benutzer-Bio direkt unter den Namen, wenn vorhanden und nicht anonymous */}
                {post.uploader.id !== 'anonymous' && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {post.uploader.bio ? post.uploader.bio : 'Dieser Benutzer hat noch keine Bio hinzugefügt.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* User Stats - Alle Stats kompakt darstellen */}
            <div className="mt-4">
              <Link
                href={`/user/${post.uploader.name}`}
                className="block rounded-lg bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors p-3"
              >
                <div className="flex justify-between items-end gap-3 py-1 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">posts</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{post.uploader.stats?.totalPosts || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">favorites</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{post.uploader.stats?.favorites || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">likes</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{post.uploader.stats?.totalLikes || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">comments</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{post.uploader.stats?.comments || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">tags</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{post.uploader.stats?.tags || 0}</div>
                  </div>
                </div>
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

          {/* Tags */}
          <PostTags tags={post.tags} />

          {/* Reverse Image Search - jetzt über den Metadaten */}
          <ReverseSearch imageUrl={post.imageUrl} />
          
          {/* Metadata - jetzt nach der ReverseSearch */}
          <PostMetadata meta={{...post.meta, uploadDate: post.uploadDate}} />
        </div>
      </div>
    </div>
  );
}

