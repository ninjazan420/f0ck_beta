import { io, Socket } from 'socket.io-client';

interface CommentUpdate {
  type: 'new' | 'update' | 'delete';
  commentId: string;
  data?: any;
}

class CommentSocketService {
  private listeners: Map<string, (update: CommentUpdate) => void> = new Map();
  private polling = false;
  private activePostIds = new Set<string>();
  private pollingInterval: NodeJS.Timeout | null = null;
  
  startPolling(postId: string) {
    this.activePostIds.add(postId);
    
    if (!this.polling) {
      this.polling = true;
      this.pollingInterval = setInterval(() => this.pollUpdates(), 10000); // 10 Sekunden
      console.log('Comment polling started');
    }
  }
  
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.polling = false;
      this.activePostIds.clear();
      console.log('Comment polling stopped');
    }
  }
  
  async pollUpdates() {
    if (this.activePostIds.size === 0) return;
    
    try {
      for (const postId of this.activePostIds) {
        const timestamp = Date.now();
        const res = await fetch(`/api/comments?postId=${postId}&timestamp=${timestamp}`);
        
        if (res.ok) {
          const data = await res.json();
          this.listeners.forEach(listener => listener({
            type: 'update',
            commentId: 'all',
            data
          }));
        }
      }
    } catch (error) {
      console.error('Failed to poll comment updates:', error);
    }
  }
  
  subscribe(id: string, postId: string, callback: (update: CommentUpdate) => void) {
    this.listeners.set(id, callback);
    this.startPolling(postId);
  }
  
  unsubscribe(id: string) {
    this.listeners.delete(id);
    if (this.listeners.size === 0) {
      this.stopPolling();
    }
  }
  
  emit(event: string, data: any) {
    // Für Kompatibilität mit bestehendem Code, tut nichts
  }
}

export const commentSocket = new CommentSocketService(); 