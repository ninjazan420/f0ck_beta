export function ReverseSearch({ imageUrl }: { imageUrl: string }) {
  const searchEngines = [
    {
      name: 'Google',
      url: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`
    },
    {
      name: 'Yandex',
      url: `https://yandex.com/images/search?url=${encodeURIComponent(imageUrl)}`
    },
    {
      name: 'SauceNAO',
      url: `https://saucenao.com/search.php?url=${encodeURIComponent(imageUrl)}`
    },
    {
      name: 'IQDB',
      url: `https://iqdb.org/?url=${encodeURIComponent(imageUrl)}`
    }
  ];

  return (
    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-sm font-[family-name:var(--font-geist-mono)] text-gray-800 dark:text-gray-400 mb-3">
        Reverse Image Search
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {searchEngines.map(engine => (
          <a
            key={engine.name}
            href={engine.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-sm rounded-lg text-center bg-white/50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {engine.name}
          </a>
        ))}
      </div>
    </div>
  );
}
