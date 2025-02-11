import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  email: string;
  name?: string;
  username: string;
  password: string;
  bio?: string;
  createdAt: Date;
  lastSeen: Date;
  updatedAt: Date;
  role: 'user' | 'premium' | 'moderator' | 'admin';
  isPremium: boolean;
  isAdmin: boolean;
  isModerator: boolean;
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
    enum: ['user', 'premium', 'moderator', 'admin'],
    default: 'user',
    index: true // Für schnellere Abfragen
  },
  isPremium: {
    type: Boolean,
    default: false,
    index: true
  },
  isAdmin: {
    type: Boolean,
    default: false,
    index: true
  },
  isModerator: {
    type: Boolean,
    default: false,
    index: true
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

// Middleware um Rollen-Flags automatisch zu setzen
userSchema.pre('save', function(next) {
  this.isPremium = this.role === 'premium';
  this.isAdmin = this.role === 'admin';
  this.isModerator = this.role === 'moderator';
  next();
});

// Prüfen ob das Model bereits existiert um Fehler zu vermeiden
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; // Make sure this line exists and is correct