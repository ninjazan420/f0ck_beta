import mongoose from 'mongoose';

interface IPost extends mongoose.Document {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  author: mongoose.Types.ObjectId;
  contentRating: 'safe' | 'sketchy' | 'unsafe';
  tags: string[];
  meta: {
    width: number;
    height: number;
    size: number;
    format: string;
    source: string | null;
    isVideo: boolean;
  };
  stats: {
    views: number;
    likes: number;
    dislikes: number;
    comments: number;
    favorites: number;
  };
  createdAt: Date;
  updatedAt: Date;
  hasCommentsDisabled?: boolean;
  isPinned?: boolean;
  isAd?: boolean;
}

const postSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Titel is required'],
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  contentRating: {
    type: String,
    enum: ['safe', 'sketchy', 'unsafe'],
    default: 'safe'
  },
  tags: [{
    type: String
  }],
  meta: {
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    size: { type: Number, default: 0 },
    format: { type: String, default: 'jpeg' },
    source: { type: String, default: null },
    isVideo: { type: Boolean, default: false }
  },
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 }
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],
  hasCommentsDisabled: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isAd: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware für automatische ID-Generierung
postSchema.pre('save', async function(next) {
  if (!this.id) {
    const lastPost = await mongoose.model('Post').findOne({}, { id: 1 }).sort({ id: -1 });
    this.id = lastPost ? lastPost.id + 1 : 1;
  }
  
  // Normalisiere Tags
  if (this.isModified('tags')) {
    this.tags = this.tags.map((tag: string) => 
      tag.toLowerCase().trim().replace(/\s+/g, '_')
    );
    
    // Entferne Duplikate
    this.tags = [...new Set(this.tags)];
    
    console.log('Normalized post tags:', this.tags);
  }
  
  next();
});

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;
