// Vereinfachter Ersatz für Echtzeit-Updates ohne WebSockets
export class CommentUpdateService {
  private listeners: Map<string, (data: any) => void> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;
  
  startPolling(postId: string) {
    if (!this.pollingInterval) {
      this.pollingInterval = setInterval(() => this.fetchUpdates(postId), 10000); // 10 Sekunden
    }
  }
  
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  async fetchUpdates(postId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}/comments?timestamp=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        this.listeners.forEach(listener => listener(data));
      }
    } catch (error) {
      console.error('Failed to fetch comment updates', error);
    }
  }
  
  subscribe(id: string, callback: (data: any) => void) {
    this.listeners.set(id, callback);
  }
  
  unsubscribe(id: string) {
    this.listeners.delete(id);
    if (this.listeners.size === 0) {
      this.stopPolling();
    }
  }
}

export const commentUpdates = new CommentUpdateService(); 