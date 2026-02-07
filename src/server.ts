import { serve } from '@hono/node-server';
import app from './index';
import { logger } from './lib/logger';

const port = Number(process.env.PORT) || 3000;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info({ port: info.port, env: process.env.NODE_ENV }, 'Server started');
  },
);
