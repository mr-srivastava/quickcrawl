import type { Context } from 'hono';
import { z } from 'zod';
import type { CrawlError } from '../workflows/crawl/types';
import { logger } from './logger';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
    this.name = 'ApiError';
  }
}

function crawlErrorToStatusCode(error: CrawlError): number {
  switch (error.type) {
    case 'fetch_failed':
      return 502;
    case 'timeout':
      return 504;
    case 'parse_failed':
    case 'invalid_html':
      return 422;
    case 'network_error':
      return 503;
    case 'unknown':
    default:
      return 500;
  }
}

function getErrorMessage(error: CrawlError): string {
  switch (error.type) {
    case 'fetch_failed':
      return `Fetch failed: ${error.status} ${error.statusText}`;
    case 'timeout':
      return `Request timed out after ${error.timeoutMs}ms`;
    case 'parse_failed':
    case 'invalid_html':
    case 'network_error':
    case 'unknown':
      return error.message;
    default:
      return 'Unknown error';
  }
}

function isCrawlError(error: unknown): error is CrawlError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error
  );
}

export function errorHandler(error: unknown, c: Context): Response {
  if (error instanceof ApiError) {
    logger.warn({ statusCode: error.statusCode, message: error.message }, 'ApiError');
    return c.json(
      { success: false, error: { type: 'unknown', message: error.message } },
      error.statusCode as 400 | 401 | 403 | 404 | 422 | 429 | 500 | 502 | 503 | 504,
    );
  }

  if (error instanceof z.ZodError) {
    logger.warn({ issues: error.issues }, 'Validation failed');
    return c.json(
      {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      },
      400,
    );
  }

  if (isCrawlError(error)) {
    const statusCode = crawlErrorToStatusCode(error);
    const message = getErrorMessage(error);
    logger.warn({ crawlErrorType: error.type, statusCode, message }, 'CrawlError');
    return c.json(
      { success: false, error: { type: error.type, message } },
      statusCode as 422 | 500 | 502 | 503 | 504,
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  const stack = error instanceof Error ? error.stack : undefined;
  logger.error({ err: error instanceof Error ? error : undefined, message, stack }, 'Unexpected error');

  return c.json(
    { success: false, error: { type: 'unknown', message } },
    500,
  );
}
