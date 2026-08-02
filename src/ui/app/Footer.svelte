<script lang="ts">
  import { BookOpen, ExternalLink } from '@lucide/svelte';
  import { MAINTAINER_NAME, MAINTAINER_URL } from '../constants';
  import { Button } from '$playground/ui/button/index.js';

  let { appName }: { appName: string } = $props();

  const year = new Date().getFullYear();
</script>

<footer class="border-t border-border bg-surface-raised/80">
  <div class="mx-auto max-w-6xl px-5 py-8 sm:px-7">
    <div
      class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <p class="m-0 font-display text-base font-semibold text-ink">
          {appName}
        </p>
        <p class="m-0 mt-1.5 text-sm leading-relaxed text-ink-muted">
          Maintained by
          <a
            href={MAINTAINER_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="link-accent inline-flex items-center gap-1 font-medium"
          >
            {MAINTAINER_NAME}
            <ExternalLink class="size-3.5" aria-hidden="true" />
            <span class="sr-only">(opens in a new tab)</span>
          </a>
        </p>
      </div>

      <div class="max-w-md text-sm leading-relaxed text-ink-muted">
        <p class="m-0">
          Rate limited to protect the service.
          <Button href="/docs" variant="link" class="h-auto p-0 text-accent">
            <BookOpen data-icon="inline-start" />
            API docs
          </Button>
          for limits and configuration.
        </p>
        <p class="m-0 mt-2">
          Projects, writing, and related links at
          <a
            href={MAINTAINER_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="link-accent inline-flex items-center gap-1 font-medium"
          >
            aadarsh.online
            <ExternalLink class="size-3.5" aria-hidden="true" />
            <span class="sr-only">(opens in a new tab)</span>
          </a>
        </p>
      </div>
    </div>

    <div
      class="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6 text-xs text-ink-faint"
    >
      <span>&copy; {year} {appName}</span>
      <span>Turn any URL into clean Markdown</span>
    </div>
  </div>
</footer>
