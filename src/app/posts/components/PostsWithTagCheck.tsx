'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface PostsWithTagCheckProps {
  children: React.ReactNode;
}

export function PostsWithTagCheck({ children }: PostsWithTagCheckProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasNoResults, setHasNoResults] = useState(false);
  const tagParam = searchParams.get('tag');
  
  useEffect(() => {
    // Wenn kein Tag-Parameter vorhanden ist, nichts weiter tun
    if (!tagParam) {
      setLoading(false);
      setHasError(false);
      setHasNoResults(false);
      return;
    }
    
    console.log(`Checking tag: ${tagParam}`);
    setLoading(true);
    setHasError(false);
    setHasNoResults(false);
    
    // Diese Funktion prüft, ob Posts mit dem angegebenen Tag existieren
    const checkTagExists = async () => {
      try {
        // Erstelle eine separate API-Anfrage, um nach Posts mit diesem Tag zu suchen
        const tagCheckParams = new URLSearchParams();
        tagCheckParams.append('tag', tagParam);
        tagCheckParams.append('limit', '1'); // Wir brauchen nur ein Ergebnis zur Prüfung
        
        // Wir fügen einen Cache-Buster hinzu, um sicherzustellen, dass die Anfrage nicht gecacht wird
        tagCheckParams.append('_cb', Date.now().toString());
        
        console.log(`Sending tag check request: /api/posts?${tagCheckParams.toString()}`);
        const response = await fetch(`/api/posts?${tagCheckParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to check tag');
        }
        
        const data = await response.json();
        console.log(`Tag check response:`, data);
        
        // Wenn keine Posts gefunden wurden, setze den entsprechenden Status
        if (!data.posts || data.posts.length === 0) {
          console.log(`No posts found with tag: ${tagParam}`);
          setHasNoResults(true);
        } else {
          console.log(`Found ${data.posts.length} posts with tag: ${tagParam}`);
          setHasNoResults(false);
          
          // Stelle sicher, dass die Tag-Parameter korrekt in der URL sind
          // Dies löst das Problem, wenn beim Client-seitigen Routing die Parameter nicht richtig übernommen werden
          const currentParams = new URLSearchParams(window.location.search);
          
          // Füge den Tag-Parameter hinzu, falls er nicht vorhanden ist
          if (!currentParams.has('tag') || currentParams.get('tag') !== tagParam) {
            currentParams.set('tag', tagParam);
            // Erzwinge ein Neuladen mit korrekten Parametern
            const newUrl = `${pathname}?${currentParams.toString()}`;
            console.log(`Enforcing correct URL parameters: ${newUrl}`);
            router.push(newUrl);
          }
        }
      } catch (error) {
        console.error('Error checking tag:', error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    
    // Führe die Tag-Prüfung aus
    checkTagExists();
  }, [tagParam, pathname, router]); // Abhängigkeiten aktualisiert
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Suche nach Posts mit dem Tag &quot;{tagParam}&quot;...
          </p>
        </div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl max-w-md">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            Fehler bei der Tag-Suche
          </h2>
          <p className="text-red-600 dark:text-red-300">
            Bei der Suche nach Posts mit dem Tag &quot;{tagParam}&quot; ist ein Fehler aufgetreten.
            Bitte versuchen Sie es später erneut.
          </p>
        </div>
      </div>
    );
  }
  
  if (hasNoResults && tagParam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-xl max-w-md">
          <h2 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-2">
            Keine Ergebnisse gefunden
          </h2>
          <p className="text-amber-700 dark:text-amber-300">
            No posts were found with the tag &quot;{tagParam}&quot;.
          </p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 