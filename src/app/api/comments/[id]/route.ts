import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Comment from '@/models/Comment';
import User from '@/models/User';
import mongoose from 'mongoose';

// DELETE /api/comments/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Stellen Sie sicher, dass params bereits vollständig initialisiert ist
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    console.log(`DELETE: Attempting to delete comment with ID: ${id}`);

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Überprüfen, ob es eine gültige MongoDB ID ist
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      console.error(`DELETE: Invalid comment ID format: ${id}`);
      return NextResponse.json(
        { error: 'Invalid comment ID format' },
        { status: 400 }
      );
    }

    // Kommentar finden
    const comment = await Comment.findById(id)
      .populate('author', 'username avatar role');
    if (!comment) {
      console.error(`DELETE: Comment not found with ID: ${id}`);
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

    // Prüfen ob Benutzer der Autor ist oder Admin/Moderator-Rechte hat
    console.log('Author check:', {
      commentAuthor: comment.author,
      sessionUserId: session.user.id,
      userRole: user.role
    });
    
    const isAuthor = comment.author && 
      (comment.author._id 
        ? comment.author._id.toString() === session.user.id 
        : comment.author.toString() === session.user.id);
    const isModerator = user && ['moderator', 'admin'].includes(user.role);
    
    console.log('Authorization result:', { isAuthor: isAuthor ? true : null, isModerator });

    if (!isAuthor && !isModerator) {
      return NextResponse.json(
        { error: 'Not authorized to delete this comment' },
        { status: 403 }
      );
    }

    // Kommentar löschen
    await Comment.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/comments/[id]
export async function PATCH(
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

    console.log(`PATCH: Attempting to update comment with ID: ${id}`);

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Überprüfen, ob es eine gültige MongoDB ID ist
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      console.error(`PATCH: Invalid comment ID format: ${id}`);
      return NextResponse.json(
        { error: 'Invalid comment ID format' },
        { status: 400 }
      );
    }

    // Kommentar finden
    const comment = await Comment.findById(id)
      .populate('author', 'username avatar role');
    if (!comment) {
      console.error(`PATCH: Comment not found with ID: ${id}`);
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

    // Prüfen ob Benutzer der Autor ist oder Admin/Moderator-Rechte hat
    console.log('Author check:', {
      commentAuthor: comment.author,
      sessionUserId: session.user.id,
      userRole: user.role
    });
    
    const isAuthor = comment.author && 
      (comment.author._id 
        ? comment.author._id.toString() === session.user.id 
        : comment.author.toString() === session.user.id);
    const isModerator = user && ['moderator', 'admin'].includes(user.role);
    
    console.log('Authorization result:', { isAuthor: isAuthor ? true : null, isModerator });

    if (!isAuthor && !isModerator) {
      return NextResponse.json(
        { error: 'Not authorized to edit this comment' },
        { status: 403 }
      );
    }

    // Kommentar aktualisieren
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    ).populate('author', 'username avatar');

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 