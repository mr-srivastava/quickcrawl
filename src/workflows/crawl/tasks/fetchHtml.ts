import pRetry from 'p-retry';
import type { CrawlContext } from '../types';
import type { Task } from '../../../workflow/types';
import { TASK_NAMES } from '../constants';
import { createModuleLogger } from '../../../lib/logger';

const taskLogger = createModuleLogger('task:fetchHtml');
const FETCH_TIMEOUT_MS = 15_000;
const RETRIES = 2;

type Input = Extract<CrawlContext, { stage: 'initial' }>;
type Output = Extract<CrawlContext, { stage: 'fetched' }>;

async function fetchHtmlTask(ctx: Input): Promise<Output> {
  taskLogger.debug({ url: ctx.url }, 'Starting HTML fetch');
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const response = await pRetry(
    () =>
      fetch(ctx.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Quickcrawl/1.0 (+https://github.com/quickcrawl)',
        },
      }),
    {
      retries: RETRIES,
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

  clearTimeout(timeoutId);

  if (!response.ok) {
    taskLogger.error(
      { url: ctx.url, status: response.status, statusText: response.statusText },
      'Fetch failed with non-OK status',
    );
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
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

export const fetchHtml: Task<Input, Output> = {
  name: TASK_NAMES.FETCH_HTML,
  run: fetchHtmlTask,
} as const;
