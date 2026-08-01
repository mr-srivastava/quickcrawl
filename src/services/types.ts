import type { CrawlResult } from '../workflows/crawl/types';

export interface CrawlOptions {
  signal?: AbortSignal;
}

export interface Crawler {
  crawlUrl(url: string, options?: CrawlOptions): Promise<CrawlResult>;
}
