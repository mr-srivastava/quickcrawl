import { isCrawlError, type CrawlError } from './types';

export interface NormalizeCrawlErrorContext {
  timeoutMs?: number;
  stage?: string;
}

/**
 * Converts unknown thrown values into a structured CrawlError.
 *
 * Precedence:
 * 1. Already a CrawlError
 * 2. AbortError with timeoutMs → timeout
 * 3. Error with a fetch-like message → network_error
 * 4. Fallback → unknown
 */
export function normalizeCrawlError(
  error: unknown,
  context: NormalizeCrawlErrorContext = {},
): CrawlError {
  if (isCrawlError(error)) return error;

  if (
    error instanceof DOMException &&
    error.name === 'AbortError' &&
    context.timeoutMs !== undefined
  ) {
    return {
      type: 'timeout',
      timeoutMs: context.timeoutMs,
      stage: context.stage ?? 'workflow',
    };
  }

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
