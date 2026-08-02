import type { CrawlResult } from '../contracts/crawl';

export interface CrawlOptions {
  signal?: AbortSignal;
}

export interface Crawler {
  crawlUrl(url: string, options?: CrawlOptions): Promise<CrawlResult>;
}
