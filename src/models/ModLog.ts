import mongoose from 'mongoose';

export interface IModLog extends mongoose.Document {
  moderator: mongoose.Types.ObjectId;
  action: 'delete' | 'warn' | 'ban' | 'unban' | 'approve' | 'reject';
  targetType: 'comment' | 'post' | 'user';
  targetId: mongoose.Types.ObjectId;
  reason: string;
  metadata: {
    previousState?: any;
    newState?: any;
    duration?: number; // For temporary bans (in hours)
    autoTriggered?: boolean; // For automated actions
  };
  createdAt: Date;
}

const modLogSchema = new mongoose.Schema({
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['delete', 'warn', 'ban', 'unban', 'approve', 'reject'],
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['comment', 'post', 'user'],
    required: true,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType',
    index: true
  },
  reason: {
    type: String,
    required: true
  },
  metadata: {
    previousState: mongoose.Schema.Types.Mixed,
    newState: mongoose.Schema.Types.Mixed,
    duration: Number,
    autoTriggered: Boolean
  }
}, {
  timestamps: true
});

// Indizes für häufige Abfragen
modLogSchema.index({ createdAt: -1 });
modLogSchema.index({ moderator: 1, createdAt: -1 });
modLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

// Virtuals für zusätzliche Informationen
modLogSchema.virtual('isTemporary').get(function() {
  return this.action === 'ban' && this.metadata?.duration !== undefined;
});

const ModLog = mongoose.models.ModLog || mongoose.model<IModLog>('ModLog', modLogSchema);

export default ModLog; 