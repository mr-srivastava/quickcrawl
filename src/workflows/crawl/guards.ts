import type { CrawlContext } from './types';

/** Type guard: context is at initial stage (only url) */
export function isInitial(
  ctx: CrawlContext,
): ctx is Extract<CrawlContext, { stage: 'initial' }> {
  return ctx.stage === 'initial';
}

/** Type guard: context has been fetched (has html) */
export function isFetched(
  ctx: CrawlContext,
): ctx is Extract<CrawlContext, { stage: 'fetched' }> {
  return ctx.stage === 'fetched';
}

/** Type guard: context has metadata extracted */
export function hasMetadata(
  ctx: CrawlContext,
): ctx is Extract<CrawlContext, { stage: 'metadata_extracted' }> {
  return ctx.stage === 'metadata_extracted';
}

/** Type guard: context has document parsed */
export function isParsed(
  ctx: CrawlContext,
): ctx is Extract<CrawlContext, { stage: 'parsed' }> {
  return ctx.stage === 'parsed';
}

/** Type guard: context has document cleaned */
export function isCleaned(
  ctx: CrawlContext,
): ctx is Extract<CrawlContext, { stage: 'cleaned' }> {
  return ctx.stage === 'cleaned';
}

/** Type guard: context is completed (has markdown) */
export function isCompleted(
  ctx: CrawlContext,
): ctx is Extract<CrawlContext, { stage: 'completed' }> {
  return ctx.stage === 'completed';
}

/** Type guard: context is in error state */
export function isError(
  ctx: CrawlContext,
): ctx is Extract<CrawlContext, { stage: 'error' }> {
  return ctx.stage === 'error';
}

/** Asserts context has html; throws if not (e.g. wrong stage) */
export function assertHasHtml(
  ctx: CrawlContext,
): asserts ctx is CrawlContext & { html: string } {
  if (!('html' in ctx) || !ctx.html) {
    throw new Error(`Expected html in context at stage ${ctx.stage}`);
  }
}

/** Asserts context has document; throws if not */
export function assertHasDocument(
  ctx: CrawlContext,
): asserts ctx is CrawlContext & { document: string } {
  if (!('document' in ctx) || !ctx.document) {
    throw new Error(`Expected document in context at stage ${ctx.stage}`);
  }
}
