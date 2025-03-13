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
        return /^[a-z0-9äöüß_]+$/.test(v);
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
  if (!tagName || typeof tagName !== 'string' || tagName.trim() === '') {
    console.error('Invalid tag name provided:', tagName);
    return null;
  }
  
  const normalized = tagName.toLowerCase().trim().replace(/\s+/g, '_');
  console.log('Normalized tag name:', normalized);
  
  try {
    // First try to find the tag
    let tag = await this.findOne({ name: normalized });
    
    if (!tag) {
      console.log('Tag not found, creating new tag:', normalized);
      
      // Create new tag
      tag = new this({
        id: normalized,
        name: normalized
      });
      
      try {
        await tag.save();
        console.log('Tag created successfully:', tag._id);
      } catch (saveError) {
        console.error('Error saving tag:', saveError);
        
        // Check if tag was created by another request in parallel
        tag = await this.findOne({ name: normalized });
        if (!tag) {
          throw saveError;
        } else {
          console.log('Tag was created in parallel, using existing tag');
        }
      }
    } else {
      console.log('Using existing tag:', tag._id);
    }
    
    return tag;
  } catch (error) {
    console.error('findOrCreate error:', error);
    throw error;
  }
};

// Neue statische Methode zum Aktualisieren der Tag-Statistiken
tagSchema.statics.updateStats = async function() {
  try {
    const Post = mongoose.model('Post');
    
    // Heute, diese Woche
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    
    // Alle Tags finden
    const tags = await this.find({});
    
    for (const tag of tags) {
      // Zähle Posts heute
      const postsToday = await Post.countDocuments({
        tags: tag.name,
        createdAt: { $gte: today }
      });
      
      // Zähle Posts diese Woche
      const postsThisWeek = await Post.countDocuments({
        tags: tag.name,
        createdAt: { $gte: weekStart }
      });
      
      // Zähle Gesamtanzahl der Posts
      const totalPosts = await Post.countDocuments({
        tags: tag.name
      });
      
      // Tag aktualisieren
      await this.findByIdAndUpdate(tag._id, {
        newPostsToday: postsToday,
        newPostsThisWeek: postsThisWeek,
        postsCount: totalPosts
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating tag stats:', error);
    return false;
  }
};

const Tag = mongoose.models.Tag || mongoose.model<ITag>('Tag', tagSchema);

export default Tag; 