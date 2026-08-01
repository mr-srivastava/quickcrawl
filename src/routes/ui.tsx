import { Hono } from 'hono';
import { HomePage } from '../ui/HomePage';
import { DocsPage } from '../ui/DocsPage';
import { APP_NAME, APP_VERSION } from '../config';
import { clearStylesCache, getStylesCss } from '../lib/styles';

export const uiRoutes = new Hono();

uiRoutes.get('/styles.css', async (c) => {
  if (process.env.NODE_ENV === 'development') {
    clearStylesCache();
  }
  try {
    const css = await getStylesCss();
    return c.body(css, 200, {
      'Content-Type': 'text/css',
      'Cache-Control':
        process.env.NODE_ENV === 'development'
          ? 'no-cache'
          : 'public, max-age=31536000, immutable',
    });
  } catch {
    return c.text('/* styles not built — run: pnpm run build:css */', 503, {
      'Content-Type': 'text/css',
    });
  }
});

uiRoutes.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: APP_NAME.toLowerCase(),
    version: APP_VERSION,
  });
});

uiRoutes.get('/', (c) => {
  return c.html(<HomePage />);
});

uiRoutes.get('/docs', (c) => {
  return c.html(<DocsPage />);
});
