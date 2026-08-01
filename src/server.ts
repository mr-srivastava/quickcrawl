import { serve } from '@hono/node-server';
import app from './index';
import { logger } from './lib/logger';
import { DEFAULT_PORT } from './config';

const port = DEFAULT_PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info(
      { port: info.port, env: process.env.NODE_ENV },
      'Server started',
    );
  },
);
