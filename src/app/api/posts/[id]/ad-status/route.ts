import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Nur Admins können AD-Status ändern
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const postId = parseInt(params.id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const { isAd, reason } = await request.json();

    if (typeof isAd !== 'boolean') {
      return NextResponse.json({ error: 'isAd must be a boolean' }, { status: 400 });
    }

    // Prüfen, ob der Post existiert
    const post = await db.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // AD-Status aktualisieren
    const updatedPost = await db.post.update({
      where: { id: postId },
      data: { 
        isAd: isAd,
        // Wenn es ein AD wird, automatisch Kommentare deaktivieren
        commentsDisabled: isAd ? true : post.commentsDisabled
      }
    });

    // Moderation-Log erstellen
    await db.moderationLog.create({
      data: {
        action: isAd ? 'MARK_AS_AD' : 'REMOVE_AD',
        targetType: 'POST',
        targetId: postId.toString(),
        moderatorId: session.user.id,
        reason: reason || `${isAd ? 'Marked as advertising' : 'Removed from advertising'}`
      }
    });

    return NextResponse.json({ 
      success: true, 
      isAd: updatedPost.isAd,
      commentsDisabled: updatedPost.commentsDisabled
    });
  } catch (error) {
    console.error('Error updating ad status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}