import { describe, expect, test } from 'vitest';
import { CachedCrawlService, type Crawler } from './CachedCrawlService';
import { CrawlService } from './CrawlService';
import type { CrawlWorkflow } from '../workflows/crawl/types';
import { CacheService } from '../lib/cache';
import type { Cache } from '../lib/cache';
import type { CrawlResultData } from '../contracts/crawl';

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
    const values = new Map<string, CrawlResultData>();
    const cache: Cache<string, CrawlResultData> = {
      get: (key) => values.get(key),
      set: (key, value) => {
        values.set(key, value);
      },
    };
    const crawler: Crawler = {
      async crawlUrl() {
        calls += 1;
        return { success: true, data: { markdown: '# Example' } };
      },
    };
    const cached = new CachedCrawlService(crawler, cache);

    expect(await cached.crawlUrl('https://example.com')).toEqual({
      success: true,
      data: { markdown: '# Example' },
    });
    await cached.crawlUrl('https://example.com');
    expect(calls).toBe(1);
  });

  test('CrawlService forwards caller cancellation to the workflow', async () => {
    const controller = new AbortController();
    let receivedSignal: AbortSignal | undefined;
    const workflow: CrawlWorkflow = {
      async run(initial, options) {
        receivedSignal = options?.signal;
        return {
          ...initial,
          stage: 'error',
          error: { type: 'unknown', message: 'Stopped for test' },
        };
      },
    };

    await new CrawlService(workflow).crawlUrl('https://example.com', {
      signal: controller.signal,
    });

    expect(receivedSignal).toBe(controller.signal);
  });

  test('CachedCrawlService forwards caller cancellation on cache misses', async () => {
    const controller = new AbortController();
    let receivedSignal: AbortSignal | undefined;
    const crawler: Crawler = {
      async crawlUrl(_url, options) {
        receivedSignal = options?.signal;
        return { success: true, data: { markdown: '# Example' } };
      },
    };

    await new CachedCrawlService(
      crawler,
      new CacheService(60_000, 10),
    ).crawlUrl('https://example.com', { signal: controller.signal });

    expect(receivedSignal).toBe(controller.signal);
  });

  test('CrawlService rejects malformed crawl-error objects', async () => {
    const workflow: CrawlWorkflow = {
      async run() {
        throw { type: 'timeout' };
      },
    };

    const result = await new CrawlService(workflow).crawlUrl(
      'https://example.com',
    );

    expect(result).toEqual({
      success: false,
      error: {
        type: 'unknown',
        message: '[object Object]',
        cause: { type: 'timeout' },
      },
    });
  });
});
