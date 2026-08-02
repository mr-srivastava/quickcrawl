import { parseCrawlApiResponse, type CrawlSuccess } from '$contracts/crawl';
import type { PlaygroundError } from './types';

export class PlaygroundRequestError extends Error {
  readonly playgroundError: PlaygroundError;

  constructor(playgroundError: PlaygroundError) {
    super(playgroundError.message);
    this.name = 'PlaygroundRequestError';
    this.playgroundError = playgroundError;
  }
}

function retryAfterSeconds(value: string | null): number {
  const seconds = value === null ? Number.NaN : Number.parseInt(value, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 60;
}

export async function crawlPage(
  endpoint: string,
  url: string,
  signal: AbortSignal,
): Promise<CrawlSuccess> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal,
    });
  } catch {
    throw new PlaygroundRequestError({
      kind: 'network',
      message: 'Network request failed. Check your connection and try again.',
    });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new PlaygroundRequestError({
      kind: 'invalid_response',
      message: 'Invalid response from server',
    });
  }

  const result = parseCrawlApiResponse(body);
  if (!result) {
    throw new PlaygroundRequestError({
      kind: 'invalid_response',
      message: 'Invalid response from server',
    });
  }

  if (response.status === 429) {
    const seconds = retryAfterSeconds(response.headers.get('Retry-After'));
    throw new PlaygroundRequestError({
      kind: 'rate_limit',
      retryAfterSeconds: seconds,
      message: `Rate limit exceeded. Try again in ${seconds} seconds.`,
    });
  }

  if (!result.success) {
    const { error } = result;
    if (response.status === 422 && error.type === 'validation_error') {
      throw new PlaygroundRequestError({
        kind: 'validation',
        message: error.message,
        details: error.details,
      });
    }
    throw new PlaygroundRequestError({
      kind: 'crawl',
      errorType: error.type,
      message: error.message,
    });
  }

  if (!response.ok) {
    throw new PlaygroundRequestError({
      kind: 'crawl',
      errorType: 'unknown',
      message: 'Crawl failed',
    });
  }

  return result;
}
