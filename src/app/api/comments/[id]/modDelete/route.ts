import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Comment from '@/models/Comment';
import User from '@/models/User';
import mongoose from 'mongoose';
import { CommentStatsService } from '@/lib/services/commentStatsService';

// DELETE /api/comments/[id]/modDelete
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    console.log(`MOD-DELETE: Attempting to delete comment with ID: ${id} by moderator`);

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Überprüfen, ob es eine gültige MongoDB ID ist
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`MOD-DELETE: Invalid comment ID format: ${id}`);
      return NextResponse.json(
        { error: 'Invalid comment ID format' },
        { status: 400 }
      );
    }

    // Kommentar finden
    const comment = await Comment.findById(id);
    if (!comment) {
      console.error(`MOD-DELETE: Comment not found with ID: ${id}`);
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Benutzer abrufen für Rollenprüfung
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prüfen ob Benutzer Admin/Moderator-Rechte hat
    const isModerator = ['admin', 'moderator'].includes(user.role);

    if (!isModerator) {
      return NextResponse.json(
        { error: 'Not authorized - moderator privileges required' },
        { status: 403 }
      );
    }

    // Speichere die Post-ID und Autor-ID, bevor der Kommentar gelöscht wird
    const postId = comment.post;
    const authorId = comment.author;

    // Kommentar löschen
    await Comment.findByIdAndDelete(id);

    // Aktualisiere die Statistiken
    await CommentStatsService.updateStatsAfterCommentDeletion(id, postId, authorId);

    // Aktivität protokollieren
    try {
      const ModerationActivity = mongoose.models.ModerationActivity ||
        mongoose.model('ModerationActivity', new mongoose.Schema({
          action: String,
          targetType: String,
          target: mongoose.Schema.Types.ObjectId,
          moderator: mongoose.Schema.Types.ObjectId,
          reason: String,
          createdAt: { type: Date, default: Date.now }
        }));

      await ModerationActivity.create({
        action: 'delete',
        targetType: 'comment',
        target: id,
        moderator: session.user.id,
        reason: 'Moderator deletion',
        createdAt: new Date()
      });
    } catch (activityError) {
      console.error('Failed to log moderation activity:', activityError);
      // Fehlgeschlagene Protokollierung sollte den Löschvorgang nicht beeinträchtigen
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted by moderator'
    });
  } catch (error) {
    console.error('Error in moderator delete comment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}