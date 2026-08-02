import { Hono } from 'hono';
import { HomePage } from '../ui/HomePage';
import { DocsPage } from '../ui/DocsPage';
import { APP_NAME, APP_VERSION } from '../config';
import { clearStylesCache, getStylesCss } from '../lib/styles';
import {
  clearUiAssetsCache,
  getUiAsset,
  isValidAssetFilename,
} from '../lib/uiAssets';

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
          : 'public, max-age=0, must-revalidate',
    });
  } catch {
    return c.text('/* styles not built — run: pnpm run build:css */', 503, {
      'Content-Type': 'text/css',
    });
  }
});

uiRoutes.get('/assets/:filename', async (c) => {
  const filename = c.req.param('filename');
  if (!isValidAssetFilename(filename)) {
    return c.text('Not found', 404);
  }

  if (process.env.NODE_ENV === 'development') {
    clearUiAssetsCache();
  }

  const asset = await getUiAsset(filename);
  if (asset === undefined) {
    const fallback =
      filename === 'playground.js'
        ? '// playground not built — run: pnpm run build:client'
        : '// asset not found';
    return c.text(fallback, filename === 'playground.js' ? 503 : 404, {
      'Content-Type': filename.endsWith('.map')
        ? 'application/json'
        : 'text/javascript; charset=utf-8',
    });
  }

  return c.body(asset, 200, {
    'Content-Type': filename.endsWith('.map')
      ? 'application/json'
      : 'text/javascript; charset=utf-8',
    'Cache-Control':
      process.env.NODE_ENV === 'development'
        ? 'no-cache'
        : 'public, max-age=0, must-revalidate',
  });
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
