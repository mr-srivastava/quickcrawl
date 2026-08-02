// @vitest-environment jsdom

import { describe, expect, test } from 'vitest';
import {
  formatValidationDetails,
  playgroundErrorTitle,
  syncPlaygroundUrl,
} from './errors';

describe('playgroundErrorTitle', () => {
  test.each([
    [{ kind: 'validation', message: 'Invalid' }, 'Invalid URL'],
    [
      {
        kind: 'rate_limit',
        retryAfterSeconds: 30,
        message: 'Rate limit exceeded',
      },
      'Rate limited',
    ],
    [{ kind: 'network', message: 'Network failed' }, 'Network error'],
    [
      { kind: 'crawl', errorType: 'timeout', message: 'Timed out' },
      'Request timed out',
    ],
  ] as const)('maps %o to %s', (error, title) => {
    expect(playgroundErrorTitle(error)).toBe(title);
  });
});

describe('formatValidationDetails', () => {
  test('formats issue objects with paths', () => {
    expect(
      formatValidationDetails([
        { path: ['url'], message: 'Invalid URL' },
        { message: 'Required' },
      ]),
    ).toEqual(['url: Invalid URL', 'Required']);
  });
});

describe('syncPlaygroundUrl', () => {
  test('updates the url search param', () => {
    window.history.replaceState({}, '', '/playground');
    syncPlaygroundUrl('https://example.com');
    expect(window.location.search).toBe('?url=https%3A%2F%2Fexample.com');
  });
});
