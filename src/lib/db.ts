import mongoose from 'mongoose';
import dns from 'dns';
import { promisify } from 'util';

// Force Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

async function resolveSrvUri(srvUri: string): Promise<string> {
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

  console.log(`[db] Resolved SRV → ${srvRecords.length} hosts`);
  return uri;
}

// Use globalThis to persist across HMR in dev
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

  // Already connected — reuse
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Connection in progress — await it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch {
      cached.promise = null;
    }
  }

  // If already connected (e.g. from another module), just reuse
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return cached.conn;
  }

  // Disconnect stale connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Resolve SRV → standard URI (skip on Vercel — they handle it)
  const resolvedUri = (MONGODB_URI.startsWith('mongodb+srv://') && !process.env.VERCEL)
    ? await resolveSrvUri(MONGODB_URI)
    : MONGODB_URI;

  cached.promise = mongoose.connect(resolvedUri, { bufferCommands: false });

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
