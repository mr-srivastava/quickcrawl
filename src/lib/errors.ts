import type { Context } from 'hono';
import { z } from 'zod';
import { isCrawlError, type CrawlError } from '../workflows/crawl/types';
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

export function validationErrorResponse(
  c: Context,
  details: unknown,
): Response {
  return c.json(
    {
      success: false,
      error: {
        type: 'validation_error',
        message: 'Invalid input',
        details,
      },
    },
    422,
  );
}

export function rateLimitErrorResponse(c: Context): Response {
  return c.json(
    {
      success: false,
      error: { type: 'rate_limit', message: 'Rate limit exceeded' },
    },
    429,
  );
}

function crawlErrorToStatusCode(error: CrawlError): number {
  switch (error.type) {
    case 'fetch_failed':
      return 502;
    case 'timeout':
      return 504;
    case 'parse_failed':
    case 'invalid_html':
    case 'invalid_url':
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
    case 'invalid_url':
      return error.message;
    case 'network_error':
      return 'Network request failed';
    case 'unknown':
      return 'Internal server error';
    default:
      return 'Unknown error';
  }
}

export function errorHandler(error: unknown, c: Context): Response {
  if (error instanceof ApiError) {
    const publicMessage = error.isOperational
      ? error.message
      : 'Internal server error';
    logger.warn(
      { statusCode: error.statusCode, message: error.message },
      'ApiError',
    );
    return c.json(
      { success: false, error: { type: 'unknown', message: publicMessage } },
      error.statusCode as
        | 400
        | 401
        | 403
        | 404
        | 422
        | 429
        | 500
        | 502
        | 503
        | 504,
    );
  }

  if (error instanceof z.ZodError) {
    logger.warn({ issues: error.issues }, 'Validation failed');
    return validationErrorResponse(c, error.issues);
  }

  if (isCrawlError(error)) {
    const statusCode = crawlErrorToStatusCode(error);
    const message = getErrorMessage(error);
    logger.warn(
      { crawlErrorType: error.type, statusCode, message },
      'CrawlError',
    );
    return c.json(
      { success: false, error: { type: error.type, message } },
      statusCode as 422 | 500 | 502 | 503 | 504,
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  const stack = error instanceof Error ? error.stack : undefined;
  logger.error(
    { err: error instanceof Error ? error : undefined, message, stack },
    'Unexpected error',
  );

  return c.json(
    {
      success: false,
      error: { type: 'unknown', message: 'Internal server error' },
    },
    500,
  );
}
