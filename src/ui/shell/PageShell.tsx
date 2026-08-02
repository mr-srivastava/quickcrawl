import { APP_VERSION } from '../../config';
import {
  APP_MOUNT_ID,
  serializePageInit,
  type PageInit,
} from '../../contracts/page';
import { FontLinks } from '../FontLinks';

type PageShellProps = {
  init: PageInit;
};

export function PageShell({ init }: PageShellProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>
          {init.title} | {init.appName}
        </title>
        <meta
          name="description"
          content="Fetch web pages and convert them to clean Markdown with metadata extraction."
        />
        <FontLinks />
        <link rel="stylesheet" href={`/styles.css?v=${APP_VERSION}`} />
      </head>
      <body class="body-bg flex min-h-screen flex-col">
        <div
          id={APP_MOUNT_ID}
          data-page-init={serializePageInit(init)}
          class="contents"
        >
          <noscript>
            <div class="mx-auto max-w-4xl px-5 py-12 text-center">
              <p class="text-sm font-semibold text-ink">
                JavaScript is required for the QuickCrawl interface.
              </p>
            </div>
          </noscript>
        </div>
        <script type="module" src={`/assets/app.js?v=${APP_VERSION}`} />
      </body>
    </html>
  );
}
