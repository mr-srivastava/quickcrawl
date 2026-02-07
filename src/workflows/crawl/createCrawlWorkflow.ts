import { Workflow } from '../../workflow/index';
import type { CrawlContext } from './types';
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
export function createCrawlWorkflow(): Workflow<InitialContext, CrawlContext> {
  return new Workflow<InitialContext, CrawlContext>([
    fetchHtml,
    extractMetadata,
    parseDocument,
    cleanDocument,
    convertToMarkdown,
  ]);
}
