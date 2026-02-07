export class RateLimiter {
  private requests = new Map<string, number[]>();

  checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number,
  ): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) ?? [];
    const recent = timestamps.filter((t) => now - t < windowMs);

    if (recent.length >= maxRequests) {
      return false;
    }

    recent.push(now);
    this.requests.set(identifier, recent);
    return true;
  }
}

const defaultMaxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10;
const defaultWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;

export const rateLimiter = new RateLimiter();

export function getRateLimitConfig(): {
  maxRequests: number;
  windowMs: number;
} {
  return {
    maxRequests: defaultMaxRequests,
    windowMs: defaultWindowMs,
  };
}
