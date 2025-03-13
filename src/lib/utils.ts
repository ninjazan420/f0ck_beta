import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const LOGOS = [
  '/logos/1.png',
  '/logos/2.png',
  '/logos/3.png',
  '/logos/4.png',
  '/logos/5.png'
];

/**
 * Eine Hilfsfunktion zum bedingten Zusammenführen von CSS-Klassen
 * Kombiniert clsx für bedingte Klassen mit tailwind-merge zur Auflösung von Konflikten
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomLogo(): string {
  const randomIndex = Math.floor(Math.random() * LOGOS.length);
  return LOGOS[randomIndex];
}

/**
 * Adds a cache-busting parameter to an image URL
 * @param url The image URL to add cache busting to
 * @param additionalBuster Optional additional buster to append
 * @returns URL with cache busting parameter
 */
export function getImageUrlWithCacheBuster(url: string | null | undefined): string {
  if (!url) return '/avatar-placeholder.png';
  
  // Prüfe, ob die URL bereits einen Query-Parameter hat
  const hasQuery = url.includes('?');
  
  // Füge einen Timestamp als Cache-Buster hinzu
  return `${url}${hasQuery ? '&' : '?'}v=${Date.now()}`;
}

type LogContext = Record<string, any>;

export enum LogLevel { DEBUG, INFO, WARN, ERROR }

export function safeLog(level: LogLevel, message: string, context?: LogContext) {
  try {
    // Sanitize potentially sensitive data in context
    const safeCopy = context ? JSON.parse(JSON.stringify(context)) : undefined;
    
    if (safeCopy) {
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'csrf'];
      
      function sanitizeObject(obj: Record<string, any>) {
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          } else if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
            obj[key] = '***REDACTED***';
          }
        }
      }
      
      sanitizeObject(safeCopy);
    }
    
    const entry = {
      level: LogLevel[level],
      timestamp: new Date().toISOString(),
      message,
      ...(safeCopy && { context: safeCopy })
    };
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(JSON.stringify(entry));
        break;
      case LogLevel.INFO:
        console.log(JSON.stringify(entry));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(entry));
        break;
      case LogLevel.ERROR:
        console.error(JSON.stringify(entry));
        break;
    }
  } catch (err) {
    // Falls ein Fehler beim Loggen auftritt, Fallback mit einfacherem Format
    console.error(`Logging error: ${err}. Original message: ${message}`);
  }
}

// Beispiel für die Verwendung:
// safeLog(LogLevel.ERROR, 'Failed to process upload', { userId: '123', file: fileData });
