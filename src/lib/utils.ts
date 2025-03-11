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
export function getImageUrlWithCacheBuster(url: string, additionalBuster?: string): string {
  if (!url) return '';
  
  // Check if URL already has query parameters
  const hasParams = url.includes('?');
  
  // Add cache buster with current timestamp and optional additional buster
  const cacheBuster = additionalBuster ? 
    `v=${Date.now()}_${additionalBuster}` : 
    `v=${Date.now()}`;
    
  return hasParams ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;
}
