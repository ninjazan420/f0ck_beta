import mongoose from 'mongoose';
import Comment from '@/models/Comment';
import User from '@/models/User';
import Post from '@/models/Post';

/**
 * Service zur Verwaltung von Kommentarstatistiken
 */
export class CommentStatsService {
  /**
   * Aktualisiert alle Kommentarstatistiken in der Datenbank
   * Diese Funktion kann verwendet werden, um alle Statistiken zu aktualisieren
   */
  static async updateAllCommentStats(): Promise<void> {
    try {
      // Hole alle Posts
      const posts = await mongoose.model('Post').find().select('_id');
      console.log(`Updating comment stats for ${posts.length} posts`);

      // Aktualisiere die Statistiken für jeden Post
      for (const post of posts) {
        await this.updatePostCommentStats(post._id);
      }

      // Hole alle Benutzer
      const users = await mongoose.model('User').find().select('_id');
      console.log(`Updating comment stats for ${users.length} users`);

      // Aktualisiere die Statistiken für jeden Benutzer
      for (const user of users) {
        await this.updateUserCommentStats(user._id);
      }

      console.log('All comment stats updated successfully');
    } catch (error) {
      console.error('Error updating all comment stats:', error);
    }
  }
  /**
   * Aktualisiert die Kommentarstatistiken für einen Post
   * @param postId Die ID des Posts
   */
  static async updatePostCommentStats(postId: string | mongoose.Types.ObjectId): Promise<void> {
    try {
      if (!postId) return;

      const postObjectId = typeof postId === 'string' && mongoose.Types.ObjectId.isValid(postId)
        ? new mongoose.Types.ObjectId(postId)
        : postId;

      // Zähle nur genehmigte Kommentare
      const commentCount = await Comment.countDocuments({
        post: postObjectId,
        status: 'approved'
      });

      // Aktualisiere die Kommentarstatistik des Posts
      await Post.findByIdAndUpdate(
        postObjectId,
        { 'stats.comments': commentCount }
      );

      console.log(`Updated comment stats for post ${postId}: ${commentCount} comments`);
    } catch (error) {
      console.error(`Error updating post comment stats for post ${postId}:`, error);
    }
  }

  /**
   * Aktualisiert die Kommentarstatistiken für einen Benutzer
   * @param userId Die ID des Benutzers
   */
  static async updateUserCommentStats(userId: string | mongoose.Types.ObjectId): Promise<void> {
    try {
      if (!userId) return;

      const userObjectId = typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;

      // Zähle nur genehmigte Kommentare des Benutzers
      const commentCount = await Comment.countDocuments({
        author: userObjectId,
        status: 'approved'
      });

      // Hole alle Kommentar-IDs des Benutzers
      const comments = await Comment.find({
        author: userObjectId,
        status: 'approved'
      }).select('_id');

      const commentIds = comments.map(comment => comment._id);

      // Aktualisiere das comments-Array des Benutzers
      await User.findByIdAndUpdate(
        userObjectId,
        { comments: commentIds }
      );

      console.log(`Updated comment stats for user ${userId}: ${commentCount} comments`);
    } catch (error) {
      console.error(`Error updating user comment stats for user ${userId}:`, error);
    }
  }

  /**
   * Aktualisiert die Kommentarstatistiken nach dem Löschen eines Kommentars
   * @param commentId Die ID des gelöschten Kommentars
   * @param postId Die ID des Posts, zu dem der Kommentar gehörte
   * @param authorId Die ID des Autors des Kommentars
   */
  static async updateStatsAfterCommentDeletion(
    commentId: string | mongoose.Types.ObjectId,
    postId: string | mongoose.Types.ObjectId,
    authorId?: string | mongoose.Types.ObjectId
  ): Promise<void> {
    try {
      // Aktualisiere die Poststatistiken
      if (postId) {
        await this.updatePostCommentStats(postId);
      }

      // Aktualisiere die Benutzerstatistiken, wenn ein Autor vorhanden ist
      if (authorId) {
        await this.updateUserCommentStats(authorId);
      }
    } catch (error) {
      console.error(`Error updating stats after comment deletion:`, error);
    }
  }
}
