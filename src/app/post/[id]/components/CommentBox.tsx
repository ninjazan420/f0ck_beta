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
        isAnonymous: false // Setze es explizit auf false statt den state zu verwenden
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
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert(`Fehler beim Senden des Kommentars: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  } finally {
    setIsSubmitting(false);
  }
}; 