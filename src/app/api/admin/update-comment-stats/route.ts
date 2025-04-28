import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import { CommentStatsService } from '@/lib/services/commentStatsService';

/**
 * API-Route zum Aktualisieren aller Kommentarstatistiken
 * Diese Route kann nur von Administratoren aufgerufen werden
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    // Nur Administratoren dürfen diese Route aufrufen
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    
    // Starte die Aktualisierung aller Kommentarstatistiken
    await CommentStatsService.updateAllCommentStats();
    
    return NextResponse.json({
      success: true,
      message: 'Comment statistics update started'
    });
  } catch (error) {
    console.error('Error updating comment statistics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
