import mongoose from 'mongoose';
import { ensureIndexes } from './ensureIndexes';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: mongoose.Connection | null
    promise: Promise<mongoose.Connection> | null
  }
}

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('MongoDB URI nicht definiert')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      autoCreate: true,
      autoIndex: true,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
      // Prüfe/erstelle Indizes nach erfolgreicher Verbindung
      await ensureIndexes();
      return mongoose.connection;
    })
  }
  
  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect