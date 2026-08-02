import type { PlaygroundError } from './types';

export function playgroundErrorTitle(error: PlaygroundError): string {
  switch (error.kind) {
    case 'validation':
      return 'Invalid URL';
    case 'rate_limit':
      return 'Rate limited';
    case 'network':
      return 'Network error';
    case 'invalid_response':
      return 'Server error';
    case 'crawl':
      if (error.errorType === 'invalid_url') return 'Invalid URL';
      if (error.errorType === 'timeout') return 'Request timed out';
      if (error.errorType === 'fetch_failed') return 'Fetch failed';
      return 'Crawl failed';
  }
}

export function formatValidationDetails(details: unknown): string[] {
  if (details === undefined || details === null) return [];

  if (Array.isArray(details)) {
    return details.flatMap((item) => {
      if (typeof item === 'string') return [item];
      if (
        typeof item === 'object' &&
        item !== null &&
        'message' in item &&
        typeof item.message === 'string'
      ) {
        const path =
          'path' in item && Array.isArray(item.path)
            ? `${item.path.join('.')}: `
            : '';
        return [`${path}${item.message}`];
      }
      return [JSON.stringify(item)];
    });
  }

  if (typeof details === 'string') return [details];
  return [JSON.stringify(details, null, 2)];
}

export function syncPlaygroundUrl(url: string) {
  if (typeof window === 'undefined') return;

  const next = new URL(window.location.href);
  const trimmed = url.trim();
  if (trimmed === '') {
    next.searchParams.delete('url');
  } else {
    next.searchParams.set('url', trimmed);
  }
  window.history.replaceState({}, '', next);
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
