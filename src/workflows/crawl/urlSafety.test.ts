import { describe, expect, test } from 'vitest';
import { assertSafeCrawlUrl } from './urlSafety';

const resolvesTo = (address: string) => async () => [{ address }];

describe('assertSafeCrawlUrl', () => {
  test('accepts HTTP and HTTPS URLs resolving to public addresses', async () => {
    expect((await assertSafeCrawlUrl('https://example.com/path', resolvesTo('93.184.216.34'))).hostname)
      .toBe('example.com');
  });

  test.each([
    ['loopback', '127.0.0.1'],
    ['private', '10.0.0.1'],
    ['link-local', '169.254.169.254'],
    ['IPv6 loopback', '::1'],
    ['IPv6 private', 'fd00::1'],
  ])('rejects %s addresses', async (_, address) => {
    await expect(assertSafeCrawlUrl('https://example.com', resolvesTo(address))).rejects.toMatchObject({
      type: 'invalid_url',
    });
  });

  test('rejects a host if any DNS answer is private', async () => {
    await expect(assertSafeCrawlUrl('https://example.com', async () => [
      { address: '93.184.216.34' },
      { address: '127.0.0.1' },
    ])).rejects.toMatchObject({ type: 'invalid_url' });
  });

  test('rejects credentials and non-HTTP schemes', async () => {
    await expect(assertSafeCrawlUrl('https://user:secret@example.com', resolvesTo('93.184.216.34')))
      .rejects.toMatchObject({ type: 'invalid_url' });
    await expect(assertSafeCrawlUrl('ftp://example.com', resolvesTo('93.184.216.34')))
      .rejects.toMatchObject({ type: 'invalid_url' });
  });
});
