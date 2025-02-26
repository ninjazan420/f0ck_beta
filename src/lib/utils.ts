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
