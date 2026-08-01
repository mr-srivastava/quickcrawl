import { z } from 'zod';

/** App metadata and validated runtime configuration (single source for UI + docs). */
export const APP_NAME = 'QuickCrawl';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Turn any URL into clean Markdown';

const positiveInteger = (fallback: number) => z.coerce.number().int().positive().default(fallback);
const RuntimeConfigSchema = z.object({
  PORT: positiveInteger(3000),
  CACHE_TTL_MS: positiveInteger(300_000),
  CACHE_MAX_SIZE: positiveInteger(100),
  RATE_LIMIT_MAX_REQUESTS: positiveInteger(10),
  RATE_LIMIT_WINDOW_MS: positiveInteger(60_000),
  TRUST_PROXY: z.enum(['true', 'false']).default('false'),
});

const runtimeConfig = RuntimeConfigSchema.parse(process.env);

export const DEFAULT_PORT = runtimeConfig.PORT;
export const DEFAULT_CACHE_TTL_MS = runtimeConfig.CACHE_TTL_MS;
export const DEFAULT_CACHE_MAX_SIZE = runtimeConfig.CACHE_MAX_SIZE;
export const TRUST_PROXY = runtimeConfig.TRUST_PROXY === 'true';

export function getRateLimitConfig() {
  return {
    maxRequests: runtimeConfig.RATE_LIMIT_MAX_REQUESTS,
    windowMs: runtimeConfig.RATE_LIMIT_WINDOW_MS,
  };
}
