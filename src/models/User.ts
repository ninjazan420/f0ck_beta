import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  email: string;
  name?: string;
  username: string;
  password: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  lastSeen: Date;
  updatedAt: Date;
  role: 'user' | 'premium' | 'moderator' | 'admin' | 'banned';
  storageQuota: number;
  usedStorage: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  password: {
    type: String,
    required: false, // Not required for Discord users
    minlength: 6,
  },
  discordId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  discordUsername: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
    maxLength: 140,
    default: '',
    index: true, // Expliziter Index
  },
  avatar: {
    type: String,
    required: false,
    default: null,
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    index: true, // Expliziter Index
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    index: true, // Expliziter Index
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    index: true, // Expliziter Index
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    index: true,
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    index: true,
  }],
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ['user', 'premium', 'moderator', 'admin', 'banned'],
    default: 'user',
    index: true // Für schnellere Abfragen
  },
  uploads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload',
    index: true,
  }],
  storageQuota: {
    type: Number,
    default: 500 * 1024 * 1024, // 500MB Standardkontingent
    required: true
  },
  usedStorage: {
    type: Number,
    default: 0,
    required: true
  },
  resetPasswordToken: {
    type: String,
    required: false
  },
  resetPasswordExpires: {
    type: Date,
    required: false
  }
}, {
  timestamps: true // Dies erstellt automatisch createdAt und updatedAt
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  // Skip password hashing if password is not provided (Discord users)
  if (!this.password || !this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Virtuals für die Statistiken
userSchema.virtual('stats').get(function() {
  return {
    uploads: this.uploads?.length || 0,
    comments: this.comments?.length || 0,
    favorites: this.favorites?.length || 0,
    likes: this.likes?.length || 0,
    dislikes: this.dislikes?.length || 0,
    tags: this.tags?.length || 0
  };
});

// Stellen Sie sicher, dass virtuals in JSON enthalten sind
userSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});
userSchema.set('toObject', { virtuals: true });

// Prüfen ob das Model bereits existiert um Fehler zu vermeiden
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; // Make sure this line exists and is correct