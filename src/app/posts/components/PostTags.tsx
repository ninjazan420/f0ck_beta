interface Tag {
  id: string;
  name: string;
  count: number;
}

export function PostTags({ tags }: { tags: Tag[] }) {
  // Debug to console
  console.log('Tags in PostTags component:', tags);

  return (
    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-sm font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-3">
        Tags
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {tags && tags.length > 0 ? tags.map(tag => {
          // Ensure tag has all required properties
          if (!tag || !tag.name) {
            console.warn('Invalid tag:', tag);
            return null;
          }
          
          return (
            <a
              key={tag.id || `tag-${tag.name}`}
              href={`/posts?tag=${tag.name}`}
              className="px-2 py-1 rounded-lg text-xs font-medium 
                bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent
                hover:opacity-80 transition-opacity
                border border-gray-200 dark:border-gray-700"
            >
              {tag.name}
              <span className="ml-1 text-gray-400">({tag.count || 0})</span>
            </a>
          );
        }) : (
          <span className="text-sm text-gray-500">No Tags available yet. Be the first who adds some!</span>
        )}
      </div>
    </div>
  );
}
