interface Metadata {
  width: number;
  height: number;
  size: number;
  format: string;
  source: string | null;
}

export function PostMetadata({ meta }: { meta: Metadata }) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-sm font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-3">
        File Information
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Resolution</span>
          <span className="text-gray-700 dark:text-gray-300">{meta.width} × {meta.height}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Size</span>
          <span className="text-gray-700 dark:text-gray-300">{formatFileSize(meta.size)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Format</span>
          <span className="text-gray-700 dark:text-gray-300">{meta.format}</span>
        </div>

        {meta.source && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <a
              href={meta.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 dark:text-purple-400 hover:underline block truncate"
            >
              Original Source ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}