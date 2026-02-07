import type { CrawlContext, CrawlError } from '../types';
import type { RemoveUndefined } from './types';

/**
 * Removes keys with undefined values from an object.
 * Returns a new object suitable for JSON serialization (no undefined).
 */
export function removeUndefined<T extends Record<string, unknown>>(
  obj: T,
): RemoveUndefined<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      (entry): entry is [string, NonNullable<T[keyof T]>] => entry[1] != null,
    ),
  ) as RemoveUndefined<T>;
}

/**
 * Converts unknown thrown value to a CrawlError for consistent error handling.
 */
function toCrawlError(error: unknown, stage: string): CrawlError {
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return {
        type: 'network_error',
        message: error.message,
        cause: error.cause?.toString(),
      };
    }
    return {
      type: 'unknown',
      message: error.message,
      cause: error,
    };
  }
  return {
    type: 'unknown',
    message: String(error),
    cause: error,
  };
}

/**
 * Creates an error-stage context from a URL, thrown error, and optional partial data.
 */
export function createErrorContext(
  url: string,
  error: unknown,
  stage: string,
  partialData?: Partial<Extract<CrawlContext, { stage: 'completed' }>>,
): Extract<CrawlContext, { stage: 'error' }> {
  const crawlError = toCrawlError(error, stage);
  return {
    stage: 'error',
    url,
    error: crawlError,
    partialData,
  };
}
