import { SortBy } from './TagsPage';
import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
  postsCount: number;
  newPostsToday: number;
  newPostsThisWeek: number;
  createdAt: string;
  updatedAt: string;
}

interface TagListProps {
  tags: Tag[];
  filters: {
    search: string;
    sortBy: SortBy;
  };
  page: number;
}

export function TagList({ tags, filters, page }: TagListProps) {
  if (tags.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        No tags found with the current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {tags.map(tag => (
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
            </Link>

            {/* Stats */}
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
