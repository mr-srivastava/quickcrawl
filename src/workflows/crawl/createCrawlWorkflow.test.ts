import { describe, expect, test } from 'vitest';
import { createCrawlWorkflow } from './createCrawlWorkflow';

describe('crawl workflow', () => {
  test('aborts active work when its overall timeout expires', async () => {
    const originalFetch = globalThis.fetch;
    let fetchWasAborted = false;
    globalThis.fetch = ((_: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => {
            fetchWasAborted = true;
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      })) as typeof fetch;

    try {
      await expect(
        createCrawlWorkflow().run(
          { stage: 'initial', url: 'https://93.184.216.34' },
          { timeoutMs: 5 },
        ),
      ).rejects.toMatchObject({ type: 'timeout', stage: 'workflow' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(fetchWasAborted).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
