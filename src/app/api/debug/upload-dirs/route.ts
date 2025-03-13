import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }
  try {
    const baseDir = join(process.cwd(), 'public', 'uploads');
    const dirs = ['original', 'thumbnails', 'temp'];
    
    const results = {};
    
    // Überprüfe das Basis-Verzeichnis
    try {
      const baseStat = await stat(baseDir);
      results['base'] = {
        path: baseDir,
        exists: true,
        isDirectory: baseStat.isDirectory(),
        permissions: baseStat.mode.toString(8),
        size: baseStat.size
      };
    } catch (error) {
      results['base'] = {
        path: baseDir,
        exists: false,
        error: error.message
      };
    }
    
    // Überprüfe die Unterverzeichnisse
    for (const dir of dirs) {
      const dirPath = join(baseDir, dir);
      try {
        const dirStat = await stat(dirPath);
        const files = await readdir(dirPath);
        
        results[dir] = {
          path: dirPath,
          exists: true,
          isDirectory: dirStat.isDirectory(),
          permissions: dirStat.mode.toString(8),
          fileCount: files.length,
          files: files.slice(0, 10) // Maximal 10 Dateien anzeigen
        };
      } catch (error) {
        results[dir] = {
          path: dirPath,
          exists: false,
          error: error.message
        };
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error checking upload directories:', error);
    return NextResponse.json(
      { error: 'Failed to check upload directories' },
      { status: 500 }
    );
  }
} 