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

  test('GET / returns HTML', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('id="playground-island"');
    expect(html).toContain('data-playground-init=');
    expect(html).toContain('The interactive playground is loading');
    expect(html).toContain('JavaScript is required');
    expect(html).toContain(`src="/assets/playground.js?v=${APP_VERSION}"`);
    expect(html).not.toContain('PLAYGROUND_SCRIPT');
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

  test('GET /assets/playground.js serves the client bundle or 503', async () => {
    const res = await app.request('/assets/playground.js');
    const scriptPath = join(process.cwd(), 'public', 'assets', 'playground.js');
    const expectedScript = await readFile(scriptPath, 'utf-8').catch(
      () => undefined,
    );

    expect(res.status).toBe(expectedScript === undefined ? 503 : 200);
    expect(res.headers.get('content-type')).toContain('text/javascript');
    expect(res.headers.get('cache-control')).toBe(
      'public, max-age=0, must-revalidate',
    );
    expect(await res.text()).toBe(
      expectedScript ?? '// playground not built — run: pnpm run build:client',
    );
  });

  test('GET /assets/:chunk>.js serves code-split chunks or 404', async () => {
    const res = await app.request('/assets/playground.js');
    const script = await res.text();
    const chunkMatch = script.match(/from "\.\/([\w.-]+\.js)"/);
    expect(chunkMatch).not.toBeNull();

    const chunkRes = await app.request(`/assets/${chunkMatch![1]}`);
    expect(chunkRes.status).toBe(200);
    expect(chunkRes.headers.get('content-type')).toContain('text/javascript');
    expect(await chunkRes.text()).toContain('export');
  });

  test('GET /assets rejects invalid filenames', async () => {
    const invalidExtension = await app.request('/assets/playground.css');
    expect(invalidExtension.status).toBe(404);

    const missingAsset = await app.request('/assets/missing-chunk-abc123.js');
    expect(missingAsset.status).toBe(404);
  });
});
