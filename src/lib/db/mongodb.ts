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

async function dbConnect(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
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
      
      cached.conn = await cached.promise;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

export default dbConnect;