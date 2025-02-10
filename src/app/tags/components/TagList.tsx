import { TagType, SortBy } from './TagsPage';
import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
  type: TagType;
  postsCount: number;
  newPostsToday: number;
  newPostsThisWeek: number;
  createdAt: string;
  topUser: {
    name: string;
    posts: number;
    isPremium: boolean;
  };
}

// Realistic tag names for mock data
const TAG_EXAMPLES = [
  { name: 'artwork', type: 'general' },
  { name: 'digital_art', type: 'meta' },
  { name: 'meme', type: 'general' },
  { name: 'cats', type: 'general' },
  { name: 'anime', type: 'general' },
  { name: 'pixel_art', type: 'meta' },
  { name: 'photography', type: 'general' },
  { name: 'comic', type: 'general' },
  { name: 'wallpaper', type: 'meta' },
  { name: 'fanart', type: 'general' },
  { name: 'landscape', type: 'general' },
  { name: 'portrait', type: 'general' },
  { name: 'traditional_art', type: 'meta' },
  { name: 'original_character', type: 'character' },
  { name: 'commission', type: 'meta' },
  // Artists
  { name: 'artgerm', type: 'artist' },
  { name: 'wlop', type: 'artist' },
  { name: 'sakimichan', type: 'artist' },
  // Characters
  { name: 'hatsune_miku', type: 'character' },
  { name: 'reimu_hakurei', type: 'character' },
  // Copyrights
  { name: 'genshin_impact', type: 'copyright' },
  { name: 'fate_grand_order', type: 'copyright' },
  { name: 'pokemon', type: 'copyright' }
];

// Konstante Mock-Daten statt zufälliger Generierung
const MOCK_TAGS: Tag[] = TAG_EXAMPLES.map((tagExample, i) => ({
  id: `tag-${i + 1}`,
  name: tagExample.name,
  type: tagExample.type as TagType,
  postsCount: (10000 - i * 100), // Absteigend, damit "artwork" die meisten Posts hat
  newPostsToday: Math.max(0, 100 - i * 2), // Absteigend, aber mindestens 0
  newPostsThisWeek: Math.max(0, 500 - i * 10), // Absteigend, aber mindestens 0
  createdAt: new Date(2024, 0, 1 + i).toISOString(), // Aufsteigend, beginnend mit 1. Jan 2024
  topUser: {
    name: `User${i + 1}`, // Konsistente User-Namen
    posts: 1000 - i * 20, // Absteigend
    isPremium: i < 5 // Nur die ersten 5 User sind Premium
  }
}));

interface TagListProps {
  filters: {
    search: string;
    types: TagType[];
    minPosts: number;
    sortBy: SortBy;
  };
  page: number;
}

export function TagList({ filters, page }: TagListProps) {
  // Filter and sort tags
  const filteredTags = MOCK_TAGS
    .filter(tag => 
      (filters.search === '' || tag.name.includes(filters.search.toLowerCase())) &&
      filters.types.includes(tag.type) &&
      tag.postsCount >= filters.minPosts
    )
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'most_used':
          return b.postsCount - a.postsCount;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'trending':
          return b.newPostsToday - a.newPostsToday;
        default:
          return 0;
      }
    });

  // Get current page tags
  const startIdx = (page - 1) * 20;
  const currentTags = filteredTags.slice(startIdx, startIdx + 20);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {currentTags.map(tag => (
        <div
          key={tag.id}
          className="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="space-y-2">
            {/* Tag Header with Link */}
            <Link
              href={`/posts?tag=${tag.name}`}
              className="flex items-center gap-1.5 group"
            >
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                {tag.name.replace(/_/g, ' ')}
              </h3>
              <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                tag.type === 'general' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                tag.type === 'character' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                tag.type === 'copyright' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                tag.type === 'artist' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
              }`}>
                {tag.type}
              </span>
            </Link>

            {/* Stats and User Info */}
            <div className="text-sm space-y-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {tag.postsCount.toLocaleString()} posts
              </div>
              <div className="text-xs space-y-0.5">
                {tag.newPostsToday > 0 && (
                  <div className="text-green-600 dark:text-green-400">
                    +{tag.newPostsToday} today
                  </div>
                )}
                {tag.newPostsThisWeek > 0 && (
                  <div className="text-blue-600 dark:text-blue-400">
                    +{tag.newPostsThisWeek} this week
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                Top:{' '}
                <div className="inline-flex items-center">
                  <Link
                    href={`/user/${tag.topUser.name.toLowerCase()}`}
                    className={`hover:underline ${
                      tag.topUser.isPremium
                        ? 'bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent'
                        : 'text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {tag.topUser.name}
                  </Link>
                  {tag.topUser.isPremium && (
                    <span className="ml-1 px-1 py-0.5 rounded text-[8px] font-medium bg-purple-500/40 text-white border border-purple-500/50">
                      PRO
                    </span>
                  )}
                  <span className="ml-1">({tag.topUser.posts})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
