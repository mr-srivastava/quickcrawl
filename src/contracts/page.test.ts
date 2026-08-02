import { describe, expect, test } from 'vitest';
import { parsePageInit } from './page';

describe('parsePageInit', () => {
  test('accepts valid home initialization data', () => {
    expect(
      parsePageInit(
        JSON.stringify({
          page: 'home',
          title: 'Home',
          appName: 'QuickCrawl',
          tagline: 'Turn any URL into clean Markdown',
          exampleUrls: ['https://example.com'],
          rateLimit: { maxRequests: 10, windowMs: 60_000 },
        }),
      ),
    ).toMatchObject({ page: 'home' });
  });

  test('accepts valid playground initialization data', () => {
    expect(
      parsePageInit(
        JSON.stringify({
          page: 'playground',
          title: 'Playground',
          appName: 'QuickCrawl',
          playground: {
            endpoint: '/crawl',
            exampleUrls: ['https://example.com'],
          },
          baseUrl: 'http://localhost:3000',
        }),
      ),
    ).toMatchObject({ page: 'playground' });
  });

  test('accepts valid docs initialization data', () => {
    expect(
      parsePageInit(
        JSON.stringify({
          page: 'docs',
          title: 'API',
          appName: 'QuickCrawl',
          appVersion: '1.0.0',
          baseUrl: 'http://localhost:3000',
          rateLimit: { maxRequests: 10, windowMs: 60_000 },
          trustProxy: false,
          cacheTtlMs: 300_000,
          cacheMaxSize: 100,
          healthExample: '{"status":"ok"}',
        }),
      ),
    ).toMatchObject({ page: 'docs' });
  });

  test.each([
    undefined,
    '{',
    'null',
    '{"page":"home"}',
    '{"page":"docs","title":"API"}',
    '{"page":"playground","title":"Playground"}',
  ])('rejects invalid initialization data', (value) => {
    expect(parsePageInit(value)).toBeUndefined();
  });
});
