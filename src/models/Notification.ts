import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  recipient: mongoose.Types.ObjectId;
  type: 'comment' | 'reply' | 'like' | 'favorite' | 'mention' | 'system';
  content: string;
  relatedId?: mongoose.Types.ObjectId;
  relatedModel?: 'Post' | 'Comment' | 'User';
  data?: any;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['comment', 'reply', 'like', 'favorite', 'mention', 'system'],
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
    index: true
  },
  relatedModel: {
    type: String,
    enum: ['Post', 'Comment', 'User']
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indizes für häufige Abfragen
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ relatedModel: 1, relatedId: 1 });

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

export default Notification; 