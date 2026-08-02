import { Hono, type MiddlewareHandler } from 'hono';
import { errorHandler, validationErrorResponse } from '../lib/errors';
import { createModuleLogger } from '../lib/logger';
import type { Crawler } from '../services/types';
import { CrawlRequestSchema } from '../contracts/crawl';
import * as v from 'valibot';

export interface CrawlRoutesDependencies {
  crawler: Crawler;
  rateLimit: MiddlewareHandler;
}

export function createCrawlRoutes({
  crawler,
  rateLimit,
}: CrawlRoutesDependencies): Hono {
  const routes = new Hono();
  const apiLogger = createModuleLogger('api');

  routes.post('/crawl', rateLimit, async (c) => {
    const requestId = crypto.randomUUID();
    const requestLogger = apiLogger.child({ requestId });

    try {
      let body: unknown;
      try {
        body = await c.req.json();
      } catch (error) {
        requestLogger.warn(
          { err: error instanceof Error ? error : undefined },
          'Invalid JSON input',
        );
        return validationErrorResponse(c, []);
      }

      const parsed = v.safeParse(CrawlRequestSchema, body);
      if (!parsed.success) {
        requestLogger.warn({ issues: parsed.issues }, 'Invalid input');
        return validationErrorResponse(c, parsed.issues);
      }

      const { url } = parsed.output;
      requestLogger.info({ url }, 'Crawl request received');

      const result = await crawler.crawlUrl(url, {
        signal: c.req.raw.signal,
      });

      return result.success
        ? c.json(result, 200)
        : errorHandler(result.error, c);
    } catch (error) {
      return errorHandler(error, c);
    }
  });

  return routes;
}
