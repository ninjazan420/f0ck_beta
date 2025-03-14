import dbConnect from '@/lib/db/mongodb';
import Notification from '@/models/Notification';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import mongoose from 'mongoose';

type NotificationType = 'comment' | 'reply' | 'like' | 'favorite' | 'mention' | 'system';

interface CreateNotificationOptions {
  recipientId: string;
  type: NotificationType;
  content: string;
  relatedId?: string;
  relatedModel?: 'Post' | 'Comment' | 'User';
  data?: any;
}

export class NotificationService {
  /**
   * Creates a new notification
   */
  static async createNotification({
    recipientId,
    type,
    content,
    relatedId,
    relatedModel,
    data
  }: CreateNotificationOptions) {
    try {
      await dbConnect();
      
      const notification = new Notification({
        recipient: new mongoose.Types.ObjectId(recipientId),
        type,
        content,
        ...(relatedId && { relatedId: new mongoose.Types.ObjectId(relatedId) }),
        ...(relatedModel && { relatedModel }),
        data,
        read: false,
      });
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Creates a notification for a new comment
   */
  static async notifyNewComment(commentId: string) {
    try {
      await dbConnect();
      
      const comment = await Comment.findById(commentId)
        .populate('post', 'title author numericId id thumbnailUrl imageUrl');
      
      if (!comment || !comment.post) return;
      
      // Only create notification if comment author is not post author
      if (comment.author && comment.post.author && 
          comment.author.toString() !== comment.post.author.toString()) {
        
        // WICHTIG: Hier bevorzugen wir numericId oder id (falls numericId fehlt)
        const postId = comment.post.numericId || comment.post.id || comment.post._id;
        
        await this.createNotification({
          recipientId: comment.post.author.toString(),
          type: 'comment',
          content: 'Someone commented on your post',
          relatedId: comment.post._id.toString(),
          relatedModel: 'Post',
          data: {
            postId: postId.toString(),
            postTitle: comment.post.title,
            commentId: comment._id,
            commentContent: comment.content.substring(0, 100),
            postThumbnail: comment.post.thumbnailUrl || comment.post.imageUrl
          }
        });
      }
    } catch (error) {
      console.error('Error notifying about new comment:', error);
    }
  }

  /**
   * Creates a notification for a reply to a comment
   */
  static async notifyCommentReply(commentId: string) {
    try {
      await dbConnect();
      
      const comment = await Comment.findById(commentId)
        .populate('replyTo', 'author')
        .populate('post', 'title numericId id thumbnailUrl imageUrl');
      
      if (!comment || !comment.replyTo || !comment.post) return;
      
      // Only create notification if reply author is not original comment author
      if (comment.author && comment.replyTo.author && 
          comment.author.toString() !== comment.replyTo.author.toString()) {
        
        // WICHTIG: Hier auch numericId oder id bevorzugen
        const postId = comment.post.numericId || comment.post.id || comment.post._id;
        
        await this.createNotification({
          recipientId: comment.replyTo.author.toString(),
          type: 'reply',
          content: 'Someone replied to your comment',
          relatedId: comment.post._id.toString(),
          relatedModel: 'Post',
          data: {
            postId: postId.toString(),
            postTitle: comment.post.title,
            commentId: comment._id,
            replyToId: comment.replyTo._id,
            commentContent: comment.content.substring(0, 100),
            postThumbnail: comment.post.thumbnailUrl || comment.post.imageUrl
          }
        });
      }
    } catch (error) {
      console.error('Error notifying about comment reply:', error);
    }
  }

  /**
   * Creates a notification for a like on a post
   */
  static async notifyPostLike(postId: string, likerId: string) {
    try {
      await dbConnect();
      
      // Post mit allen notwendigen Details laden
      const post = await Post.findById(postId)
        .populate('author', '_id')
        .select('_id numericId id title thumbnailUrl imageUrl author');
      
      if (!post || !post.author) {
        console.error(`Could not create like notification: Post ${postId} not found or has no author`);
        return;
      }
      
      // WICHTIG: Nutze numericId oder id anstelle von _id
      const notificationPostId = post.numericId || post.id || post._id;
      
      console.log(`Creating like notification for post with ID ${notificationPostId}`);
      
      // Nur Benachrichtigung erstellen, wenn nicht vom eigenen Autor
      if (likerId !== post.author._id.toString()) {
        await this.createNotification({
          recipientId: post.author._id.toString(),
          type: 'like',
          content: 'Someone liked your post',
          relatedId: post._id.toString(),
          relatedModel: 'Post',
          data: {
            postId: notificationPostId.toString(),
            postTitle: post.title || 'Untitled post',
            postThumbnail: post.thumbnailUrl || post.imageUrl || null
          }
        });
        console.log(`Created like notification with postId=${notificationPostId}`);
      }
    } catch (error) {
      console.error('Error creating like notification:', error);
    }
  }

  /**
   * Creates a notification when a user adds a post to favorites
   */
  static async notifyPostFavorite(postId: string, userId: string) {
    try {
      await dbConnect();
      
      // Finde den Post mit dieser ID
      const post = await Post.findById(postId)
        .populate('author', '_id')
        .select('_id numericId id title thumbnailUrl imageUrl author');
      
      if (!post || !post.author) {
        console.log(`Could not create favorite notification: Post ${postId} not found or has no author`);
        return;
      }
      
      // WICHTIG: Hier auch numericId oder id bevorzugen
      const notificationPostId = post.numericId || post.id || post._id;
      
      console.log(`Creating favorite notification: User ${userId} favorited post by ${post.author._id}`);
      
      // Nur Benachrichtigung erstellen, wenn der Favorit nicht vom Post-Autor selbst stammt
      if (userId !== post.author._id.toString()) {
        await this.createNotification({
          recipientId: post.author._id.toString(),
          type: 'favorite', // Ändern von 'system' zu 'favorite' für korrekte Typ-Erkennung
          content: 'Someone added your post to favorites',
          relatedId: post._id.toString(),
          relatedModel: 'Post',
          data: {
            postId: notificationPostId.toString(),
            postTitle: post.title || 'Untitled post',
            postThumbnail: post.thumbnailUrl || post.imageUrl || null
          }
        });
        console.log(`Favorite notification created successfully for user ${post.author._id}`);
      } else {
        console.log(`No notification sent: User ${userId} favorited their own post`);
      }
    } catch (error) {
      console.error('Error creating favorite notification:', error);
    }
  }
} 