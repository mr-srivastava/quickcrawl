import * as cheerio from 'cheerio';
import type { CrawlContext } from '../types';
import type { Task } from '../../../workflow/types';
import { TASK_NAMES } from '../constants';
import { createModuleLogger } from '../../../lib/logger';

const taskLogger = createModuleLogger('task:parseDocument');

type Input = Extract<CrawlContext, { stage: 'metadata_extracted' }>;
type Output = Extract<CrawlContext, { stage: 'parsed' }>;

async function parseDocumentTask(ctx: Input): Promise<Output> {
  taskLogger.debug({ url: ctx.url }, 'Parsing document');
  const $ = cheerio.load(ctx.html);

  let document: string;
  if ($('article').length > 0) {
    document = $('article').first().html() ?? $.html();
  } else if ($('main').length > 0) {
    document = $('main').first().html() ?? $.html();
  } else if ($('body').length > 0) {
    document = $('body').html() ?? $.html();
  } else {
    document = $.html();
  }

  taskLogger.info({ url: ctx.url, documentLength: document.length }, 'Document parsed');
  return {
    ...ctx,
    stage: 'parsed',
    document,
  };
}

export const parseDocument: Task<Input, Output> = {
  name: TASK_NAMES.PARSE_DOCUMENT,
  run: parseDocumentTask,
} as const;
