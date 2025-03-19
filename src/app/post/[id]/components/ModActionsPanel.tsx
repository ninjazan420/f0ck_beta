import { deletePostAndCleanupReferences } from '@/lib/moderation';

const handleDelete = async () => {
  if (confirm('Bist du sicher, dass du diesen Post löschen möchtest?')) {
    setIsDeleting(true);
    try {
      const result = await deletePostAndCleanupReferences(post._id, 'Moderation - Post deletion');
      
      if (result.success) {
        toast.success('Post wurde gelöscht');
        router.push('/');
      } else {
        throw new Error(result.error || 'Fehler beim Löschen des Posts');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Fehler beim Löschen des Posts');
    } finally {
      setIsDeleting(false);
    }
  }
}; 