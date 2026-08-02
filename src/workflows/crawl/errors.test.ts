import { describe, expect, test } from 'vitest';
import { normalizeCrawlError } from './errors';

describe('normalizeCrawlError', () => {
  test('returns CrawlError values unchanged', () => {
    const error = { type: 'invalid_url' as const, message: 'Unsafe URL' };
    expect(normalizeCrawlError(error)).toBe(error);
  });

  test('maps AbortError with timeoutMs to a timeout error', () => {
    expect(
      normalizeCrawlError(new DOMException('Aborted', 'AbortError'), {
        timeoutMs: 30_000,
        stage: 'workflow',
      }),
    ).toEqual({
      type: 'timeout',
      timeoutMs: 30_000,
      stage: 'workflow',
    });
  });

  test('maps fetch-like Error messages to network_error', () => {
    const cause = new Error('ECONNREFUSED');
    const error = new Error('fetch failed');
    error.cause = cause;

    expect(normalizeCrawlError(error)).toEqual({
      type: 'network_error',
      message: 'fetch failed',
      cause: cause.toString(),
    });
  });

  test('maps other Error values to unknown', () => {
    const error = new Error('boom');
    expect(normalizeCrawlError(error)).toEqual({
      type: 'unknown',
      message: 'boom',
      cause: error,
    });
  });

  test('maps non-Error values to unknown', () => {
    expect(normalizeCrawlError(42)).toEqual({
      type: 'unknown',
      message: '42',
      cause: 42,
    });
  });
});
