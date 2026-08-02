import { createApp } from './app';
import { DEFAULT_CACHE_MAX_SIZE, DEFAULT_CACHE_TTL_MS } from './config';
import { CacheService } from './lib/cache';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { CrawlService } from './services/CrawlService';
import { CachedCrawlService } from './services/CachedCrawlService';
import type { CrawlResultData } from './contracts/crawl';
import { createCrawlWorkflow } from './workflows/crawl';

export function createProductionApp() {
  const workflow = createCrawlWorkflow();
  const crawlService = new CrawlService(workflow);
  const cache = new CacheService<string, CrawlResultData>(
    DEFAULT_CACHE_TTL_MS,
    DEFAULT_CACHE_MAX_SIZE,
  );
  const crawler = new CachedCrawlService(crawlService, cache);

  return createApp({ crawler, crawlRateLimit: rateLimitMiddleware() });
}

export default createProductionApp();
