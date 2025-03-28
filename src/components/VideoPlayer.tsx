'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  thumbnailSrc?: string;
  width?: string | number;
  height?: string | number;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
  poster?: string;
  muted?: boolean;
  loop?: boolean;
  onVideoLoaded?: () => void;
}

// Konstante für den localStorage-Schlüssel
const VOLUME_STORAGE_KEY = 'videoPlayerVolume';

export function VideoPlayer({
  src,
  thumbnailSrc,
  width = '100%',
  height = 'auto',
  autoPlay = false,
  controls = true,
  className = '',
  poster,
  muted = false,
  loop = false,
  onVideoLoaded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoFormat, setVideoFormat] = useState<string | null>(null);

  // Log für Debugging (nur in Entwicklungsumgebung)
  if (process.env.NODE_ENV === 'development') {
    console.log('VideoPlayer rendering with:', { src, thumbnailSrc, poster });
  }

  // Effekt zum Laden und Speichern der Lautstärke
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Lade die gespeicherte Lautstärke beim Initialisieren 
    const loadSavedVolume = () => {
      try {
        const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
        if (savedVolume !== null) {
          // Lautstärkewerte sind zwischen 0 und 1
          videoElement.volume = parseFloat(savedVolume);
          if (process.env.NODE_ENV === 'development') {
            console.log('Loaded saved volume:', videoElement.volume);
          }
        }
      } catch (error) {
        // Fehlerbehandlung für den Fall, dass localStorage nicht verfügbar ist
        console.error('Error loading saved volume:', error);
      }
    };

    // Speichere die Lautstärke, wenn der Benutzer sie ändert
    const handleVolumeChange = () => {
      try {
        localStorage.setItem(VOLUME_STORAGE_KEY, videoElement.volume.toString());
        if (process.env.NODE_ENV === 'development') {
          console.log('Saved volume:', videoElement.volume);
        }
      } catch (error) {
        console.error('Error saving volume:', error);
      }
    };

    // Event-Listener für die Lautstärkeänderung
    videoElement.addEventListener('volumechange', handleVolumeChange);
    
    // Lade die gespeicherte Lautstärke beim Start
    loadSavedVolume();

    return () => {
      videoElement.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // Funktionalität zum Laden des Videos
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoaded = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Video loaded successfully');
      }
      setIsLoading(false);
      
      // Bestimme das Videoformat aus der Quelle
      try {
        const url = new URL(src);
        const extension = url.pathname.split('.').pop()?.toLowerCase();
        if (extension) {
          setVideoFormat(extension);
        }
      } catch (e) {
        // Einfach ignorieren, wenn URL nicht gültig ist
      }
      
      // Callback aufrufen, wenn vorhanden
      if (onVideoLoaded) {
        onVideoLoaded();
      }
    };

    const handleError = (e: any) => {
      console.error('Video loading error:', e);
      setError(`Failed to load video: ${e.message || 'Unknown error'}`);
      setIsLoading(false);
    };

    // Überwachen, wenn das Metadaten geladen sind
    const handleMetadataLoaded = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Video metadata loaded');
      }
    };

    videoElement.addEventListener('loadeddata', handleLoaded);
    videoElement.addEventListener('loadedmetadata', handleMetadataLoaded);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoaded);
      videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded);
      videoElement.removeEventListener('error', handleError);
    };
  }, [src, onVideoLoaded]);

  // Bestimme das passende Fallback-Format
  const getSourceForMimeType = () => {
    if (!src) return null;
    
    const sourceElements = [];
    
    // Hauptquelle hinzufügen
    sourceElements.push(
      <source key="main" src={src} type={getTypeFromExtension(src)} />
    );
    
    return sourceElements;
  };
  
  // Helfer-Funktion zur Bestimmung des MIME-Typs aus der Dateiendung
  const getTypeFromExtension = (url: string): string => {
    try {
      const extension = url.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'mp4': return 'video/mp4';
        case 'webm': return 'video/webm';
        case 'ogg': return 'video/ogg';
        case 'mov': return 'video/quicktime';
        default: return 'video/mp4'; // Fallback
      }
    } catch (e) {
      return 'video/mp4'; // Fallback bei Fehler
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="video-container relative rounded-xl overflow-hidden"
      style={{ 
        width: '100%', 
        maxWidth: '100%',
        height: 'auto',
        maxHeight: '70vh'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100/30 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-center p-4">
          <div>
            <svg className="mx-auto w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        width="100%"
        controls={controls}
        autoPlay={autoPlay}
        preload="metadata"
        poster={poster || thumbnailSrc}
        className={`w-full h-auto object-contain ${className}`}
        style={{ 
          width: '100%',
          height: 'auto',
          maxHeight: '70vh',
          objectFit: 'contain'
        }}
        muted={muted}
        loop={loop}
        playsInline
      >
        {getSourceForMimeType()}
        Your browser does not support the video tag.
      </video>
    </div>
  );
} 