/**
 * Token-bucket rate limiter with exponential backoff + jitter.
 * Guarantees the Gemini quota is never exhausted while a request is in flight.
 */

export interface BucketConfig {
  /** Requests permitted per minute. */
  rpm: number;
  /** Burst capacity (tokens available immediately). */
  burst: number;
}

export const MODEL_LIMITS: Record<string, BucketConfig> = {
  'gemini-2.5-flash': { rpm: 15, burst: 5 },
  'gemini-2.5-pro': { rpm: 2, burst: 1 },
};

interface BucketState {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, BucketState>();

function getBucket(model: string, config: BucketConfig): BucketState {
  const existing = buckets.get(model);
  if (existing) return existing;
  const created: BucketState = { tokens: config.burst, lastRefill: Date.now() };
  buckets.set(model, created);
  return created;
}

function refill(model: string, config: BucketConfig) {
  const bucket = getBucket(model, config);
  const now = Date.now();
  const elapsedMinutes = (now - bucket.lastRefill) / 60_000;
  bucket.tokens = Math.min(config.burst, bucket.tokens + elapsedMinutes * config.rpm);
  bucket.lastRefill = now;
  return bucket;
}

/** Wait until a token is available for the model. */
export async function acquireToken(model: string): Promise<void> {
  const config = MODEL_LIMITS[model] ?? { rpm: 15, burst: 5 };
  for (;;) {
    const bucket = refill(model, config);
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return;
    }
    const deficit = 1 - bucket.tokens;
    const waitMs = Math.min(5_000, (deficit / config.rpm) * 60_000) + Math.random() * 250;
    await new Promise((resolve) => setTimeout(resolve, Math.max(60, waitMs)));
  }
}

export function tokenSnapshot(model: string) {
  const config = MODEL_LIMITS[model] ?? { rpm: 15, burst: 5 };
  const bucket = refill(model, config);
  return { model, rpm: config.rpm, tokens: Number(bucket.tokens.toFixed(2)) };
}

/** Exponential backoff with full jitter — used on 429 / transient failures. */
export function backoffDelay(attempt: number, baseMs = 400, capMs = 8_000) {
  const exponential = Math.min(capMs, baseMs * 2 ** attempt);
  return Math.round(exponential * (0.5 + Math.random() * 0.5));
}

/** Run a task with retry + exponential backoff. */
export async function withRetry<T>(
  task: () => Promise<T>,
  options: { attempts?: number; onRetry?: (attempt: number, error: unknown) => void } = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      options.onRetry?.(attempt, error);
      if (attempt === attempts - 1) break;
      await new Promise((resolve) => setTimeout(resolve, backoffDelay(attempt)));
    }
  }
  throw lastError;
}
