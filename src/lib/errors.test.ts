import { describe, expect, test } from 'vitest';
import { Hono } from 'hono';
import { errorHandler } from './errors';

describe('errorHandler', () => {
  test.each([
    ['fetch_failed', 502, { type: 'fetch_failed', status: 503, statusText: 'Unavailable', url: 'https://example.com' }],
    ['timeout', 504, { type: 'timeout', timeoutMs: 100, stage: 'workflow' }],
    ['invalid_url', 422, { type: 'invalid_url', message: 'Unsafe URL' }],
  ] as const)('maps %s failures to HTTP %d', async (_, expectedStatus, error) => {
    const app = new Hono().get('/', (context) => errorHandler(error, context));
    const response = await app.request('/');
    expect(response.status).toBe(expectedStatus);
    expect(await response.json()).toMatchObject({ success: false, error: { type: error.type } });
  });
});
