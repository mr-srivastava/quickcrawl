import type { CrawlContext, CrawlWorkflow } from './types';
import {
  cleanDocument,
  convertToMarkdown,
  extractMetadata,
  fetchHtml,
  parseDocument,
} from './tasks/index';

type InitialContext = Extract<CrawlContext, { stage: 'initial' }>;

/**
 * Creates a crawl workflow that fetches a URL, extracts metadata, parses and cleans HTML, and converts to markdown.
 * Pass `{ stage: 'initial', url }` to run(); the result is a CrawlContext (typically 'completed', but could be any stage).
 */
export function createCrawlWorkflow(): CrawlWorkflow {
  return {
    async run(initial: InitialContext, options = {}): Promise<CrawlContext> {
      const controller = new AbortController();
      const abort = () => controller.abort(options.signal?.reason);
      options.signal?.addEventListener('abort', abort, { once: true });
      const timeoutId =
        options.timeoutMs == null
          ? undefined
          : setTimeout(() => controller.abort('timeout'), options.timeoutMs);

      try {
        const fetched = await fetchHtml.run(initial, controller.signal);
        const withMetadata = await extractMetadata.run(
          fetched,
          controller.signal,
        );
        const parsed = await parseDocument.run(withMetadata, controller.signal);
        const cleaned = await cleanDocument.run(parsed, controller.signal);
        return await convertToMarkdown.run(cleaned, controller.signal);
      } catch (error) {
        if (
          controller.signal.aborted &&
          controller.signal.reason === 'timeout'
        ) {
          throw {
            type: 'timeout',
            timeoutMs: options.timeoutMs ?? 0,
            stage: 'workflow',
          } satisfies import('./types').CrawlError;
        }
        throw error;
      } finally {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        options.signal?.removeEventListener('abort', abort);
      }
    },
  };
}
