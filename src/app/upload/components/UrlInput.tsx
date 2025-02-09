'use client';
import { useState } from 'react';

export function UrlInput({ onUrlAdd }: { onUrlAdd: (url: string) => void }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUrlAdd(url.trim());
      setUrl('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste URL here..."
        className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200"
      />
      <button 
        type="submit" 
        className="relative h-10 px-6 rounded-lg overflow-hidden transition-all duration-500 group bg-gradient-to-b from-[#654358] via-[#17092A] to-[#2F0D64]"
      >
        <span className="relative z-10 text-white">Add URL</span>
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 group-hover:opacity-100"></div>
      </button>
    </form>
  );
}
