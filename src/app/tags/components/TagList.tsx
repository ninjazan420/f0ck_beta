import { SortBy } from './TagsPage';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const isModOrAdmin = session?.user?.role && ['moderator', 'admin'].includes(session.user.role);
  
  if (tags.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        No tags found with the current filter criteria.
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
          <div className="flex flex-col h-full">
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
            <div className="text-sm space-y-1 flex-grow">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {tag.postsCount > 0 
                  ? `${tag.postsCount.toLocaleString()} posts` 
                  : "No posts"}
              </div>
              <div className="text-xs space-y-0.5">
                {tag.newPostsToday > 0 && (
                  <div className="text-green-600 dark:text-green-400">
                    +{tag.newPostsToday} today
                  </div>
                )}
                {tag.newPostsThisWeek > tag.newPostsToday && (
                  <div className="text-blue-600 dark:text-blue-400">
                    +{tag.newPostsThisWeek - tag.newPostsToday} this week
                  </div>
                )}
              </div>
            </div>
            
            {/* Moderation Buttons - Always at the bottom */}
            {isModOrAdmin && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
                      fetch('/api/moderation/tags', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          tagName: tag.name,  // Send the tag name instead of ID
                          reason: 'Moderation - Tag deletion'
                        })
                      }).then(res => {
                        if (res.ok) {
                          window.location.reload();
                        } else {
                          res.json().then(data => {
                            alert(`Error deleting tag: ${data.error || 'Unknown error'}`);
                          }).catch(() => {
                            alert('Error deleting tag');
                          });
                        }
                      }).catch(err => {
                        console.error('Error deleting tag:', err);
                        alert('Error deleting tag');
                      });
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
