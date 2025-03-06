import mongoose from 'mongoose';
// Import ensureIndexes dynamically to avoid circular dependencies
// import { ensureIndexes } from './ensureIndexes';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: mongoose.Connection | null
    promise: Promise<mongoose.Connection> | null
    indexesEnsured: boolean
  }
}

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('MongoDB URI nicht definiert')
}

// Initialize cached connection variable
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null,
    indexesEnsured: false 
  }
}

async function dbConnect() {
  if (cached.conn) {
    // If connection already exists, ensure indexes if not done yet
    if (!cached.indexesEnsured) {
      try {
        // Import ensureIndexes dynamically to avoid circular dependencies
        const { ensureIndexes } = await import('./ensureIndexes');
        await ensureIndexes();
        cached.indexesEnsured = true;
      } catch (error) {
        console.error('Failed to ensure indexes:', error);
        // Don't fail the entire connection if indexes fail
      }
    }
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      autoCreate: true,
      autoIndex: false, // We'll handle indexes manually
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
      console.log('Connected to MongoDB');
      try {
        // Import ensureIndexes dynamically to avoid circular dependencies
        const { ensureIndexes } = await import('./ensureIndexes');
        await ensureIndexes();
        cached.indexesEnsured = true;
      } catch (error) {
        console.error('Failed to ensure indexes:', error);
        // Don't fail the entire connection if indexes fail
      }
      return mongoose.connection;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;