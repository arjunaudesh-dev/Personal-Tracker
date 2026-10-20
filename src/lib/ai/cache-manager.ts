import { createHash } from 'node:crypto';

/**
 * Deterministic in-memory response cache.
 * Keys are SHA-256 hashed so identical prompts always map to identical entries,
 * and every entry carries a configurable Time-To-Live.
 */
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

export interface CacheOptions {
  ttlMs?: number;
  maxEntries?: number;
}

export class AiCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private ttlMs: number;
  private maxEntries: number;
  private hits = 0;
  private misses = 0;

  constructor(options: CacheOptions = {}) {
    this.ttlMs = options.ttlMs ?? 10 * 60 * 1000;
    this.maxEntries = options.maxEntries ?? 256;
  }

  /** SHA-256 deterministic hash of the normalised cache key. */
  static hash(input: string) {
    return createHash('sha256').update(input.trim().replace(/\s+/g, ' ')).digest('hex');
  }

  static key(parts: Array<string | number | boolean | undefined | null>) {
    return AiCache.hash(parts.filter((p) => p !== undefined && p !== null).join('|'));
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses += 1;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses += 1;
      return null;
    }
    entry.hits += 1;
    this.hits += 1;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = this.ttlMs) {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next();
      if (!oldest.done) this.store.delete(oldest.value);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
      hits: 0,
    });
  }

  /** Read-through cache helper. */
  async wrap<T>(key: string, producer: () => Promise<T>, ttlMs = this.ttlMs): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const value = await producer();
    this.set(key, value, ttlMs);
    return value;
  }

  invalidate(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  stats() {
    return {
      entries: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses === 0 ? 0 : this.hits / (this.hits + this.misses),
    };
  }
}

/** Process-wide shared cache instance. */
export const aiCache = new AiCache({ ttlMs: 15 * 60 * 1000, maxEntries: 256 });
