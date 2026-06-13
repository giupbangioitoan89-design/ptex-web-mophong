import mongoose from 'mongoose';
import dns from 'dns';
import { promisify } from 'util';

/**
 * MongoDB connection — works both locally (with DNS fallback) and on Vercel.
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

// ===== SRV Resolver (for local dev with restrictive DNS) =====
async function resolveSrvUri(srvUri: string): Promise<string> {
  // Force Google DNS for SRV resolution
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  const resolveSrv = promisify(dns.resolveSrv);
  const resolveTxt = promisify(dns.resolveTxt);

  const match = srvUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)\/?([^?]*)(\?.*)?$/);
  if (!match) return srvUri;

  const [, credentials, srvHost, dbName, queryString] = match;
  const srvRecords = await resolveSrv(`_mongodb._tcp.${srvHost}`);
  const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(',');

  let txtOptions = '';
  try {
    const txtRecords = await resolveTxt(srvHost);
    if (txtRecords.length > 0) txtOptions = txtRecords[0].join('');
  } catch { /* optional */ }

  let uri = `mongodb://${credentials}@${hosts}/${dbName}?tls=true`;
  if (txtOptions) uri += `&${txtOptions}`;
  if (queryString) {
    const extra = queryString.slice(1);
    if (extra) uri += `&${extra}`;
  }
  return uri;
}

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MONGODB_URI not set');

  // 1. Fast path: already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // 2. If a connection is in progress, await it
  if (cached.promise) {
    return cached.promise;
  }

  // 3. Create the connection promise synchronously to prevent race conditions
  cached.promise = (async () => {
    // If not fully disconnected, clean up first
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
      } catch {
        /* ignore */
      }
    }

    let finalUri = MONGODB_URI;
    if (MONGODB_URI.startsWith('mongodb+srv://') && !process.env.VERCEL) {
      try {
        finalUri = await resolveSrvUri(MONGODB_URI);
      } catch {
        finalUri = MONGODB_URI; // fallback to SRV
      }
    }

    await mongoose.connect(finalUri, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 5000,
    });

    return mongoose;
  })();

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }
}

export default connectDB;
