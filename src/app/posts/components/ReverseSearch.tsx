export function ReverseSearch({ imageUrl }: { imageUrl: string }) {
  // Konvertiere relative URL zu absoluter URL
  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url; // URL ist bereits absolut
    }
    
    // Immer die Produktions-URL verwenden für Reverse Search
    // So wird verhindert, dass localhost-URLs an externe Dienste gesendet werden
    const baseUrl = 'https://f0ck.org';
    const sanitizedImageUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${baseUrl}${sanitizedImageUrl}`;
  };
  
  // Verwende die vollständige URL für alle Suchmaschinen
  const fullImageUrl = getFullImageUrl(imageUrl);

  const searchEngines = [
    {
      name: 'Google',
      url: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(fullImageUrl)}`
    },
    {
      name: 'Yandex',
      url: `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(fullImageUrl)}`
    },
    {
      name: 'SauceNAO',
      url: `https://saucenao.com/search.php?url=${encodeURIComponent(fullImageUrl)}`
    },
    {
      name: 'IQDB',
      url: `https://iqdb.org/?url=${encodeURIComponent(fullImageUrl)}`
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
