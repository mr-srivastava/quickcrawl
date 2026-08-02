import { describe, expect, test } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createApp } from '../lib/createApp';
import type { Crawler } from '../services/types';
import {
  APP_NAME,
  APP_VERSION,
  DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_CACHE_TTL_MS,
  getRateLimitConfig,
} from '../config';

const crawler: Crawler = {
  async crawlUrl() {
    return { success: true, data: { markdown: '# Example' } };
  },
};
const app = createApp({
  crawler,
  crawlRateLimit: async (_context, next) => next(),
});

describe('UI routes', () => {
  test('GET /health returns service metadata', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: 'ok',
      service: APP_NAME.toLowerCase(),
      version: APP_VERSION,
    });
  });

  test('GET / returns HTML shell with app mount point', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('id="app-root"');
    expect(html).toContain('data-page-init=');
    expect(html).toContain(
      'JavaScript is required for the QuickCrawl interface',
    );
    expect(html).toContain(`src="/assets/app.js?v=${APP_VERSION}"`);
    expect(html).not.toContain('PLAYGROUND_SCRIPT');
    expect(html).not.toContain('id="playground-island"');
    expect(html).toContain(`/styles.css?v=${APP_VERSION}`);
  });

  test('GET /docs returns HTML shell with serialized docs init', async () => {
    const res = await app.request('/docs');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('id="app-root"');
    expect(html).toContain('data-page-init=');
    expect(html).toContain(APP_VERSION);
    expect(html).toContain(String(getRateLimitConfig().maxRequests));
    expect(html).toContain(String(DEFAULT_CACHE_TTL_MS));
    expect(html).toContain(String(DEFAULT_CACHE_MAX_SIZE));
    expect(html).toContain(`src="/assets/app.js?v=${APP_VERSION}"`);
  });

  test('GET /playground returns HTML shell with playground init', async () => {
    const res = await app.request('/playground');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('id="app-root"');
    expect(html).toContain('data-page-init=');
    expect(html).toContain('page&quot;:&quot;playground');
    expect(html).toContain('/crawl');
    expect(html).toContain(`src="/assets/app.js?v=${APP_VERSION}"`);
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

  test('GET /assets/app.js serves the client bundle or 503', async () => {
    const res = await app.request('/assets/app.js');
    const scriptPath = join(process.cwd(), 'public', 'assets', 'app.js');
    const expectedScript = await readFile(scriptPath, 'utf-8').catch(
      () => undefined,
    );

    expect(res.status).toBe(expectedScript === undefined ? 503 : 200);
    expect(res.headers.get('content-type')).toContain('text/javascript');
    expect(res.headers.get('cache-control')).toBe(
      'public, max-age=0, must-revalidate',
    );
    expect(await res.text()).toBe(
      expectedScript ?? '// app not built — run: pnpm run build:client',
    );
  });

  test('GET /assets/:chunk>.js serves code-split chunks or 404', async () => {
    const res = await app.request('/assets/app.js');
    const script = await res.text();
    const chunkMatch = script.match(/from "\.\/([\w.-]+\.js)"/);
    expect(chunkMatch).not.toBeNull();

    const chunkRes = await app.request(`/assets/${chunkMatch![1]}`);
    expect(chunkRes.status).toBe(200);
    expect(chunkRes.headers.get('content-type')).toContain('text/javascript');
    expect(await chunkRes.text()).toContain('export');
  });

  test('GET /assets rejects invalid filenames', async () => {
    const invalidExtension = await app.request('/assets/app.css');
    expect(invalidExtension.status).toBe(404);

    const missingAsset = await app.request('/assets/missing-chunk-abc123.js');
    expect(missingAsset.status).toBe(404);
  });
});
