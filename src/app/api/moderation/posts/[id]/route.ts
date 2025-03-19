import { deletePostAndCleanupReferences } from '@/lib/moderation';

// In der DELETE-Methode:
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role || !['moderator', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.id;
    
    // Verwende unsere neue Funktion
    const result = await deletePostAndCleanupReferences(postId, 'Moderation action');
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in moderation delete:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 