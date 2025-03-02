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
 * Fügt einen Timestamp als Cache-Buster zu einem Bildpfad hinzu.
 * Verhindert, dass Bilder im Browser-Cache zwischengespeichert werden.
 * Bilder aus dem uploads-Verzeichnis werden über die API-Route geliefert.
 */
export function getImageUrlWithCacheBuster(url: string): string {
  if (!url) return url;
  
  // Wenn es sich um ein Bild aus dem uploads-Verzeichnis handelt, nutze die API-Route
  if (url.startsWith('/uploads/')) {
    // Entferne das führende /uploads/
    const imagePath = url.substring(9);
    // Nutze die API-Route mit dem Bildpfad und einem Timestamp
    return `/api/images/${encodeURIComponent(imagePath)}?t=${Date.now()}`;
  }
  
  // Füge für andere Bilder einfach einen Timestamp hinzu
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}
