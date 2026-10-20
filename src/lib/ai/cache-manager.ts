// Deterministic in-memory response cache with TTL
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class NexusAiCacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();

  private hashKey(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash)}`;
  }

  get<T>(promptKey: string): T | null {
    const key = this.hashKey(promptKey);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(promptKey: string, value: T, ttlSeconds = 1800): void {
    const key = this.hashKey(promptKey);
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const aiCache = new NexusAiCacheManager();
