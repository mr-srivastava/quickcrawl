import * as cheerio from 'cheerio';
import type { CrawlContext } from '../types';
import type { Task } from '../../../workflow/types';
import { TASK_NAMES } from '../constants';
import { createModuleLogger } from '../../../lib/logger';

const taskLogger = createModuleLogger('task:cleanDocument');

type Input = Extract<CrawlContext, { stage: 'parsed' }>;
type Output = Extract<CrawlContext, { stage: 'cleaned' }>;

async function cleanDocumentTask(ctx: Input): Promise<Output> {
  taskLogger.debug({ url: ctx.url }, 'Cleaning document');
  const raw = ctx.document;

  const $ = cheerio.load(raw);

  // Remove style, script, noscript
  $('style, script, noscript').remove();

  // Remove buttons that contain "Copy" or "copy code to clipboard"
  $('button, [role="button"]').each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim().toLowerCase();
    if (
      text.includes('copy') ||
      text.includes('copy code to clipboard')
    ) {
      $el.remove();
    }
  });

  // Remove elements that are only copy UI (e.g. "Copy" links/spans)
  $('a, span').each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim().toLowerCase();
    if (text === 'copy' || text === 'copy code to clipboard') {
      $el.remove();
    }
  });

  // Strip non-semantic data-* attributes from all elements
  $('*').each((_, el) => {
    const $el = $(el);
    const attrs = $el.attr();
    if (attrs) {
      Object.keys(attrs).forEach((key) => {
        if (key.startsWith('data-')) $el.removeAttr(key);
      });
    }
  });

  // Strip class attributes that are CSS-in-JS artifacts (class starts with "css-")
  $('[class]').each((_, el) => {
    const $el = $(el);
    const cls = $el.attr('class');
    if (cls) {
      const kept = cls
        .split(/\s+/)
        .filter((c) => !c.startsWith('css-'))
        .join(' ');
      if (kept) $el.attr('class', kept);
      else $el.removeAttr('class');
    }
  });

  const cleanedDocument = $.html();
  taskLogger.info(
    { url: ctx.url, cleanedLength: cleanedDocument.length },
    'Document cleaned',
  );
  return {
    ...ctx,
    stage: 'cleaned',
    cleanedDocument,
  };
}

export const cleanDocument: Task<Input, Output> = {
  name: TASK_NAMES.CLEAN_DOCUMENT,
  run: cleanDocumentTask,
} as const;
