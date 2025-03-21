import path from 'path';

/**
 * Validiert und sanitiert Dateipfade für den sicheren Zugriff
 * Verhindert directory traversal und andere Pfad-Manipulationen
 */
export function validateAndSanitizePath(inputPath: string | string[]): string | null {
  try {
    // Bei Array-Pfaden diese zusammenführen
    const pathString = Array.isArray(inputPath) ? inputPath.join('/') : inputPath;
    
    // Pfad normalisieren
    const normalizedPath = path.normalize(pathString)
      .replace(/^(\.\.(\/|\\|$))+/, '') // Entferne führende "../"
      .replace(/\\/g, '/');             // Vereinheitliche Trennzeichen
    
    // Sicherheitsprüfungen
    if (normalizedPath.includes('../') || 
        normalizedPath.includes('..\\') ||
        normalizedPath.startsWith('/') || 
        normalizedPath.startsWith('\\') ||
        /[<>:"|?*]/.test(normalizedPath)) {
      console.warn('Path validation failed:', { inputPath, normalizedPath });
      return null;
    }
    
    return normalizedPath;
  } catch (error) {
    console.error('Path validation error:', error);
    return null;
  }
}

/**
 * Überprüft, ob ein Pfad innerhalb eines bestimmten Basisverzeichnisses liegt
 */
export function isPathWithinBase(basePath: string, targetPath: string): boolean {
  try {
    // Absolute Pfade berechnen
    const absoluteBasePath = path.resolve(basePath);
    const absoluteTargetPath = path.resolve(path.join(basePath, targetPath));
    
    // Überprüfen, ob der Ziel-Pfad mit dem Basis-Pfad beginnt
    return absoluteTargetPath.startsWith(absoluteBasePath);
  } catch (error) {
    console.error('Path containment check error:', error);
    return false;
  }
} 