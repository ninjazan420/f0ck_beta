'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { usePageMeta } from '@/context/PageMetaContext';

// Diese Komponente kann auf jeder Seite verwendet werden, um die Metadaten zu aktualisieren
export default function PageMetaUpdater({ title, description }: { title: string; description: string }) {
  const { setPageMeta } = usePageMeta();
  
  useEffect(() => {
    setPageMeta(title, description);
  }, [title, description, setPageMeta]);
  
  return null; // Diese Komponente rendert nichts
}

// Diese Komponente verwendet die aktuellen Metadaten aus dem Dokument
export function AutoPageMetaUpdater() {
  const pathname = usePathname();
  const { setPageMeta } = usePageMeta();
  const prevPathRef = useRef(pathname);
  
  useEffect(() => {
    // Nur ausführen, wenn sich der Pfad tatsächlich geändert hat
    if (prevPathRef.current === pathname) {
      return;
    }
    
    prevPathRef.current = pathname;
    
    // Funktion, die die aktuellen Metadaten aus dem Dokument holt
    const updateMetaFromDocument = () => {
      // Standardwerte falls nichts gefunden wird
      let title = 'f0ck.org';
      let description = 'Anonymous Imageboard';
      
      // Versuche, den Titel aus dem document zu holen
      if (typeof document !== 'undefined') {
        // Für den Titel
        const titleElement = document.querySelector('title');
        if (titleElement && titleElement.textContent) {
          // Entferne mögliche Suffix wie "| f0ck.org"
          title = titleElement.textContent.split('|')[0].trim();
        }
        
        // Für die Beschreibung
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && metaDescription.getAttribute('content')) {
          description = metaDescription.getAttribute('content') || description;
        }
      }
      
      setPageMeta(title, description);
    };
    
    // Führe die Aktualisierung nach einem kurzen Delay aus, um sicherzustellen,
    // dass das Dokument vollständig geladen ist
    const timer = setTimeout(updateMetaFromDocument, 50);
    
    return () => clearTimeout(timer);
  }, [pathname, setPageMeta]);
  
  return null;
} 