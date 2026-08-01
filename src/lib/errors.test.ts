import { describe, expect, test } from 'vitest';
import { Hono } from 'hono';
import { z } from 'zod';
import { ApiError, errorHandler } from './errors';

describe('errorHandler', () => {
  test.each([
    [
      'fetch_failed',
      502,
      {
        type: 'fetch_failed',
        status: 503,
        statusText: 'Unavailable',
        url: 'https://example.com',
      },
    ],
    ['timeout', 504, { type: 'timeout', timeoutMs: 100, stage: 'workflow' }],
    ['invalid_url', 422, { type: 'invalid_url', message: 'Unsafe URL' }],
  ] as const)(
    'maps %s failures to HTTP %d',
    async (_, expectedStatus, error) => {
      const app = new Hono().get('/', (context) =>
        errorHandler(error, context),
      );
      const response = await app.request('/');
      expect(response.status).toBe(expectedStatus);
      expect(await response.json()).toMatchObject({
        success: false,
        error: { type: error.type },
      });
    },
  );

  test('uses the standard validation envelope for Zod errors', async () => {
    const validationError = new z.ZodError([]);
    const app = new Hono().get('/', (context) =>
      errorHandler(validationError, context),
    );

    const response = await app.request('/');

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      success: false,
      error: {
        type: 'validation_error',
        message: 'Invalid input',
        details: [],
      },
    });
  });

  test('does not expose unexpected error messages', async () => {
    const app = new Hono().get('/', (context) =>
      errorHandler(new Error('database password is secret'), context),
    );

    const response = await app.request('/');

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      success: false,
      error: { type: 'unknown', message: 'Internal server error' },
    });
  });

  test('does not expose network failure details', async () => {
    const app = new Hono().get('/', (context) =>
      errorHandler(
        {
          type: 'network_error',
          message: 'connect ECONNREFUSED 10.0.0.1:5432',
        },
        context,
      ),
    );

    const response = await app.request('/');

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      success: false,
      error: { type: 'network_error', message: 'Network request failed' },
    });
  });

  test('does not expose non-operational ApiError messages', async () => {
    const app = new Hono().get('/', (context) =>
      errorHandler(new ApiError(500, 'implementation detail', false), context),
    );

    const response = await app.request('/');

    expect(await response.json()).toMatchObject({
      error: { message: 'Internal server error' },
    });
  });

  test('rejects objects that only resemble crawl errors', async () => {
    const app = new Hono().get('/', (context) =>
      errorHandler({ type: 'timeout' }, context),
    );

    const response = await app.request('/');

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      success: false,
      error: { type: 'unknown', message: 'Internal server error' },
    });
  });
});
