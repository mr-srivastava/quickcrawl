import {
  APP_NAME,
  APP_VERSION,
  DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_PORT,
  TRUST_PROXY,
  getRateLimitConfig,
} from '../../config';
import type { DocsPageInit } from '../../contracts/page';
import { PageShell } from './PageShell';

export function DocsShell() {
  const rateLimit = getRateLimitConfig();
  const init: DocsPageInit = {
    page: 'docs',
    title: 'API',
    appName: APP_NAME,
    appVersion: APP_VERSION,
    baseUrl: `http://localhost:${DEFAULT_PORT}`,
    rateLimit,
    trustProxy: TRUST_PROXY,
    cacheTtlMs: DEFAULT_CACHE_TTL_MS,
    cacheMaxSize: DEFAULT_CACHE_MAX_SIZE,
    healthExample: JSON.stringify(
      {
        status: 'ok',
        service: APP_NAME.toLowerCase(),
        version: APP_VERSION,
      },
      null,
      2,
    ),
  };

  return <PageShell init={init} />;
}
