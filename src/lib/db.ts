import mongoose from 'mongoose';
import dns from 'dns';
import { promisify } from 'util';

// Force Google DNS — fix SRV lookup failures on restrictive networks
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

/**
 * Convert mongodb+srv:// URI to standard mongodb:// URI
 * by manually resolving SRV and TXT records via Google DNS.
 */
async function resolveSrvUri(srvUri: string): Promise<string> {
  const match = srvUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)\/?([^?]*)(\?.*)?$/);
  if (!match) return srvUri;

  const [, credentials, srvHost, dbName, queryString] = match;

  const srvRecords = await resolveSrv(`_mongodb._tcp.${srvHost}`);
  const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(',');

  let txtOptions = '';
  try {
    const txtRecords = await resolveTxt(srvHost);
    if (txtRecords.length > 0) {
      txtOptions = txtRecords[0].join('');
    }
  } catch {
    // TXT record is optional
  }

  let uri = `mongodb://${credentials}@${hosts}/${dbName}?tls=true`;
  if (txtOptions) uri += `&${txtOptions}`;
  if (queryString) {
    const extra = queryString.slice(1);
    if (extra) uri += `&${extra}`;
  }

  console.log(`[db] Resolved SRV → ${srvRecords.length} hosts`);
  return uri;
}

// Use a dedicated connection instance to avoid conflict with multiple connect() calls
let cachedConn: typeof mongoose | null = null;
let cachedPromise: Promise<typeof mongoose> | null = null;
let cachedUri: string | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  // If already connected with the same URI, return cached
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  if (!cachedPromise) {
    // Resolve SRV if needed (only on non-Vercel environments)
    const resolvedUri = (MONGODB_URI.startsWith('mongodb+srv://') && !process.env.VERCEL)
      ? await resolveSrvUri(MONGODB_URI)
      : MONGODB_URI;

    cachedUri = resolvedUri;
    cachedPromise = mongoose.connect(resolvedUri, {
      bufferCommands: false,
    });
  }

  try {
    cachedConn = await cachedPromise;
  } catch (e) {
    cachedPromise = null;
    cachedUri = null;
    throw e;
  }

  return cachedConn;
}

export default connectDB;
