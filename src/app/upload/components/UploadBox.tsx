'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

const ALLOWED_EXTENSIONS = ['.jpg', '.png', '.gif', '.webm', '.mp4', '.mov', '.heif', '.heic', '.webp', '.avif', '.bmp', '.tiff', '.apng', '.ogg']

export function UploadBox({ onFileDrop }: { onFileDrop: (files: File[]) => void }) {
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      // Client-seitige Validierung
      const isValidType = [
        // Image formats
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
        'image/heif', 'image/heic', 'image/bmp', 'image/tiff', 'image/svg+xml',
        'image/apng',
        // Video formats
        'video/webm', 'video/mp4', 'video/quicktime', 'video/avi',
        'video/x-msvideo', 'video/mkv', 'video/x-matroska', 'video/ogg',
        // Legacy support
        'application/x-shockwave-flash'
      ].includes(file.type);
      
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      
      if (!isValidType) {
        console.warn(`Rejected file due to invalid type: ${file.type}`);
        return false;
      }
      
      if (!isValidSize) {
        console.warn(`Rejected file due to size: ${(file.size / (1024*1024)).toFixed(2)}MB`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length < acceptedFiles.length) {
      // Zeige Warnung, wenn Dateien abgelehnt wurden
      console.log(`${acceptedFiles.length - validFiles.length} files were rejected`);
    }
    
    onFileDrop(validFiles);
  }, [onFileDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.heif', '.heic', '.bmp', '.tiff', '.svg', '.apng'],
      'video/*': ['.webm', '.mp4', '.mov', '.avi', '.mkv', '.ogg'],
    }
  });

  // Handle clipboard paste events
  useEffect(() => {
    const handleDropzonePaste = (e: ClipboardEvent) => {
      // Prüfen, ob der Fokus innerhalb oder auf der Dropzone ist
      const isDropzoneActive = 
        dropzoneRef.current && 
        (dropzoneRef.current === document.activeElement || 
         dropzoneRef.current.contains(document.activeElement));
      
      // Wenn ein Input-Element fokussiert ist und NICHT in der Dropzone
      const inputActive = 
        (document.activeElement instanceof HTMLInputElement || 
         document.activeElement instanceof HTMLTextAreaElement) && 
        !isDropzoneActive;
      
      if (inputActive) return; // Input-Felder außerhalb der Dropzone haben Vorrang
      
      // Nur Datei-Paste verarbeiten
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        e.preventDefault(); // Verhindern Sie das Standard-Einfügen
        const files = Array.from(e.clipboardData.files);
        onFileDrop(files);
      }
    };
    
    // Füge den Event-Listener zur Dropzone hinzu, nicht zum Dokument
    const dropzoneElement = dropzoneRef.current;
    if (dropzoneElement) {
      dropzoneElement.addEventListener('paste', handleDropzonePaste);
      return () => dropzoneElement.removeEventListener('paste', handleDropzonePaste);
    }
    
    return undefined;
  }, [onFileDrop]);

  return (
    <div
      {...getRootProps()}
      ref={dropzoneRef}
      className={`
        relative h-48 rounded-lg overflow-hidden transition-all duration-300
        border-2 border-dashed p-8 text-center cursor-pointer
        ${isDragActive 
          ? 'border-purple-500 bg-purple-50/10' 
          : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}
      `}
    >
      <input {...getInputProps()} />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-transparent to-transparent dark:from-gray-900/50"></div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center space-y-3 px-2">
        <div className="text-gray-800 dark:text-gray-300 text-center">
          <p className="text-lg sm:text-xl font-medium">Drop or paste your files here!</p>
          <p className="text-sm">Or just click on this box.</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center space-y-1">
          <p>
            <span className="font-medium">Allowed extensions:</span> {ALLOWED_EXTENSIONS.join(', ')}
          </p>
          {/* <p className="text-gray-400 dark:text-gray-500">
            (not live yet) You can also use directlinks like<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>YouTube, Twitter, Instagram, Twitch clips and more!
          </p> */}
          <p className="font-medium text-gray-600 dark:text-gray-300">
            Pro tip: You can paste (Ctrl+V) images directly from your clipboard!
          </p>
        </div>
      </div>
      {isDragActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 animate-pulse"></div>
      )}
    </div>
  );
}
