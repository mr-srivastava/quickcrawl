import type { Context, Next } from 'hono';
import { rateLimiter } from '../lib/rateLimiter';
import { createModuleLogger } from '../lib/logger';
import { getRateLimitConfig, TRUST_PROXY } from '../config';
import { rateLimitErrorResponse } from '../lib/errors';

const logger = createModuleLogger('rateLimit');

export function rateLimitMiddleware() {
  const { maxRequests, windowMs } = getRateLimitConfig();

  return async (c: Context, next: Next) => {
    const identifier = TRUST_PROXY
      ? c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      : 'global';

    const result = rateLimiter.checkLimit(identifier, maxRequests, windowMs);

    if (!result.allowed) {
      logger.warn({ identifier, maxRequests, windowMs }, 'Rate limit exceeded');
      c.header('Retry-After', String(result.retryAfterSeconds));
      return rateLimitErrorResponse(c);
    }

    await next();
  };
}
