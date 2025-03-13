'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";
import { UploadBox } from './components/UploadBox';
import { UploadOptions } from './components/UploadOptions';
import { FileList } from './components/FileList';
import { UrlInput, PreviewImageUrlData } from './components/UrlInput';

// Define the FileItem interface to match the one in FileList.tsx
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'url';
  size?: number;
  tags: string[];
  index: number;
  thumbnail?: string;
  dimensions?: { width: number; height: number };
  format?: string;
  contentRating: 'safe' | 'sketchy' | 'unsafe';
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [urlData, setUrlData] = useState<PreviewImageUrlData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingUrls, setIsProcessingUrls] = useState(false);
  const [fileRatings, setFileRatings] = useState<{[key: string]: 'safe' | 'sketchy' | 'unsafe'}>({});
  // Add state to store file items with their tags
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  // Füge einen neuen State hinzu, um zu verfolgen, ob ein Paste-Event verarbeitet wurde
  const [processingPaste, setProcessingPaste] = useState(false);

  // Verbesserte getItemTags-Funktion
  const getItemTags = useCallback((name: string, type: 'file' | 'url'): string[] => {
    // Erstelle eine Map für schnellere Lookups
    const itemMap = useMemo(() => {
      const map = new Map<string, FileItem>();
      fileItems.forEach(item => {
        const key = `${item.type}:${item.name}`;
        map.set(key, item);
      });
      return map;
    }, [fileItems]);
    
    // Lookup ist jetzt O(1) statt O(n)
    const exactMatch = itemMap.get(`${type}:${name}`);
    if (exactMatch) return exactMatch.tags;
    
    // Fallback: Versuche, unabhängig vom Pfad oder exaktem Namen zu finden
    const baseFilename = name.split('/').pop()?.split('\\').pop();
    if (baseFilename) {
      const partialMatch = fileItems.find(item => 
        item.type === type && (
          item.name.includes(baseFilename) || baseFilename.includes(item.name)
        )
      );
      if (partialMatch) return partialMatch.tags;
    }
    
    console.warn(`Keine Tags gefunden für ${type} "${name}"`);
    return [];
  }, [fileItems]);

  // File handling functions mit useCallback
  const handleFileDrop = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      const isValidType = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/webm',
        'video/mp4',
        'video/quicktime',
        'application/x-shockwave-flash',
        'image/avif',
        'image/heif',
        'image/heic',
        'image/webp'
      ].includes(file.type);

      if (!isValidSize) {
        setError('Eine oder mehrere Dateien sind größer als 100MB');
        return false;
      }
      if (!isValidType) {
        setError('Eine oder mehrere Dateien haben ein nicht unterstütztes Format');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      setError(null);
    }
  }, []);

  // Handle URL add
  const handleUrlAdd = useCallback((newUrlData: PreviewImageUrlData) => {
    try {
      new URL(newUrlData.url); // URL validation
      setUrlData(prevUrls => [...prevUrls, newUrlData]);
      setError(null);
    } catch {
      setError('Ungültige URL');
    }
  }, []);

  // Handle file and URL removals
  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  const handleRemoveUrl = useCallback((index: number) => {
    setUrlData(prevUrls => prevUrls.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setUrlData([]);
    setError(null);
    setFileItems([]);
  }, []);

  // Update ratings 
  const updateFileRating = useCallback((fileName: string, rating: 'safe' | 'sketchy' | 'unsafe') => {
    setFileRatings(prev => ({
      ...prev,
      [fileName]: rating
    }));
  }, []);

  // Update fileItems
  const handleFileItemsUpdate = useCallback((items: FileItem[]) => {
    setFileItems(items);
  }, []);

  // Updated to check both files and urlData
  const hasFiles = files.length > 0 || urlData.length > 0;

  // Listen for paste events that might contain multiple files or URLs
  useEffect(() => {
    // Zentrale Paste-Behandlungsfunktion mit Koordination
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Vermeide doppelte Verarbeitung und setze Status
      if (processingPaste) return;
      
      try {
        setProcessingPaste(true);
        
        // Skip wenn das aktive Element ein Input oder Textarea ist, AUSSER wenn das Input leer ist
        const activeEl = document.activeElement;
        const isInputEmpty = activeEl instanceof HTMLInputElement && !activeEl.value;
        
        if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) {
          if (!isInputEmpty) {
            return; // Lass das Input-Element selbst den Paste verarbeiten
          }
        }
        
        // Verarbeite Dateien aus dem Clipboard
        if (e.clipboardData && e.clipboardData.files.length > 0) {
          e.preventDefault(); // Vermeide Standard-Einfügen
          const filesArray = Array.from(e.clipboardData.files);
          handleFileDrop(filesArray);
          return; // Nachdem wir Dateien verarbeitet haben, beenden wir die Funktion
        }
        
        // Versuche Text als URL zu verarbeiten, wenn keine Dateien gefunden wurden
        if (e.clipboardData && e.clipboardData.getData('text')) {
          const text = e.clipboardData.getData('text');
          try {
            new URL(text); // Validieren als URL
            // Hier könnten wir die URL automatisch zum URL-Input-Feld hinzufügen
            // aber es ist besser, die Benutzer entscheiden zu lassen
          } catch (e) {
            // Keine gültige URL, ignorieren
          }
        }
      } finally {
        // Verzögere das Zurücksetzen des Status, um mehrfache Verarbeitung während eines Ereignisses zu verhindern
        setTimeout(() => setProcessingPaste(false), 100);
      }
    };
    
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [handleFileDrop, processingPaste]);

  // Process files and URLs
  const handleUpload = useCallback(async () => {
    if (files.length === 0 && urlData.length === 0) {
      setError('Please choose a file to upload or add an image URL.');
      return;
    }

    setIsUploading(true);
    setError(null);

    // Sammle alle erfolgreichen Uploads für die Weiterleitung
    const successfulUploads: { id: string, type: 'file' | 'url' }[] = [];

    try {
      // --- 1. Verarbeitung von Datei-Uploads ---
      for (const file of files) {
        console.log(`Verarbeite Datei: ${file.name}`);
        console.log(`FileItems Stand:`, fileItems.map(i => ({name: i.name, type: i.type, tags: i.tags})));
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('rating', fileRatings[file.name] || 'safe');
          
          // Verbesserte Tag-Erfassung für Dateien
          const fileTags = getItemTags(file.name, 'file');
          if (fileTags.length > 0) {
            formData.append('tags', JSON.stringify(fileTags));
            console.log(`Uploading file ${file.name} with tags:`, fileTags);
          }

          // API-URL bestimmen (mit Fallback)
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/upload';
          
          // Anfrage mit Credentials senden
          const response = await fetch(apiUrl, {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          // Antwort des Servers verarbeiten
          const data = await response.json();
          
          // Debugging: Antwort des Servers
          console.log(`[DEBUG] Server-Antwort für File "${file.name}":`, data);

          // Fehlerbehandlung
          if (!response.ok) {
            throw new Error(data.error || `Upload von "${file.name}" fehlgeschlagen`);
          }

          // Erfolgreichen Upload speichern
          if (data.file && data.file.id) {
            successfulUploads.push({
              id: String(data.file.id),
              type: 'file'
            });
          }
        } catch (fileError) {
          // Einzelfehler beim File-Upload abfangen ohne den gesamten Prozess zu stoppen
          console.error(`[ERROR] Fehler beim Upload von Datei "${file.name}":`, fileError);
          setError(prev => prev ? `${prev}; ${fileError.message}` : fileError.message);
        }
      }

      // --- 2. Verarbeitung von URL-Uploads mit vorhandenen temporären Dateien ---
      for (const item of urlData) {
        try {
          const formData = new FormData();
          
          // Gemeinsame Felder für alle URL-Uploads
          formData.append('imageUrl', item.url);
          
          // Content Rating (immer 'safe' für URLs)
          formData.append('rating', 'safe');
          
          // Tags extrahieren
          const urlTags = getItemTags(item.url, 'url');
          
          // Debugging: Ausgabe der Tags vor dem Upload
          console.log(`[DEBUG] Tags für URL "${item.url}":`, urlTags);
          
          // Tags nur hinzufügen, wenn vorhanden
          if (urlTags.length > 0) {
            formData.append('tags', JSON.stringify(urlTags));
          }
          
          // Für URLs mit temporären Dateien
          if (item.tempFilePath) {
            formData.append('tempFilePath', item.tempFilePath);
            
            // Dimensionen hinzufügen, falls vorhanden
            if (item.dimensions) {
              formData.append('dimensions', JSON.stringify(item.dimensions));
            }
          }

          // API-URL bestimmen
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/upload';
          
          // Anfrage mit Credentials senden
          const response = await fetch(apiUrl, {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          // Antwort des Servers verarbeiten
          const data = await response.json();
          
          // Debugging: Antwort des Servers
          console.log(`[DEBUG] Server-Antwort für URL "${item.url}":`, data);

          // Fehlerbehandlung
          if (!response.ok) {
            throw new Error(data.error || `Upload von URL "${item.url}" fehlgeschlagen`);
          }

          // Erfolgreichen Upload speichern
          if (data.file && data.file.id) {
            successfulUploads.push({
              id: String(data.file.id),
              type: 'url'
            });
          }
        } catch (urlError) {
          // Einzelfehler beim URL-Upload abfangen
          console.error(`[ERROR] Fehler beim Upload von URL "${item.url}":`, urlError);
          setError(prev => prev ? `${prev}; ${urlError.message}` : urlError.message);
        }
      }

      // --- 3. Navigation nach erfolgreichen Uploads ---
      
      // Wenn wir erfolgreiche Uploads haben, entscheiden wir, wohin wir navigieren
      if (successfulUploads.length > 0) {
        // Bei genau einem Upload direkt zum Post navigieren
        if (successfulUploads.length === 1) {
          const postId = successfulUploads[0].id;
          console.log(`[INFO] Weiterleitung zu Post ID: ${postId}`);
          router.push(`/post/${postId}`);
        } 
        // Bei mehreren Uploads zur Übersichtsseite
        else {
          console.log(`[INFO] ${successfulUploads.length} Uploads erfolgreich, Weiterleitung zur Übersicht`);
          router.push('/posts');
        }
      } else if (error) {
        // Wenn wir nur Fehler hatten, bleiben wir auf der Upload-Seite (Fehler werden angezeigt)
        console.warn('[WARNING] Keine erfolgreichen Uploads');
      }
    } catch (err) {
      // Allgemeine Fehlerbehandlung für unerwartete Probleme
      console.error('[ERROR] Unerwarteter Fehler beim Upload-Prozess:', err);
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
    }
  }, [files, urlData, fileRatings, fileItems, getItemTags, router, error]);

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <div className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            
            <UploadBox onFileDrop={handleFileDrop} />
            <UrlInput 
              onUrlAdd={handleUrlAdd} 
              onImagePaste={handleFileDrop}
            />
            {hasFiles && (
              <>
                <div className="flex items-center justify-between">
                  <UploadOptions />
                  <div className="flex gap-4">
                    <button
                      onClick={handleClearAll}
                      className="px-4 py-2 text-sm rounded-lg text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading || isProcessingUrls}
                      className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                        isUploading || isProcessingUrls
                          ? 'bg-purple-400 cursor-not-allowed'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      {isUploading ? 'Uploading...' : isProcessingUrls ? 'Processing URLs...' : 'Upload'}
                    </button>
                  </div>
                </div>
                <FileList 
                  files={files} 
                  urls={urlData.map(item => item.url)}
                  onRemoveFile={handleRemoveFile}
                  onRemoveUrl={handleRemoveUrl}
                  onUpdateRating={updateFileRating}
                  onItemsUpdate={handleFileItemsUpdate}
                />
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
