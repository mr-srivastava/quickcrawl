// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from 'vitest';
import { crawlPage } from './api';

const successBody = {
  success: true,
  data: { markdown: '# Example', title: 'Example' },
};

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('crawlPage', () => {
  test('returns a validated successful response and forwards cancellation', async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(() =>
      Promise.resolve(jsonResponse(successBody)),
    );
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await expect(
      crawlPage('/crawl', 'https://example.com', controller.signal),
    ).resolves.toEqual(successBody);

    expect(fetchMock).toHaveBeenCalledWith(
      '/crawl',
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  test.each([
    ['missing', null, 60],
    ['invalid', 'later', 60],
    ['valid', '12', 12],
  ])(
    'formats a rate-limit response with a %s Retry-After header',
    async (_label, retryAfter, expectedSeconds) => {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      if (retryAfter !== null) headers.set('Retry-After', retryAfter);
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            jsonResponse(
              {
                success: false,
                error: { type: 'rate_limit', message: 'Rate limit exceeded' },
              },
              { status: 429, headers },
            ),
          ),
        ),
      );

      await expect(
        crawlPage(
          '/crawl',
          'https://example.com',
          new AbortController().signal,
        ),
      ).rejects.toThrow(
        `Rate limit exceeded. Try again in ${expectedSeconds} seconds.`,
      );
    },
  );

  test('includes validation details in a 422 message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse(
            {
              success: false,
              error: {
                type: 'validation_error',
                message: 'Invalid input',
                details: [{ path: ['url'], message: 'Invalid URL' }],
              },
            },
            { status: 422 },
          ),
        ),
      ),
    );

    await expect(
      crawlPage('/crawl', 'bad', new AbortController().signal),
    ).rejects.toThrow('Validation failed:');
  });

  test.each([
    ['invalid_url', 422],
    ['fetch_failed', 502],
    ['network_error', 503],
    ['timeout', 504],
    ['unknown', 500],
  ])('preserves the public %s error message', async (type, status) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse(
            { success: false, error: { type, message: `${type} message` } },
            { status },
          ),
        ),
      ),
    );

    await expect(
      crawlPage('/crawl', 'https://example.com', new AbortController().signal),
    ).rejects.toThrow(`${type} message`);
  });

  test.each([
    ['malformed JSON', new Response('{', { status: 500 })],
    ['unexpected shape', jsonResponse({ ok: true })],
  ])('rejects an invalid server response: %s', async (_label, response) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(response)),
    );

    await expect(
      crawlPage('/crawl', 'https://example.com', new AbortController().signal),
    ).rejects.toThrow('Invalid response from server');
  });

  test('rejects a non-OK response carrying a success envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse(successBody, { status: 500 }))),
    );

    await expect(
      crawlPage('/crawl', 'https://example.com', new AbortController().signal),
    ).rejects.toThrow('Crawl failed');
  });
});
