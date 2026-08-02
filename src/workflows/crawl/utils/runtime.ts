import { normalizeCrawlError } from '../errors';
import type { CrawlContext } from '../types';
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
 * Creates an error-stage context from a URL, thrown error, and optional partial data.
 */
export function createErrorContext(
  url: string,
  error: unknown,
  stage: string,
  partialData?: Partial<Extract<CrawlContext, { stage: 'completed' }>>,
): Extract<CrawlContext, { stage: 'error' }> {
  return {
    stage: 'error',
    url,
    error: normalizeCrawlError(error, { stage }),
    partialData,
  };
}
