import { describe, expect, test } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createApp } from '../app';
import type { Crawler } from '../services/types';
import {
  APP_NAME,
  APP_VERSION,
  DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_CACHE_TTL_MS,
  getRateLimitConfig,
} from '../config';

let receivedSignal: AbortSignal | undefined;
const crawler: Crawler = {
  async crawlUrl(_url, options) {
    receivedSignal = options?.signal;
    return { success: true, data: { markdown: '# Example' } };
  },
};
const app = createApp({
  crawler,
  crawlRateLimit: async (_context, next) => next(),
});

describe('UI routes', () => {
  test('POST /crawl rejects non-HTTP URLs with the standard error envelope', async () => {
    const res = await app.request('/crawl', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'ftp://example.com' }),
    });
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({
      success: false,
      error: { type: 'validation_error', message: 'Invalid input' },
    });
  });

  test('POST /crawl rejects malformed JSON with the standard error envelope', async () => {
    const res = await app.request('/crawl', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      success: false,
      error: {
        type: 'validation_error',
        message: 'Invalid input',
        details: [],
      },
    });
  });

  test('POST /crawl invokes the injected crawler with request cancellation', async () => {
    receivedSignal = undefined;
    const res = await app.request('/crawl', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: { markdown: '# Example' },
    });
    expect(receivedSignal).toBeInstanceOf(AbortSignal);
  });

  test('GET /health returns service metadata', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: 'ok',
      service: APP_NAME.toLowerCase(),
      version: APP_VERSION,
    });
  });

  test('GET / returns HTML', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('playground-form');
    expect(html).toContain('aria-labelledby="playground-heading"');
    expect(html).toContain('aria-describedby="url-hint"');
    expect(html).toContain('aria-labelledby="tab-preview"');
    expect(html).toContain('aria-labelledby="tab-metadata"');
    expect(html).toContain('id="result-stats"');
    expect(html).toContain('id="result-source"');
    expect(html).toContain('href="#main-content"');
    expect(html).toContain(`/styles.css?v=${APP_VERSION}`);
  });

  test('GET /docs returns HTML', async () => {
    const res = await app.request('/docs');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain(APP_VERSION);
    expect(html).toContain(String(getRateLimitConfig().maxRequests));
    expect(html).toContain(String(DEFAULT_CACHE_TTL_MS));
    expect(html).toContain(String(DEFAULT_CACHE_MAX_SIZE));
  });

  test('GET /styles.css serves compiled CSS or 503', async () => {
    const res = await app.request('/styles.css');
    const cssPath = join(process.cwd(), 'public', 'styles.css');
    const expectedCss = await readFile(cssPath, 'utf-8').catch(() => undefined);

    expect(res.status).toBe(expectedCss === undefined ? 503 : 200);
    expect(res.headers.get('content-type')).toContain('text/css');
    expect(res.headers.get('cache-control')).toBe(
      'public, max-age=0, must-revalidate',
    );
    expect(await res.text()).toBe(
      expectedCss ?? '/* styles not built — run: pnpm run build:css */',
    );
  });
});
