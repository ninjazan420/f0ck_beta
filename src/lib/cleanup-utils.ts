import fs from 'fs/promises';
import path from 'path';
import { join } from 'path';

// Konstante für das Temp-Verzeichnis
const TEMP_DIR = join(process.cwd(), 'public', 'uploads', 'temp');
// Maximales Alter für temporäre Dateien in Millisekunden (2 Stunden)
const MAX_TEMP_FILE_AGE = 2 * 60 * 60 * 1000;

interface CleanupStats {
  scannedFiles: number;
  deletedFiles: number;
  deletedSize: number;
  errors: string[];
  timestamp: Date;
}

/**
 * Löscht alle temporären Dateien, die älter als MAX_TEMP_FILE_AGE sind
 */
export async function cleanupTempFiles(): Promise<CleanupStats> {
  const stats: CleanupStats = {
    scannedFiles: 0,
    deletedFiles: 0,
    deletedSize: 0,
    errors: [],
    timestamp: new Date()
  };

  try {
    console.log(`Starting cleanup of temp directory: ${TEMP_DIR}`);
    
    // Prüfen, ob das Verzeichnis existiert
    try {
      await fs.access(TEMP_DIR);
    } catch (error) {
      console.log(`Temp directory does not exist. Creating: ${TEMP_DIR}`);
      await fs.mkdir(TEMP_DIR, { recursive: true });
      return stats; // Nichts zu bereinigen
    }
    
    // Alle Dateien im Temp-Verzeichnis auflisten
    const files = await fs.readdir(TEMP_DIR);
    stats.scannedFiles = files.length;
    
    if (files.length === 0) {
      console.log('No files found in temp directory.');
      return stats;
    }
    
    console.log(`Found ${files.length} files in temp directory.`);
    
    // Aktuelles Datum für den Vergleich
    const now = Date.now();
    
    // Jede Datei überprüfen
    for (const filename of files) {
      const filePath = join(TEMP_DIR, filename);
      
      try {
        // Dateistatistiken abrufen
        const stat = await fs.stat(filePath);
        
        // Prüfen, ob die Datei zu alt ist
        const fileAge = now - stat.mtime.getTime();
        if (fileAge > MAX_TEMP_FILE_AGE) {
          const fileSizeMB = stat.size / (1024 * 1024);
          console.log(`Deleting old temp file: ${filename} (${fileSizeMB.toFixed(2)} MB, ${(fileAge / (60 * 1000)).toFixed(0)} minutes old)`);
          
          // Datei löschen
          await fs.unlink(filePath);
          
          // Statistiken aktualisieren
          stats.deletedFiles++;
          stats.deletedSize += stat.size;
          
          console.log(`Successfully deleted: ${filename}`);
        }
      } catch (error) {
        const errorMessage = `Error processing file ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMessage);
        stats.errors.push(errorMessage);
      }
    }
    
    console.log(`Cleanup completed. Deleted ${stats.deletedFiles} files, freed ${(stats.deletedSize / (1024 * 1024)).toFixed(2)} MB.`);
    
    // Schreibe Log-Eintrag
    await logCleanupOperation(stats);
    
    return stats;
  } catch (error) {
    const errorMessage = `Error during temp cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage);
    stats.errors.push(errorMessage);
    
    // Auch bei Fehlern das Ergebnis loggen
    await logCleanupOperation(stats).catch(e => console.error('Failed to log cleanup:', e));
    
    return stats;
  }
}

/**
 * Speichert die Ergebnisse der Bereinigung in einer Log-Datei
 */
async function logCleanupOperation(stats: CleanupStats): Promise<void> {
  const LOG_DIR = join(process.cwd(), 'logs');
  const LOG_FILE = join(LOG_DIR, 'temp-cleanup.log');
  
  try {
    // Stelle sicher, dass das Log-Verzeichnis existiert
    await fs.mkdir(LOG_DIR, { recursive: true });
    
    // Formatiere den Log-Eintrag
    const logEntry = `[${stats.timestamp.toISOString()}] Scanned: ${stats.scannedFiles}, Deleted: ${stats.deletedFiles}, Freed: ${(stats.deletedSize / (1024 * 1024)).toFixed(2)} MB, Errors: ${stats.errors.length}\n`;
    
    // Schreibe in die Log-Datei (append)
    await fs.appendFile(LOG_FILE, logEntry, 'utf8');
    
    console.log(`Cleanup log written to: ${LOG_FILE}`);
  } catch (error) {
    console.error('Failed to write cleanup log:', error);
  }
} 