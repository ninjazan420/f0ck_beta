'use client';

interface CommentProps {
  data: {
    id: string;
    user: {
      id: string;
      name: string;
      avatar: string | null;
    };
    text: string;
    post: {
      id: string;
      title: string;
    };
    likes: number;
    createdAt: string;
    replyTo?: {
      id: string;
      user: {
        name: string;
      };
      preview: string;
    };
  };
}

export function Comment({ data }: CommentProps) {
  const formattedDate = new Date(data.createdAt).toLocaleString();

  return (
    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      {/* Reply Preview */}
      {data.replyTo && (
        <div className="mb-3 pl-4 border-l-2 border-purple-200 dark:border-purple-800/30 bg-purple-50/30 dark:bg-purple-900/10 rounded-r-lg py-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Reply to{' '}
            <a href={`/user/${data.replyTo.user.name}`} className="text-purple-600 hover:underline">
              {data.replyTo.user.name}
            </a>:
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 font-[family-name:var(--font-geist-sans)] line-clamp-1">
            {data.replyTo.preview}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Avatar */}
        <a href={`/user/${data.user.name}`} className="block">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0 hover:ring-2 hover:ring-purple-400 dark:hover:ring-purple-600 transition-all">
            {data.user.avatar ? (
              <img 
                src={data.user.avatar} 
                alt="" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                {data.user.name[0].toUpperCase()}
              </div>
            )}
          </div>
        </a>

        {/* Comment Content */}
        <div className="flex-grow">
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <a href={`/user/${data.user.name}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400">
                {data.user.name}
              </a>
              <span className="text-sm text-gray-500">
                on{' '}
                <a href={`/post/${data.post.id}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                  {data.post.title}
                </a>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href={`/comments/${data.id}`} className="text-sm text-gray-500 hover:text-purple-600 dark:hover:text-purple-400">
                {formattedDate}
              </a>
              <a href={`/comments/${data.id}/likes`} className="flex items-center gap-1 group">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {data.likes}
                </span>
                <span className="text-xs text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  likes
                </span>
              </a>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 font-[family-name:var(--font-geist-sans)]">
            {data.text}
          </p>
        </div>
      </div>
    </div>
  );
}
