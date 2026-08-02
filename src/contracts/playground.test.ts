import { describe, expect, test } from 'vitest';
import { parsePlaygroundInit } from './playground';

describe('parsePlaygroundInit', () => {
  test('accepts valid serialized initialization data', () => {
    expect(
      parsePlaygroundInit(
        JSON.stringify({
          endpoint: '/crawl',
          exampleUrls: ['https://example.com'],
        }),
      ),
    ).toEqual({
      endpoint: '/crawl',
      exampleUrls: ['https://example.com'],
    });
  });

  test.each([
    undefined,
    '{',
    'null',
    '{"endpoint":"https://other.test"}',
    '{"endpoint":"/crawl","exampleUrls":["ftp://example.com"]}',
  ])('rejects invalid initialization data', (value) => {
    expect(parsePlaygroundInit(value)).toBeUndefined();
  });
});
