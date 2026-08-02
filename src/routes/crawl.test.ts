import { describe, expect, test } from 'vitest';
import { createApp } from '../app';
import type { Crawler } from '../services/types';

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

describe('Crawl routes', () => {
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
});
