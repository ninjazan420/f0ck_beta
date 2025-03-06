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
 * Berücksichtigt sowohl lokale als auch Live-Server-Umgebungen.
 */
export function getImageUrlWithCacheBuster(url: string): string {
  if (!url) return url;
  
  // Wenn die URL bereits absolut ist, füge nur den Timestamp hinzu
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }
  
  // Für Bilder aus dem Upload-Verzeichnis
  if (url.startsWith('/uploads/')) {
    // Füge einen Timestamp als Cache-Buster hinzu
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }
  
  // Für andere URLs auch einfach einen Timestamp hinzufügen
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}
