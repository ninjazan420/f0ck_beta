interface Tag {
  id: string;
  name: string;
  type: 'general' | 'character' | 'copyright' | 'artist' | 'meta';
  count: number;
}

export function PostTags({ tags }: { tags: Tag[] }) {
  const getTagColor = (type: Tag['type']) => {
    switch (type) {
      case 'artist':
        return 'from-purple-400 to-pink-600';
      case 'character':
        return 'from-green-400 to-emerald-600';
      case 'copyright':
        return 'from-blue-400 to-cyan-600';
      case 'meta':
        return 'from-orange-400 to-red-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-sm font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-3">
        Tags
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <a
            key={tag.id}
            href={`/posts?tag=${tag.name}`}
            className={`px-2 py-1 rounded-lg text-xs font-medium 
              bg-gradient-to-r ${getTagColor(tag.type)} bg-clip-text text-transparent
              hover:opacity-80 transition-opacity
              border border-gray-200 dark:border-gray-700`}
          >
            {tag.name}
            <span className="ml-1 text-gray-400">({tag.count})</span>
          </a>
        ))}
      </div>
    </div>
  );
}
