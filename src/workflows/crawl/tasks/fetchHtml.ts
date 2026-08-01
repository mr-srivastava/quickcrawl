import pRetry from 'p-retry';
import type { CrawlContext } from '../types';
import type { Task } from '../../../workflow/types';
import { TASK_NAMES } from '../constants';
import { createModuleLogger } from '../../../lib/logger';
import { assertSafeCrawlUrl } from '../urlSafety';
import { isCrawlError } from '../types';

const taskLogger = createModuleLogger('task:fetchHtml');
const FETCH_TIMEOUT_MS = 15_000;
const RETRIES = 2;

type Input = Extract<CrawlContext, { stage: 'initial' }>;
type Output = Extract<CrawlContext, { stage: 'fetched' }>;

async function fetchHtmlTask(
  ctx: Input,
  signal?: AbortSignal,
): Promise<Output> {
  taskLogger.debug({ url: ctx.url }, 'Starting HTML fetch');
  const startTime = Date.now();

  let response: Response;
  try {
    response = await pRetry(
      () => fetchFollowingSafeRedirects(ctx.url, signal),
      {
        retries: RETRIES,
        signal,
        onFailedAttempt: (err) => {
          taskLogger.warn(
            {
              url: ctx.url,
              attempt: err.attemptNumber,
              retriesLeft: err.retriesLeft,
            },
            'Fetch attempt failed, retrying',
          );
        },
      },
    );
  } catch (error) {
    if (isCrawlError(error)) throw error;
    if (signal?.aborted) throw new DOMException('Crawl aborted', 'AbortError');
    throw {
      type: 'network_error',
      message:
        error instanceof Error ? error.message : 'Network request failed',
      cause: error instanceof Error ? error.message : undefined,
    } satisfies import('../types').CrawlError;
  }

  if (!response.ok) {
    taskLogger.error(
      {
        url: ctx.url,
        status: response.status,
        statusText: response.statusText,
      },
      'Fetch failed with non-OK status',
    );
    throw {
      type: 'fetch_failed',
      status: response.status,
      statusText: response.statusText,
      url: response.url || ctx.url,
    } satisfies import('../types').CrawlError;
  }

  const html = await response.text();
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;
  const duration = Date.now() - startTime;

  taskLogger.info(
    { url: ctx.url, htmlLength: html.length, duration },
    'HTML fetched successfully',
  );

  return {
    stage: 'fetched',
    url: ctx.url,
    html,
    title,
  };
}

async function fetchFollowingSafeRedirects(
  initialUrl: string,
  signal?: AbortSignal,
): Promise<Response> {
  let currentUrl = initialUrl;
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    const safeUrl = await assertSafeCrawlUrl(currentUrl);
    const requestSignal = signal
      ? AbortSignal.any([signal, AbortSignal.timeout(FETCH_TIMEOUT_MS)])
      : AbortSignal.timeout(FETCH_TIMEOUT_MS);
    const response = await fetch(safeUrl, {
      signal: requestSignal,
      redirect: 'manual',
      headers: {
        'User-Agent': 'Quickcrawl/1.0 (+https://github.com/quickcrawl)',
      },
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;

    const location = response.headers.get('location');
    await response.body?.cancel();
    if (!location) return response;
    currentUrl = new URL(location, safeUrl).toString();
  }
  throw {
    type: 'network_error',
    message: 'Too many redirects',
  } satisfies import('../types').CrawlError;
}

export const fetchHtml: Task<Input, Output> = {
  name: TASK_NAMES.FETCH_HTML,
  run: fetchHtmlTask,
} as const;
