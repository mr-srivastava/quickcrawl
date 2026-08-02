import { toCrawlResultData, type CrawlResult } from '../contracts/crawl';
import type { CrawlWorkflow } from '../workflows/crawl/types';
import { normalizeCrawlError } from '../workflows/crawl/errors';
import type { Crawler, CrawlOptions } from './types';
import { isCompleted } from '../workflows/crawl/guards';
import { createModuleLogger } from '../lib/logger';

const DEFAULT_TIMEOUT_MS = 30_000;

export class CrawlService implements Crawler {
  private readonly log = createModuleLogger('CrawlService');

  constructor(
    private readonly workflow: CrawlWorkflow,
    private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ) {}

  async crawlUrl(
    url: string,
    options: CrawlOptions = {},
  ): Promise<CrawlResult> {
    const startTime = Date.now();
    this.log.info({ url }, 'Starting crawl');

    try {
      const ctx = await this.workflow.run(
        { stage: 'initial', url },
        { timeoutMs: this.timeoutMs, signal: options.signal },
      );

      const duration = Date.now() - startTime;

      if (isCompleted(ctx)) {
        const data = toCrawlResultData({
          markdown: ctx.markdown,
          title: ctx.title,
          metadata: ctx.metadata,
        });

        this.log.info(
          {
            url,
            duration,
            markdownLength: ctx.markdown.length,
            titleLength: ctx.title?.length,
          },
          'Crawl completed successfully',
        );

        return { success: true, data };
      }

      this.log.error({ url, stage: ctx.stage }, 'Workflow incomplete');
      return {
        success: false,
        error: { type: 'unknown', message: 'Workflow incomplete' },
      };
    } catch (err) {
      const error = normalizeCrawlError(err, {
        timeoutMs: this.timeoutMs,
        stage: 'workflow',
      });
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.log.error(
        { url, err: err instanceof Error ? err : undefined, message },
        'Crawl failed',
      );

      return { success: false, error };
    }
  }
}
