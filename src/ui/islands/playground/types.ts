import type { CrawlSuccess, PlaygroundInit } from '$contracts';

export type { CrawlSuccess, PlaygroundInit };
export type { CrawlApiResponse as CrawlResponse } from '$contracts';

export type PlaygroundError =
  | { kind: 'validation'; message: string; details?: unknown }
  | { kind: 'rate_limit'; retryAfterSeconds: number; message: string }
  | { kind: 'crawl'; errorType: string; message: string }
  | { kind: 'network'; message: string }
  | { kind: 'invalid_response'; message: string };

export type PlaygroundState =
  | { type: 'idle' }
  | { type: 'loading'; url: string }
  | { type: 'success'; url: string; response: CrawlSuccess }
  | { type: 'error'; url: string; error: PlaygroundError }
  | { type: 'cancelled'; url: string };
