import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import type { CrawlContext } from '../types';
import type { Task } from '../../../workflow/types';
import { TASK_NAMES } from '../constants';
import { createModuleLogger } from '../../../lib/logger';

const taskLogger = createModuleLogger('task:convertToMarkdown');

const turndown = new TurndownService({ headingStyle: 'atx' });
turndown.use(gfm);

// Remove any remaining style/script content
turndown.remove(['style', 'script', 'noscript']);

type Input = Extract<CrawlContext, { stage: 'cleaned' }>;
type Output = Extract<CrawlContext, { stage: 'completed' }>;

async function convertToMarkdownTask(ctx: Input): Promise<Output> {
  taskLogger.debug({ url: ctx.url }, 'Converting to markdown');
  const markdown = turndown.turndown(ctx.cleanedDocument);
  taskLogger.info(
    { url: ctx.url, markdownLength: markdown.length },
    'Markdown conversion completed',
  );
  return {
    ...ctx,
    stage: 'completed',
    markdown,
  };
}

export const convertToMarkdown: Task<Input, Output> = {
  name: TASK_NAMES.CONVERT_TO_MARKDOWN,
  run: convertToMarkdownTask,
} as const;
