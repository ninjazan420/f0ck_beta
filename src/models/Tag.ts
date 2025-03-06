import mongoose from 'mongoose';

export interface ITag extends mongoose.Document {
  id: string;
  name: string;
  postsCount: number;
  newPostsToday: number;
  newPostsThisWeek: number;
  relatedTags: string[];
  aliases: string[];
}

const tagSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    unique: true,
    required: [true, 'Tag name is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[a-z0-9äöüß]+$/.test(v);
      },
      message: props => `${props.value} is not a valid tag name. Use only lowercase letters, numbers, and German umlauts.`
    }
  },
  postsCount: {
    type: Number,
    default: 0
  },
  newPostsToday: {
    type: Number,
    default: 0
  },
  newPostsThisWeek: {
    type: Number,
    default: 0
  },
  relatedTags: [{
    type: String,
    ref: 'Tag'
  }],
  aliases: [{
    type: String
  }]
}, {
  timestamps: true
});

// Middleware to generate ID if not provided
tagSchema.pre('save', function(next) {
  if (!this.id) {
    // Generate ID based on name
    this.id = this.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  }
  next();
});

// Middleware to update post counts
tagSchema.methods.updateCounts = async function() {
  // This would be implemented to count posts with this tag
  // and update the newPostsToday and newPostsThisWeek fields
};

// Static method to get popular tags
tagSchema.statics.getPopularTags = async function(limit = 20) {
  return this.find()
    .sort({ postsCount: -1 })
    .limit(limit);
};

// Static method to find or create tag
tagSchema.statics.findOrCreate = async function(tagName: string) {
  const normalized = tagName.toLowerCase().trim().replace(/\s+/g, '_');
  
  let tag = await this.findOne({ name: normalized });
  
  if (!tag) {
    tag = new this({
      id: normalized,
      name: normalized
    });
    await tag.save();
  }
  
  return tag;
};

const Tag = mongoose.models.Tag || mongoose.model<ITag>('Tag', tagSchema);

export default Tag; 