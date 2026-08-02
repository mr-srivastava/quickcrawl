import { describe, expect, test } from 'vitest';
import * as v from 'valibot';
import {
  CrawlRequestSchema,
  parseCrawlApiResponse,
  toCrawlResultData,
} from './crawl';

describe('CrawlRequestSchema', () => {
  test('accepts HTTP and HTTPS URLs', () => {
    expect(
      v.safeParse(CrawlRequestSchema, { url: 'https://example.com' }).success,
    ).toBe(true);
    expect(
      v.safeParse(CrawlRequestSchema, { url: 'http://example.com' }).success,
    ).toBe(true);
  });

  test('rejects non-HTTP URLs', () => {
    expect(
      v.safeParse(CrawlRequestSchema, { url: 'ftp://example.com' }).success,
    ).toBe(false);
  });
});

describe('parseCrawlApiResponse', () => {
  test('accepts a successful crawl envelope', () => {
    expect(
      parseCrawlApiResponse({
        success: true,
        data: {
          markdown: '# Example',
          title: 'Example',
          metadata: { description: 'Example description' },
        },
      }),
    ).toEqual({
      success: true,
      data: {
        markdown: '# Example',
        title: 'Example',
        metadata: { description: 'Example description' },
      },
    });
  });

  test('accepts a public error envelope', () => {
    expect(
      parseCrawlApiResponse({
        success: false,
        error: {
          type: 'validation_error',
          message: 'Invalid input',
          details: [],
        },
      }),
    ).toEqual({
      success: false,
      error: {
        type: 'validation_error',
        message: 'Invalid input',
        details: [],
      },
    });
  });

  test.each([null, '{', { ok: true }, { success: true, data: {} }])(
    'rejects invalid response shapes',
    (value) => {
      expect(parseCrawlApiResponse(value)).toBeUndefined();
    },
  );
});

describe('toCrawlResultData', () => {
  test('removes undefined metadata entries', () => {
    expect(
      toCrawlResultData({
        markdown: '# Example',
        title: 'Example',
        metadata: { description: 'Visible', author: undefined },
      }),
    ).toEqual({
      markdown: '# Example',
      title: 'Example',
      metadata: { description: 'Visible' },
    });
  });
});
