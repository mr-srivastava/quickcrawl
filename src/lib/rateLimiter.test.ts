import { describe, expect, test } from 'vitest';
import { RateLimiter } from './rateLimiter';

describe('RateLimiter', () => {
  test('returns the remaining retry delay and allows requests after the window', () => {
    let now = 0;
    const limiter = new RateLimiter(() => now);

    expect(limiter.checkLimit('client', 1, 10_000)).toEqual({ allowed: true });
    now = 2_000;
    expect(limiter.checkLimit('client', 1, 10_000)).toEqual({
      allowed: false,
      retryAfterSeconds: 8,
    });
    now = 10_000;
    expect(limiter.checkLimit('client', 1, 10_000)).toEqual({ allowed: true });
  });

  test('caps the number of stored client identities', () => {
    let now = 0;
    const limiter = new RateLimiter(() => now, 2);
    limiter.checkLimit('oldest', 1, 60_000);
    now += 1;
    limiter.checkLimit('second', 1, 60_000);
    now += 1;
    limiter.checkLimit('third', 1, 60_000);

    expect(limiter.checkLimit('oldest', 1, 60_000)).toEqual({ allowed: true });
  });
});
