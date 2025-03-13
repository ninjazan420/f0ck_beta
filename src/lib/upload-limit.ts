import { NextResponse } from 'next/server';

// Atomare Implementierung des Upload-Limits
const userUploadLimits: Record<string, { total: number, resetTime: number, lock: boolean }> = {};

export function checkUploadLimit(userId: string | null, fileSize: number, maxSizePerHour = 200 * 1024 * 1024) {
  const now = Date.now();
  const key = userId || 'anonymous';
  
  // Erstelle Eintrag, falls nicht vorhanden
  if (!userUploadLimits[key]) {
    userUploadLimits[key] = {
      total: 0,
      resetTime: now + 3600000, // 1 Stunde
      lock: false
    };
  }
  
  // Verbesserter Lock-Mechanismus mit Timeout
  if (userUploadLimits[key].lock) {
    // Maximale Anzahl von Versuchen und Timeout
    const maxAttempts = 5;
    let attempts = 0;
    
    return new Promise<NextResponse | null>((resolve) => {
      const tryAgain = () => {
        attempts++;
        if (!userUploadLimits[key].lock || attempts >= maxAttempts) {
          resolve(checkUploadLimit(userId, fileSize, maxSizePerHour));
        } else {
          setTimeout(tryAgain, 50 * attempts); // Exponentielles Backoff
        }
      };
      setTimeout(tryAgain, 50);
    });
  }
  
  // Lock setzen
  userUploadLimits[key].lock = true;
  
  try {
    // Limit zurücksetzen, wenn es abgelaufen ist
    if (userUploadLimits[key].resetTime < now) {
      userUploadLimits[key].total = 0;
      userUploadLimits[key].resetTime = now + 3600000; // 1 Stunde
    }
    
    // Prüfen und aktualisieren des Upload-Limits
    if (userUploadLimits[key].total + fileSize > maxSizePerHour) {
      return NextResponse.json(
        { error: 'Upload limit exceeded for this hour' },
        { status: 429 }
      );
    }
    
    // Hochgeladene Größe aufzeichnen
    userUploadLimits[key].total += fileSize;
    return null;
  } finally {
    // Lock immer freigeben
    userUploadLimits[key].lock = false;
  }
} 