import { kv } from '@vercel/kv';

interface CacheOptions {
  ttl?: number;
}

// ─── LAYER 1: In-Memory Browser Cache (0ms, instant) ────────────────────

const memoryCache = new Map<string, { data: any; expiry: number }>();

function getFromMemory<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (Date.now() < entry.expiry) {
    return entry.data as T;
  }

  // Expired — clean it up
  memoryCache.delete(key);
  return null;
}

function setInMemory(key: string, data: any, ttlSeconds: number) {
  // Prevent memory bloat — cap at 50 entries, evict oldest if full
  if (memoryCache.size >= 50) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }

  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

// ─── MAIN CACHE FUNCTION (Memory → KV → Supabase) ──────────────────────

export async function cacheData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 3600 } = options;

  // ★ Layer 1: Check memory first (0ms — no network call)
  const memCached = getFromMemory<T>(key);
  if (memCached) {
    return memCached;
  }

  try {
    // ★ Layer 2: Check Vercel KV (~100-200ms)
    const cached = await kv.get<T>(key);
    if (cached) {
      setInMemory(key, cached, ttl);
      return cached;
    }

    // ★ Layer 3: Fetch fresh from Supabase (~300-800ms)
    const data = await fetchFn();

    // Store in both layers simultaneously
    setInMemory(key, data, ttl);
    kv.setex(key, ttl, JSON.stringify(data)).catch((err) =>
      console.error(`KV write error for ${key}:`, err)
    );

    return data;
  } catch (error) {
    console.error(`Cache error for ${key}:`, error);

    // KV failed — still try fetching fresh data
    const data = await fetchFn();
    setInMemory(key, data, ttl);
    return data;
  }
}

// ─── INVALIDATION ───────────────────────────────────────────────────────

export async function invalidateCache(key: string) {
  try {
    memoryCache.delete(key);
    await kv.del(key);
  } catch (error) {
    console.error(`Error clearing cache for ${key}:`, error);
  }
}

export async function invalidateMultipleCache(keys: string[]) {
  try {
    keys.forEach((key) => memoryCache.delete(key));
    await Promise.all(keys.map((key) => kv.del(key)));
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}