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
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [false, 'Email is optional'],
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Passwort is required'],
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
  }
}, {
  timestamps: true // Dies erstellt automatisch createdAt und updatedAt
});

// Password Hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Virtuals für die Statistiken
userSchema.virtual('stats').get(function() {
  return {
    uploads: this.uploads?.length || 0,
    comments: this.comments?.length || 0,
    favorites: this.favorites?.length || 0,
    likes: this.likes?.length || 0,
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