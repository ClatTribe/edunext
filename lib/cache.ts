import { kv } from '@vercel/kv';

interface CacheOptions {
  ttl?: number;
}

export async function cacheData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 3600 } = options;

  try {
    const cached = await kv.get<T>(key);
    if (cached) {
      console.log(`✅ Cache HIT: ${key}`);
      return cached;
    }

    console.log(`⏳ Cache MISS: ${key}`);
    const data = await fetchFn();
    await kv.setex(key, ttl, JSON.stringify(data));
    console.log(`💾 Cached: ${key}`);

    return data;
  } catch (error) {
    console.error(`Cache error for ${key}:`, error);
    return fetchFn();
  }
}

export async function invalidateCache(key: string) {
  try {
    await kv.del(key);
    console.log(`🗑️ Cache cleared: ${key}`);
  } catch (error) {
    console.error(`Error clearing cache:`, error);
  }
}

export async function invalidateMultipleCache(keys: string[]) {
  try {
    await Promise.all(keys.map(key => kv.del(key)));
    console.log(`🗑️ Cleared ${keys.length} cache entries`);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}