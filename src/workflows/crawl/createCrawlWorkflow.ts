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
type FinalContext = Extract<CrawlContext, { stage: 'completed' }>;

/**
 * Creates a crawl workflow that fetches a URL, extracts metadata, parses and cleans HTML, and converts to markdown.
 * Pass `{ stage: 'initial', url }` to run(); the result is a completed context with markdown (or throws).
 */
export function createCrawlWorkflow(): Workflow<InitialContext, FinalContext> {
  return new Workflow<InitialContext, FinalContext>([
    fetchHtml,
    extractMetadata,
    parseDocument,
    cleanDocument,
    convertToMarkdown,
  ]);
}
