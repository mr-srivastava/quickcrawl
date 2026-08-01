import type { CrawlResult, CrawlResultData } from '../workflows/crawl/types';
import { CacheService } from '../lib/cache';
import { createModuleLogger } from '../lib/logger';
import { DEFAULT_CACHE_MAX_SIZE, DEFAULT_CACHE_TTL_MS } from '../config';

export interface Crawler {
  crawlUrl(url: string): Promise<CrawlResult>;
}

export class CachedCrawlService {
  private readonly log = createModuleLogger('CachedCrawlService');
  private readonly cache = new CacheService<string, CrawlResultData>(
    DEFAULT_CACHE_TTL_MS,
    DEFAULT_CACHE_MAX_SIZE,
  );

  constructor(private readonly crawlService: Crawler) {}

  async crawlUrl(url: string): Promise<CrawlResult> {
    const cached = this.cache.get(url);
    if (cached) {
      this.log.info({ url }, 'Cache hit');
      return { success: true, data: cached };
    }

    this.log.debug({ url }, 'Cache miss');
    const result = await this.crawlService.crawlUrl(url);

    if (result.success) {
      this.cache.set(url, result.data);
    }

    return result;
  }
}
