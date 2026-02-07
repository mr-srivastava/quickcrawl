import * as cheerio from 'cheerio';
import type { CrawlContext, Metadata } from '../types';
import type { Task } from '../../../workflow/types';
import { TASK_NAMES } from '../constants';
import { createModuleLogger } from '../../../lib/logger';

const taskLogger = createModuleLogger('task:extractMetadata');

type Input = Extract<CrawlContext, { stage: 'fetched' }>;
type Output = Extract<CrawlContext, { stage: 'metadata_extracted' }>;

async function extractMetadataTask(ctx: Input): Promise<Output> {
  taskLogger.debug({ url: ctx.url }, 'Extracting metadata');
  const $ = cheerio.load(ctx.html);
  const metadata: Metadata = {};

  // Extract title
  const titleEl = $('head title').first();
  if (titleEl.length) {
    metadata.title = titleEl.text().trim() || ctx.title;
  } else if (ctx.title) {
    metadata.title = ctx.title;
  }

  // Meta tags: name and property
  $('head meta').each((_, el) => {
    const $el = $(el);
    const name = $el.attr('name');
    const property = $el.attr('property');
    const content = $el.attr('content');
    if (content == null) return;
    if (name) metadata[name] = content;
    if (property) metadata[property] = content;
  });

  // Known OpenGraph aliases
  if (metadata['og:title']) metadata.ogTitle = metadata['og:title'];
  if (metadata['og:description'])
    metadata.ogDescription = metadata['og:description'];
  if (metadata['og:image']) metadata.ogImage = metadata['og:image'];
  if (metadata['og:url']) metadata.ogUrl = metadata['og:url'];

  // Favicon from link
  const favicon =
    $('head link[rel="icon"]').attr('href') ??
    $('head link[rel="shortcut icon"]').attr('href');
  if (favicon) metadata.favicon = favicon;

  const keyCount = Object.keys(metadata).length;
  taskLogger.info({ url: ctx.url, metadataKeys: keyCount }, 'Metadata extracted');
  return {
    ...ctx,
    stage: 'metadata_extracted',
    metadata,
  };
}

export const extractMetadata: Task<Input, Output> = {
  name: TASK_NAMES.EXTRACT_METADATA,
  run: extractMetadataTask,
} as const;
