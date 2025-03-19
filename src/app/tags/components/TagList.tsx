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
  creator?: string | { username: string } | null;
  creatorUsername?: string;
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
  const isModerator = session?.user?.role === 'moderator' || session?.user?.role === 'admin';
  
  if (tags.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        No tags found with the current filter criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {tags.map((tag) => (
        <div key={tag.id} className="relative group overflow-hidden bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="p-3">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Link href={`/posts?tag=${tag.name}`} className="text-base font-medium text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 truncate max-w-[80%]">
                  {tag.name}
                </Link>
                
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  {tag.postsCount}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1 text-xs mb-2">
                {tag.newPostsToday > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    +{tag.newPostsToday} today
                  </span>
                )}
                {tag.newPostsThisWeek > tag.newPostsToday && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    +{tag.newPostsThisWeek} this week
                  </span>
                )}
              </div>
              
              {/* Creator info with compact layout */}
              {(tag.creator && typeof tag.creator === 'object') && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  By <Link href={`/user/${tag.creator.username}`} className="hover:underline text-purple-600 dark:text-purple-400">
                    {tag.creator.username}
                  </Link>
                </div>
              )}
              
              {tag.creatorUsername && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  By <Link href={`/user/${tag.creatorUsername}`} className="hover:underline text-purple-600 dark:text-purple-400">
                    {tag.creatorUsername}
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Admin controls - now more compact */}
          {isModerator && (
            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-end">
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
      ))}
    </div>
  );
}
