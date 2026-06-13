import mongoose from 'mongoose';

/**
 * Optimized MongoDB connection for Vercel Serverless.
 * - Uses globalThis cache to reuse connections across hot invocations
 * - On Vercel: uses mongodb+srv:// directly (Vercel DNS resolves it fast)
 * - Minimal connection options for fastest cold start
 */

interface CachedMongo {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoConn: CachedMongo | undefined;
}

const cached: CachedMongo = globalThis._mongoConn ?? { conn: null, promise: null };
if (!globalThis._mongoConn) globalThis._mongoConn = cached;

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MONGODB_URI not set');

  // ✅ Fast path: already connected
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // ✅ Connection in flight: await existing promise
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      if (mongoose.connection.readyState === 1) return cached.conn;
    } catch {
      cached.promise = null;
    }
  }

  // ✅ Connected by another code path
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return cached.conn;
  }

  // Disconnect stale
  if (mongoose.connection.readyState !== 0) {
    try { await mongoose.disconnect(); } catch { /* ignore */ }
  }

  // ✅ Connect with optimized options
  cached.promise = mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize: 5,            // Keep pool small for serverless
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 5000,
  });

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
