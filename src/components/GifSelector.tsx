'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface GifSelectorProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

interface GifData {
  id: string;
  url: string;
  preview: string;
}

export function GifSelector({ onSelect, onClose }: GifSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState<GifData[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  const searchGifs = async (term: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY}&q=${encodeURIComponent(term)}&limit=20&rating=g`
      );
      const data = await response.json();
      
      setGifs(data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        preview: gif.images.fixed_height_small.url
      })));
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchTerm) {
      searchTimeout.current = setTimeout(() => {
        searchGifs(searchTerm);
      }, 500);
    } else {
      // Load trending GIFs when no search term
      searchGifs('trending');
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-full right-0 mb-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search GIFs..."
          className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="h-96 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => onSelect(gif.url)}
                className="relative aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                title={`Select GIF ${gif.id}`}
              >
                <Image
                  src={gif.preview}
                  alt="GIF"
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
        <a 
          href="https://giphy.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-purple-500"
        >
          Powered by GIPHY
        </a>
      </div>
    </div>
  );
} 