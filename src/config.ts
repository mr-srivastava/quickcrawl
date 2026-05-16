/** App metadata and shared runtime defaults (single source for UI + docs). */
export const APP_NAME = 'QuickCrawl';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Turn any URL into clean Markdown';
export const DEFAULT_PORT = Number(process.env.PORT) || 3000;

export { getRateLimitConfig } from './lib/rateLimiter';
export {
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_CACHE_MAX_SIZE,
} from './services/CachedCrawlService';
