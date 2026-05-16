export const APP_NAME = 'QuickCrawl';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Turn any URL into clean Markdown';

export const EXAMPLE_URLS = [
  'https://example.com',
  'https://www.iana.org/help/example-domains',
] as const;

export const RATE_LIMIT_DEFAULT = {
  maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
};
