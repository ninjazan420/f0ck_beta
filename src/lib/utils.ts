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
 * @param forceRefresh Whether to force a new timestamp even if the URL already has cache busting
 * @returns URL with cache busting parameter
 */
export function getImageUrlWithCacheBuster(url: string | null | undefined, forceRefresh: boolean = false): string {
  if (!url) return '/avatar-placeholder.png';

  // If the URL is a default avatar, return it as is
  if (url.includes('defaultavatar.png')) {
    return url;
  }

  // Check if URL already has cache busting parameters
  const hasCacheBuster = url.includes('v=') || url.includes('t=');

  // If URL already has cache busting and we're not forcing a refresh, return as is
  if (hasCacheBuster && !forceRefresh) {
    return url;
  }

  // Remove any existing cache busters to avoid duplicates
  let cleanUrl = url;
  if (hasCacheBuster) {
    // Remove v= or t= parameters
    cleanUrl = url.replace(/[?&](v|t)=[^&]+/, '');
    // Fix URL if we removed the only parameter
    if (cleanUrl.endsWith('?')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    // Fix URL if we removed a parameter in the middle
    cleanUrl = cleanUrl.replace(/\?&/, '?');
  }

  // Check if the cleaned URL has any query parameters
  const hasQuery = cleanUrl.includes('?');

  // Add a new timestamp as cache buster
  return `${cleanUrl}${hasQuery ? '&' : '?'}v=${Date.now()}`;
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
