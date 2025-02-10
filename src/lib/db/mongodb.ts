import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI nicht definiert');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  cached.promise = mongoose.connect(MONGODB_URI);
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;