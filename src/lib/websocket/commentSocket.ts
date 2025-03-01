import { io, Socket } from 'socket.io-client';

interface CommentUpdate {
  type: 'new' | 'update' | 'delete';
  commentId: string;
  data?: any;
}

class CommentSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, (update: CommentUpdate) => void> = new Map();

  connect() {
    if (!this.socket) {
      this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001', {
        path: '/api/comments/ws',
        transports: ['websocket']
      });

      this.socket.on('commentUpdate', (update: CommentUpdate) => {
        this.listeners.forEach(listener => listener(update));
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(id: string, callback: (update: CommentUpdate) => void) {
    this.listeners.set(id, callback);
    if (!this.socket) {
      this.connect();
    }
  }

  unsubscribe(id: string) {
    this.listeners.delete(id);
    if (this.listeners.size === 0) {
      this.disconnect();
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export const commentSocket = new CommentSocketService(); 