import User from '@/models/User';
import { ApplicationError, ErrorType } from '@/lib/error-handling';

// Standard-Speicherkontingent für jeden Benutzer (500MB)
export const DEFAULT_STORAGE_QUOTA = 500 * 1024 * 1024;
// Maximale Videogröße (100MB)
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

interface QuotaCheckResult {
  allowed: boolean;
  remainingQuota: number;
  usedStorage: number;
  totalQuota: number;
  errorMessage?: string;
}

/**
 * Prüft, ob ein Upload das Speicherkontingent eines Benutzers überschreiten würde
 */
export async function checkStorageQuota(userId: string, fileSize: number): Promise<QuotaCheckResult> {
  try {
    // Benutzer mit seinem aktuellen Speicherverbrauch holen
    const user = await User.findById(userId);
    if (!user) {
      throw new ApplicationError('User not found', ErrorType.AuthorizationError, 404);
    }

    // Wenn das Benutzermodell noch kein Speicherkontingent hat, initialisieren wir es
    if (typeof user.storageQuota !== 'number') {
      user.storageQuota = DEFAULT_STORAGE_QUOTA;
    }
    
    // Wenn usedStorage nicht existiert, initialisieren wir es
    if (typeof user.usedStorage !== 'number') {
      user.usedStorage = 0;
    }

    // Prüfen, ob die Datei zu groß ist (für Videos besonders wichtig)
    if (fileSize > MAX_VIDEO_SIZE) {
      return {
        allowed: false,
        remainingQuota: user.storageQuota - user.usedStorage,
        usedStorage: user.usedStorage,
        totalQuota: user.storageQuota,
        errorMessage: `Die Datei überschreitet die maximale Größe von ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`
      };
    }

    // Prüfen, ob genügend Speicherplatz für diesen Upload vorhanden ist
    const remainingQuota = user.storageQuota - user.usedStorage;
    
    if (fileSize > remainingQuota) {
      return {
        allowed: false,
        remainingQuota,
        usedStorage: user.usedStorage,
        totalQuota: user.storageQuota,
        errorMessage: `Nicht genügend Speicherplatz vorhanden. Sie haben noch ${(remainingQuota / (1024 * 1024)).toFixed(2)}MB von ${(user.storageQuota / (1024 * 1024)).toFixed(2)}MB verfügbar.`
      };
    }

    return {
      allowed: true,
      remainingQuota,
      usedStorage: user.usedStorage,
      totalQuota: user.storageQuota
    };
  } catch (error) {
    console.error('Error checking storage quota:', error);
    throw new ApplicationError(
      `Failed to check storage quota: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorType.QuotaError,
      500,
      error
    );
  }
}

/**
 * Aktualisiert den verwendeten Speicherplatz eines Benutzers nach einem Upload
 */
export async function updateStorageUsage(userId: string, fileSize: number): Promise<void> {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApplicationError('User not found', ErrorType.AuthorizationError, 404);
    }

    // Wenn usedStorage nicht existiert, initialisieren wir es
    if (typeof user.usedStorage !== 'number') {
      user.usedStorage = 0;
    }

    // Speicherverbrauch aktualisieren
    user.usedStorage += fileSize;
    await user.save();
    
    console.log(`Updated storage usage for user ${userId}: ${user.usedStorage} bytes used`);
  } catch (error) {
    console.error('Error updating storage usage:', error);
    throw new ApplicationError(
      `Failed to update storage usage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorType.QuotaError,
      500,
      error
    );
  }
}

/**
 * Reduziert den verwendeten Speicherplatz eines Benutzers (z.B. nach Löschung)
 */
export async function decreaseStorageUsage(userId: string, fileSize: number): Promise<void> {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApplicationError('User not found', ErrorType.AuthorizationError, 404);
    }

    // Wenn usedStorage nicht existiert, initialisieren wir es
    if (typeof user.usedStorage !== 'number') {
      user.usedStorage = 0;
      await user.save();
      return;
    }

    // Speicherverbrauch reduzieren, aber nie unter 0
    user.usedStorage = Math.max(0, user.usedStorage - fileSize);
    await user.save();
    
    console.log(`Decreased storage usage for user ${userId}: ${user.usedStorage} bytes used`);
  } catch (error) {
    console.error('Error decreasing storage usage:', error);
    throw new ApplicationError(
      `Failed to decrease storage usage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorType.QuotaError,
      500,
      error
    );
  }
} 