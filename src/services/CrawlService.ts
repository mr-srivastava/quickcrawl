import type { Workflow } from '../workflow/index';
import type { CrawlResult, CrawlResultData, CrawlContext, Metadata } from '../workflows/crawl/types';
import { isCompleted } from '../workflows/crawl/guards';
import { removeUndefined } from '../workflows/crawl/utils/runtime';
import { createModuleLogger } from '../lib/logger';

type InitialContext = Extract<CrawlContext, { stage: 'initial' }>;

const DEFAULT_TIMEOUT_MS = 30_000;

export class CrawlService {
  private readonly log = createModuleLogger('CrawlService');

  constructor(
    private readonly workflow: Workflow<InitialContext, CrawlContext>,
    private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ) { }

  async crawlUrl(url: string): Promise<CrawlResult> {
    const startTime = Date.now();
    this.log.info({ url }, 'Starting crawl');

    try {
      const ctx = await this.workflow.run(
        { stage: 'initial', url },
        { timeoutMs: this.timeoutMs },
      );

      const duration = Date.now() - startTime;

      if (isCompleted(ctx)) {
        const metadata = ctx.metadata
          ? (removeUndefined(ctx.metadata as Metadata) as Metadata)
          : undefined;

        const data: CrawlResultData = {
          markdown: ctx.markdown,
          title: ctx.title,
          metadata,
        };

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
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.log.error({ url, err: err instanceof Error ? err : undefined, message }, 'Crawl failed');

      return {
        success: false,
        error: { type: 'unknown', message, cause: err },
      };
    }
  }
}
