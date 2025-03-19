/**
 * Funktion zum Löschen eines Posts und Bereinigen von Benutzerreferenzen
 */
export async function deletePostAndCleanupReferences(postId: string, reason: string = 'Post deletion') {
  try {
    await dbConnect();
    
    // Finde den Post, der gelöscht werden soll
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error('Post nicht gefunden');
    }
    
    // Finde den Autor, falls vorhanden
    if (post.author) {
      // Entferne den Post aus uploads des Benutzers
      await User.findByIdAndUpdate(post.author, {
        $pull: { uploads: postId }
      });
      
      // Entferne den Post aus allen Benutzerlisten
      await User.updateMany(
        { $or: [
          { likes: postId },
          { favorites: postId },
          { dislikes: postId }
        ]},
        { 
          $pull: { 
            likes: postId,
            favorites: postId,
            dislikes: postId
          }
        }
      );
    }
    
    // Lösche alle zugehörigen Kommentare
    await Comment.deleteMany({ post: postId });
    
    // Lösche den Post selbst
    await Post.findByIdAndDelete(postId);
    
    // Erstelle einen ModLog-Eintrag für die Löschung
    await ModLog.create({
      moderator: post.author,
      action: 'delete',
      targetType: 'post',
      targetId: postId,
      reason: reason,
      metadata: {
        postId: post._id,
        postTitle: post.title
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler' };
  }
} 