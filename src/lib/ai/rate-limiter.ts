// Token-Bucket Rate Limiter with Exponential Backoff
export class TokenBucketRateLimiter {
  private capacity: number;
  private tokens: number;
  private refillRatePerMs: number;
  private lastRefill: number;

  constructor(maxTokensPerMinute: number) {
    this.capacity = maxTokensPerMinute;
    this.tokens = maxTokensPerMinute;
    this.refillRatePerMs = maxTokensPerMinute / 60000;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRatePerMs);
    this.lastRefill = now;
  }

  async acquire(tokens = 1, maxWaitMs = 10000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      this.refill();
      if (this.tokens >= tokens) {
        this.tokens -= tokens;
        return true;
      }
      const needed = tokens - this.tokens;
      const waitTime = Math.min(Math.ceil(needed / this.refillRatePerMs) + Math.random() * 50, 1000);
      await new Promise((res) => setTimeout(res, waitTime));
    }
    return false;
  }
}

export const flashLimiter = new TokenBucketRateLimiter(15); // 15 RPM
export const proLimiter = new TokenBucketRateLimiter(2);   // 2 RPM
