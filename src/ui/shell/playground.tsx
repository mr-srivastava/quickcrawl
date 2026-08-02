import { APP_NAME, DEFAULT_PORT } from '../../config';
import type { PlaygroundPageInit } from '../../contracts/page';
import { EXAMPLE_URLS } from '../constants';
import { PageShell } from './PageShell';

export function PlaygroundShell() {
  const init: PlaygroundPageInit = {
    page: 'playground',
    title: 'Playground',
    appName: APP_NAME,
    playground: {
      endpoint: '/crawl',
      exampleUrls: [...EXAMPLE_URLS],
    },
    baseUrl: `http://localhost:${DEFAULT_PORT}`,
  };

  return <PageShell init={init} />;
}
