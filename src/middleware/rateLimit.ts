import type { Context, Next } from 'hono';
import { rateLimiter, getRateLimitConfig } from '../lib/rateLimiter';
import { createModuleLogger } from '../lib/logger';

const logger = createModuleLogger('rateLimit');

export function rateLimitMiddleware() {
  const { maxRequests, windowMs } = getRateLimitConfig();

  return async (c: Context, next: Next) => {
    const forwarded = c.req.header('x-forwarded-for');
    const realIp = c.req.header('x-real-ip');
    const identifier = forwarded?.split(',')[0]?.trim() ?? realIp ?? 'unknown';

    const allowed = rateLimiter.checkLimit(identifier, maxRequests, windowMs);

    if (!allowed) {
      logger.warn({ identifier, maxRequests, windowMs }, 'Rate limit exceeded');
      const retryAfter = Math.ceil(windowMs / 1000);
      c.header('Retry-After', String(retryAfter));
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }

    await next();
  };
}
