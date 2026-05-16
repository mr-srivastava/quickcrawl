import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import app from '../index';
import {
  APP_NAME,
  APP_VERSION,
  DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_CACHE_TTL_MS,
  getRateLimitConfig,
} from '../config';

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
    expect(html).toContain('playground-form');
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
    try {
      await readFile(cssPath, 'utf-8');
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/css');
      expect((await res.text()).length).toBeGreaterThan(0);
    } catch {
      expect(res.status).toBe(503);
    }
  });
});
