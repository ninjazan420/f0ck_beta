interface MetadataProps {
  meta: {
    width: number;
    height: number;
    size: number;
    format: string;
    source: string | null;
    uploadDate: string;
  };
}

export function PostMetadata({ meta }: MetadataProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadDateTime = new Date(meta.uploadDate);
  const formattedDate = uploadDateTime.toLocaleDateString();
  const formattedTime = uploadDateTime.toLocaleTimeString();

  return (
    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">File Information</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Dimensions</span>
          <span className="text-gray-700 dark:text-gray-300">{meta.width} × {meta.height}px</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Format</span>
          <span className="text-gray-700 dark:text-gray-300">{meta.format}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">File size</span>
          <span className="text-gray-700 dark:text-gray-300">{formatFileSize(meta.size)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Upload date</span>
          <span className="text-gray-700 dark:text-gray-300">{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Upload time</span>
          <span className="text-gray-700 dark:text-gray-300">{formattedTime}</span>
        </div>
        {meta.source && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <a
              href={meta.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              View original source →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}