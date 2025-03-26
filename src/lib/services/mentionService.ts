import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { NotificationService } from './notificationService';

export class MentionService {
  static async extractAndProcessMentions(content: string, authorId: string, postId: string, commentId: string) {
    try {
      const mentionRegex = /@([a-zA-Z0-9_]+)/g;
      const mentions = content.match(mentionRegex) || [];
      
      if (mentions.length === 0) return [];
      
      await dbConnect();
      
      const processedMentions = [];
      
      for (const mention of mentions) {
        const username = mention.substring(1); // Entferne das @ am Anfang
        
        const mentionedUser = await User.findOne({ 
          username: { $regex: new RegExp(`^${username}$`, 'i') }
        });
        
        if (mentionedUser && mentionedUser._id.toString() !== authorId) {
          processedMentions.push(mentionedUser);
          
          await NotificationService.notifyMention(
            mentionedUser._id.toString(),
            authorId,
            postId,
            commentId
          );
        }
      }
      
      return processedMentions;
    } catch (error) {
      console.error('Error processing mentions:', error);
      return [];
    }
  }
  
  static async searchUsers(query: string, limit = 5) {
    try {
      // Benutze die neue API-Route statt direkter DB-Zugriffe
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`API Fehler: ${response.status}`);
      }
      
      const users = await response.json();
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
} 