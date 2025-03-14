const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!comment.trim() || isSubmitting || disabled) return;
  
  setIsSubmitting(true);
  
  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: comment,
        postId,
        isAnonymous
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to submit comment' }));
      console.error('Comment submission error:', errorData);
      throw new Error(errorData.error || 'Failed to submit comment');
    }
    
    const newComment = await response.json();
    
    // Zurücksetzen des Formulars
    setComment('');
    setIsAnonymous(false);
    
    // Callback für hinzugefügten Kommentar
    if (onCommentAdded) {
      onCommentAdded(newComment);
    }
    
    // Optional: Aktualisiere die Stats
    try {
      await fetch(`/api/posts/${postId}/updateStats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (statsError) {
      console.error('Fehler beim Aktualisieren der Statistiken:', statsError);
      // Sollte den Erfolg des Kommentars nicht beeinträchtigen
    }
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert(`Fehler beim Senden des Kommentars: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  } finally {
    setIsSubmitting(false);
  }
}; 