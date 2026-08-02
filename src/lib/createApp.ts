import { Hono, type MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';
import { createCrawlRoutes } from '../routes/crawl';
import { uiRoutes } from '../routes/ui';
import type { Crawler } from '../services/types';

export interface AppDependencies {
  crawler: Crawler;
  crawlRateLimit: MiddlewareHandler;
}

export function createApp(dependencies: AppDependencies): Hono {
  const app = new Hono();

  app.use('*', cors());
  app.route('/', uiRoutes);
  app.route(
    '/',
    createCrawlRoutes({
      crawler: dependencies.crawler,
      rateLimit: dependencies.crawlRateLimit,
    }),
  );

  return app;
}
