import { parseCrawlApiResponse, type CrawlSuccess } from '$contracts/crawl';

export class PlaygroundRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlaygroundRequestError';
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
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    signal,
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new PlaygroundRequestError('Invalid response from server');
  }

  const result = parseCrawlApiResponse(body);
  if (!result) {
    throw new PlaygroundRequestError('Invalid response from server');
  }

  if (response.status === 429) {
    const seconds = retryAfterSeconds(response.headers.get('Retry-After'));
    throw new PlaygroundRequestError(
      `Rate limit exceeded. Try again in ${seconds} seconds.`,
    );
  }

  if (!result.success) {
    const { error } = result;
    if (response.status === 422 && error.type === 'validation_error') {
      const issues =
        error.details === undefined
          ? error.message
          : JSON.stringify(error.details, null, 2);
      throw new PlaygroundRequestError(`Validation failed: ${issues}`);
    }
    throw new PlaygroundRequestError(error.message);
  }

  if (!response.ok) {
    throw new PlaygroundRequestError('Crawl failed');
  }

  return result;
}
