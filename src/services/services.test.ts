import { describe, expect, test } from 'vitest';
import { CachedCrawlService, type Crawler } from './CachedCrawlService';
import { CrawlService } from './CrawlService';
import type { CrawlWorkflow } from '../workflows/crawl/types';

describe('crawl services', () => {
  test('CrawlService preserves typed workflow errors', async () => {
    const workflow: CrawlWorkflow = {
      async run() {
        throw {
          type: 'fetch_failed',
          status: 404,
          statusText: 'Not Found',
          url: 'https://example.com',
        };
      },
    };
    const result = await new CrawlService(workflow).crawlUrl(
      'https://example.com',
    );
    expect(result).toEqual({
      success: false,
      error: {
        type: 'fetch_failed',
        status: 404,
        statusText: 'Not Found',
        url: 'https://example.com',
      },
    });
  });

  test('CachedCrawlService accepts the small crawler interface and caches successes', async () => {
    let calls = 0;
    const crawler: Crawler = {
      async crawlUrl() {
        calls += 1;
        return { success: true, data: { markdown: '# Example' } };
      },
    };
    const cached = new CachedCrawlService(crawler);

    expect(await cached.crawlUrl('https://example.com')).toEqual({
      success: true,
      data: { markdown: '# Example' },
    });
    await cached.crawlUrl('https://example.com');
    expect(calls).toBe(1);
  });
});
