import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createCrawlWorkflow, CrawlInputSchema } from './workflows/crawl/index';
import { CrawlService } from './services/CrawlService';
import { CachedCrawlService } from './services/CachedCrawlService';
import { errorHandler } from './lib/errors';
import { createModuleLogger } from './lib/logger';
import { rateLimitMiddleware } from './middleware/rateLimit';

const apiLogger = createModuleLogger('api');

const workflow = createCrawlWorkflow();
const crawlService = new CrawlService(workflow);
const cachedCrawlService = new CachedCrawlService(crawlService);

const app = new Hono();

app.use('*', cors());

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.post('/crawl', rateLimitMiddleware(), async (c) => {
  const requestId = crypto.randomUUID();
  const requestLogger = apiLogger.child({ requestId });

  try {
    const body = await c.req.json();
    const parsed = CrawlInputSchema.safeParse(body);

    if (!parsed.success) {
      requestLogger.warn({ issues: parsed.error.issues }, 'Invalid input');
      return c.json(
        { error: 'Invalid input', issues: parsed.error.issues },
        422,
      );
    }

    const { url } = parsed.data;
    requestLogger.info({ url }, 'Crawl request received');

    const result = await cachedCrawlService.crawlUrl(url);

    if (result.success) {
      return c.json(result, 200);
    }

    return c.json(result, 500);
  } catch (err) {
    return errorHandler(err, c);
  }
});

export default app;
