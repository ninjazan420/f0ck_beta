'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export interface PreviewImageUrlData {
  url: string;
  previewUrl?: string;
  tempFilePath?: string; // Pfad zur temporären Datei auf dem Server
  dimensions?: {
    width: number;
    height: number;
  };
}

export function UrlInput({ 
  onUrlAdd 
}: { 
  onUrlAdd: (urlData: PreviewImageUrlData) => void 
}) {
  const [url, setUrl] = useState('');
  const [isImageUrl, setIsImageUrl] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Die checkIfImageUrl-Funktion außerhalb des useEffect definieren, um stabile Referenzen zu gewährleisten
  const checkIfImageUrl = useCallback(async (urlToCheck: string) => {
    if (!urlToCheck || !urlToCheck.trim()) {
      setIsImageUrl(false);
      setPreviewImage(null);
      return;
    }

    try {
      const urlObj = new URL(urlToCheck);
      // Quick check for common image extensions
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => 
        urlObj.pathname.toLowerCase().endsWith(ext)
      );

      if (hasImageExtension) {
        setIsImageUrl(true);
        // Try to load image for preview
        setPreviewImage(urlToCheck);
        return;
      }
      
      // For other URLs, we might need a more sophisticated check
      // This is kept simple for this implementation
      setIsImageUrl(false);
      setPreviewImage(null);
    } catch (e) {
      // Not a valid URL
      setIsImageUrl(false);
      setPreviewImage(null);
      setError("Invalid URL format");
    }
  }, []);

  // URL überprüfen, wenn sich die URL ändert
  useEffect(() => {
    if (!url.trim()) {
      setIsImageUrl(false);
      setIsChecking(false);
      setPreviewImage(null);
      return;
    }

    setIsChecking(true);
    setError(null);
    
    const timer = setTimeout(() => {
      checkIfImageUrl(url);
      setIsChecking(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [url, checkIfImageUrl]);

  // Function to download the image and get a temporary file path
  const downloadImage = useCallback(async (imageUrl: string): Promise<PreviewImageUrlData> => {
    setIsDownloading(true);
    try {
      // Call the API endpoint to download the image
      const response = await fetch(`/api/download-temp-image?url=${encodeURIComponent(imageUrl)}`);
      
      if (!response.ok) {
        throw new Error('Failed to download image');
      }
      
      const data = await response.json();
      setIsDownloading(false);
      
      console.log('Image downloaded successfully:', data);
      
      return {
        url: imageUrl,
        previewUrl: data.previewUrl,
        tempFilePath: data.tempFilePath,
        dimensions: data.dimensions
      };
    } catch (error) {
      console.error('Error downloading image:', error);
      setIsDownloading(false);
      setError('Failed to download image. Please try again.');
      throw error;
    }
  }, []);

  // Handle paste events
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Check if the paste is just a URL
      if (e.clipboardData) {
        const text = e.clipboardData.getData('text');
        if (text && text.trim()) {
          try {
            new URL(text); // Check if it's a valid URL
            setUrl(text);
          } catch (e) {
            // Not a valid URL, ignore
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      if (isImageUrl) {
        try {
          // Download the image and get the temporary file path
          const urlData = await downloadImage(url.trim());
          onUrlAdd(urlData);
          setUrl('');
          setIsImageUrl(false);
          setPreviewImage(null);
        } catch (err) {
          console.error('Error downloading image:', err);
        }
      } else {
        setError("URL doesn't appear to be an image");
      }
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste image URL here..."
            className={`w-full p-2 rounded-lg border ${
              isImageUrl ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'
            } bg-white/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200`}
          />
          {isImageUrl && !isDownloading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {(isChecking || isDownloading) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
        <button 
          type="submit" 
          disabled={!isImageUrl || isChecking || isDownloading}
          className={`relative h-10 px-6 rounded-lg overflow-hidden transition-all duration-500 group ${
            !isImageUrl || isChecking || isDownloading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-b from-[#654358] via-[#17092A] to-[#2F0D64]'
          }`}
        >
          <span className="relative z-10 text-white">
            {isDownloading ? 'Downloading...' : 'Add URL'}
          </span>
          {isImageUrl && !isChecking && !isDownloading && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 group-hover:opacity-100"></div>
          )}
        </button>
      </form>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      {previewImage && (
        <div className="mt-2 relative w-full">
          <div className="rounded-lg p-2 border border-gray-200 dark:border-gray-700 bg-white/20 dark:bg-gray-800/20">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Image Preview:</div>
            <div className="relative h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <Image 
                src={previewImage}
                alt="Image preview" 
                fill
                style={{ objectFit: 'contain' }}
                onError={() => {
                  setError("Failed to load image preview");
                  setIsImageUrl(false);
                  setPreviewImage(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Paste image URLs or links to social media posts. URLs from clipboard will be automatically detected.
      </p>
    </div>
  );
}
