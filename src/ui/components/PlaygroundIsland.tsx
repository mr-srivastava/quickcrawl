import type { PlaygroundInit } from '../../contracts/playground';
import {
  PLAYGROUND_MOUNT_ID,
  serializePlaygroundInit,
} from '../../contracts/playground';

type PlaygroundIslandProps = {
  init: PlaygroundInit;
};

export function PlaygroundIsland({ init }: PlaygroundIslandProps) {
  return (
    <div
      id={PLAYGROUND_MOUNT_ID}
      data-playground-init={serializePlaygroundInit(init)}
      class="card-editorial overflow-hidden"
    >
      <section class="p-5 sm:p-7" aria-labelledby="playground-fallback-title">
        <h2
          id="playground-fallback-title"
          class="font-display text-xl font-semibold text-ink dark:text-paper-on-dark"
        >
          Crawl playground
        </h2>
        <p class="mt-2 text-sm text-ink-muted dark:text-paper-muted-dark">
          The interactive playground is loading. You can also call the crawl API
          directly:
        </p>
        <pre class="mt-4 overflow-x-auto rounded-md border border-border bg-paper p-4 font-mono text-xs text-ink dark:border-border-dark dark:bg-paper-dark dark:text-paper-on-dark">
          {`curl -X POST ${init.endpoint} \\\n+  -H "Content-Type: application/json" \\\n+  -d '{"url":"https://example.com"}'`}
        </pre>
        <noscript>
          <p class="mt-4 text-sm font-semibold text-danger dark:text-danger-dark">
            JavaScript is required for the interactive result viewer.
          </p>
        </noscript>
      </section>
    </div>
  );
}
