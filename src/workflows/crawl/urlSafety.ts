import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import type { CrawlError } from './types';

type LookupAddress = { address: string };
type LookupAll = (hostname: string) => Promise<LookupAddress[]>;

const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);

export async function assertSafeCrawlUrl(
  value: string,
  resolve: LookupAll = async (hostname) => lookup(hostname, { all: true }),
): Promise<URL> {
  const url = new URL(value);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw invalidUrl('URL must use HTTP or HTTPS');
  }
  if (url.username || url.password) {
    throw invalidUrl('URLs containing credentials are not allowed');
  }

  const hostname = url.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '');
  if (
    !hostname ||
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith('.localhost')
  ) {
    throw invalidUrl('Local network addresses are not allowed');
  }

  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await resolve(hostname);
  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !isPublicAddress(address))
  ) {
    throw invalidUrl('Private or reserved network addresses are not allowed');
  }

  return url;
}

function invalidUrl(message: string): CrawlError {
  return { type: 'invalid_url', message };
}

function isPublicAddress(address: string): boolean {
  if (isIP(address) === 4) return isPublicIpv4(address);
  if (isIP(address) === 6) return isPublicIpv6(address);
  return false;
}

function isPublicIpv4(address: string): boolean {
  const [a, b, c, d] = address.split('.').map(Number);
  if (
    [a, b, c, d].some(
      (part) => !Number.isInteger(part) || part < 0 || part > 255,
    )
  ) {
    return false;
  }
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113)
  );
}

function isPublicIpv6(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, '');
  if (normalized === '::' || normalized === '::1') return false;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return false;
  if (/^fe[89ab]/.test(normalized) || normalized.startsWith('ff')) return false;
  const mappedIpv4 = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  return mappedIpv4 ? isPublicIpv4(mappedIpv4) : true;
}
