type RateLimitEntry = { timestamps: number[]; lastSeen: number };

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private checks = 0;

  constructor(
    private readonly now: () => number = Date.now,
    private readonly maxIdentifiers = 10_000,
  ) {}

  checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number,
  ): RateLimitResult {
    const now = this.now();
    const entry = this.requests.get(identifier);
    const recent = (entry?.timestamps ?? []).filter(
      (timestamp) => now - timestamp < windowMs,
    );
    this.pruneExpired(windowMs, now);

    if (recent.length >= maxRequests) {
      this.requests.set(identifier, { timestamps: recent, lastSeen: now });
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((recent[0] + windowMs - now) / 1000),
        ),
      };
    }

    recent.push(now);
    if (!entry && this.requests.size >= this.maxIdentifiers) {
      this.evictOldest();
    }
    this.requests.set(identifier, { timestamps: recent, lastSeen: now });
    return { allowed: true };
  }

  private pruneExpired(windowMs: number, now: number): void {
    this.checks += 1;
    if (this.checks % 100 !== 0) return;
    for (const [identifier, entry] of this.requests) {
      if (now - entry.lastSeen >= windowMs) this.requests.delete(identifier);
    }
  }

  private evictOldest(): void {
    let oldestIdentifier: string | undefined;
    let oldestSeen = Infinity;
    for (const [identifier, entry] of this.requests) {
      if (entry.lastSeen < oldestSeen) {
        oldestIdentifier = identifier;
        oldestSeen = entry.lastSeen;
      }
    }
    if (oldestIdentifier !== undefined) this.requests.delete(oldestIdentifier);
  }
}

export const rateLimiter = new RateLimiter();
