import mongoose from 'mongoose';

interface IPost extends mongoose.Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Titel is required'],
  },
  content: {
    type: String,
    required: [true, 'Inhalt is required'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true
});

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;
