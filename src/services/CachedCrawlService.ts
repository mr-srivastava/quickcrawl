import type { CrawlResult, CrawlResultData } from '../workflows/crawl/types';
import { CacheService } from '../lib/cache';
import { createModuleLogger } from '../lib/logger';
import type { CrawlService } from './CrawlService';

const DEFAULT_CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS) || 300_000;
const DEFAULT_CACHE_MAX_SIZE = Number(process.env.CACHE_MAX_SIZE) || 100;

export class CachedCrawlService {
  private readonly log = createModuleLogger('CachedCrawlService');
  private readonly cache = new CacheService<string, CrawlResultData>(
    DEFAULT_CACHE_TTL_MS,
    DEFAULT_CACHE_MAX_SIZE,
  );

  constructor(private readonly crawlService: CrawlService) {}

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
