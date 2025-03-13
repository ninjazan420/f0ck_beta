/**
 * Validiert und sanitiert Dateipfade für den sicheren Zugriff
 */
export function validateAndSanitizePath(path: string | string[]): string | null {
  try {
    // Bei Array-Pfaden diese zusammenführen
    const pathString = Array.isArray(path) ? path.join('/') : path;
    
    // Sicherheitsprüfungen
    if (pathString.includes('..') || 
        pathString.startsWith('/') || 
        pathString.startsWith('\\') ||
        /[<>:"|?*]/.test(pathString)) {
      return null;
    }
    
    return pathString;
  } catch (error) {
    console.error('Path validation error:', error);
    return null;
  }
} 