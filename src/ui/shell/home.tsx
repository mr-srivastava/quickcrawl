import {
  APP_NAME,
  APP_TAGLINE,
  getRateLimitConfig,
} from '../../config';
import type { HomePageInit } from '../../contracts/page';
import { EXAMPLE_URLS } from '../constants';
import { PageShell } from './PageShell';

export function HomeShell() {
  const init: HomePageInit = {
    page: 'home',
    title: 'Try it',
    appName: APP_NAME,
    tagline: APP_TAGLINE,
    playground: {
      endpoint: '/crawl',
      exampleUrls: [...EXAMPLE_URLS],
    },
    rateLimit: getRateLimitConfig(),
  };

  return <PageShell init={init} />;
}
