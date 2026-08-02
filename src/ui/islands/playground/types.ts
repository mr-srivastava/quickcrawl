import type { CrawlSuccess, PlaygroundInit } from '$contracts';

export type { CrawlSuccess, PlaygroundInit };
export type { CrawlApiResponse as CrawlResponse } from '$contracts';

export type PlaygroundState =
  | { type: 'idle' }
  | { type: 'loading'; url: string }
  | { type: 'success'; url: string; response: CrawlSuccess }
  | { type: 'error'; message: string };
