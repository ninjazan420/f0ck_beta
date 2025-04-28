import mongoose from 'mongoose';

export interface IComment extends mongoose.Document {
  content: string;
  author?: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  replyTo?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  reports?: {
    user: mongoose.Types.ObjectId;
    reason: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indizes für häufige Abfragen
commentSchema.index({ createdAt: -1 });
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

// Virtual für die Anzahl der Reports
commentSchema.virtual('reportCount').get(function() {
  return this.reports?.length || 0;
});

const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
