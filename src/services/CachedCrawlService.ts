import type { CrawlResult, CrawlResultData } from '../workflows/crawl/types';
import type { Cache } from '../lib/cache';
import { createModuleLogger } from '../lib/logger';
import type { Crawler, CrawlOptions } from './types';

export type { Crawler, CrawlOptions } from './types';

export class CachedCrawlService implements Crawler {
  private readonly log = createModuleLogger('CachedCrawlService');

  constructor(
    private readonly crawlService: Crawler,
    private readonly cache: Cache<string, CrawlResultData>,
  ) {}

  async crawlUrl(
    url: string,
    options: CrawlOptions = {},
  ): Promise<CrawlResult> {
    const cached = this.cache.get(url);
    if (cached) {
      this.log.info({ url }, 'Cache hit');
      return { success: true, data: cached };
    }

    this.log.debug({ url }, 'Cache miss');
    const result = await this.crawlService.crawlUrl(url, options);

    if (result.success) {
      this.cache.set(url, result.data);
    }

    return result;
  }
}
