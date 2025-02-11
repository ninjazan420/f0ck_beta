import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  email: string;
  name: string;
  username: string;  // Neues Feld
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [false, 'Email is optional'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'], 
  },
  username: {          // Neues Feld
    type: String,
    required: [true, 'Username is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Passwort is required'],
  }
}, {
  timestamps: true
});

// Password Hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Prüfen ob das Model bereits existiert um Fehler zu vermeiden
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;