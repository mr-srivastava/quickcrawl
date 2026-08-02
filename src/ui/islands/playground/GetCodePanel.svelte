<script lang="ts">
  import { Braces, Copy, Terminal } from '@lucide/svelte';
  import { onDestroy } from 'svelte';
  import { Button, buttonVariants } from '$playground/ui/button/index.js';
  import * as Collapsible from '$playground/ui/collapsible/index.js';
  import { Separator } from '$playground/ui/separator/index.js';
  import { CopyFeedback } from './lib/copy-feedback.svelte';

  let {
    baseUrl,
    endpoint,
    url,
  }: {
    baseUrl: string;
    endpoint: string;
    url: string;
  } = $props();

  const clipboard = new CopyFeedback();
  const targetUrl = $derived(url.trim() === '' ? 'https://example.com' : url.trim());
  const crawlUrl = $derived(`${baseUrl.replace(/\/$/, '')}${endpoint}`);

  const curlSnippet = $derived(
    `curl -X POST ${crawlUrl} \\\n` +
      `  -H 'Content-Type: application/json' \\\n` +
      `  -d '{"url":"${targetUrl}"}'`,
  );

  const fetchSnippet = $derived(
    `const response = await fetch('${crawlUrl}', {\n` +
      `  method: 'POST',\n` +
      `  headers: { 'Content-Type': 'application/json' },\n` +
      `  body: JSON.stringify({ url: '${targetUrl}' }),\n` +
      `});\n` +
      `const data = await response.json();`,
  );

  let curlOpen = $state(true);
  let fetchOpen = $state(true);

  onDestroy(() => clipboard.destroy());
</script>

<section class="px-5 py-4 sm:px-7" aria-label="API code snippets">
  <Separator class="mb-4" />
  <div class="grid gap-4 lg:grid-cols-2">
    <Collapsible.Root
      bind:open={curlOpen}
      class="overflow-hidden rounded-lg border border-border"
    >
      <div class="flex items-center justify-between gap-3 px-3 py-2">
        <Collapsible.Trigger
          class={buttonVariants({
            variant: 'ghost',
            size: 'sm',
            class: 'font-mono text-xs text-muted-foreground',
          })}
        >
          <Terminal data-icon="inline-start" />
          curl
        </Collapsible.Trigger>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-live="polite"
          onclick={(event) => {
            event.stopPropagation();
            clipboard.copy('curl', curlSnippet);
          }}
        >
          <Copy data-icon="inline-start" />
          {clipboard.copiedTarget === 'curl' ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <Collapsible.Content class="border-t border-border px-3 py-3">
        <pre class="code-block">{curlSnippet}</pre>
      </Collapsible.Content>
    </Collapsible.Root>

    <Collapsible.Root
      bind:open={fetchOpen}
      class="overflow-hidden rounded-lg border border-border"
    >
      <div class="flex items-center justify-between gap-3 px-3 py-2">
        <Collapsible.Trigger
          class={buttonVariants({
            variant: 'ghost',
            size: 'sm',
            class: 'font-mono text-xs text-muted-foreground',
          })}
        >
          <Braces data-icon="inline-start" />
          fetch
        </Collapsible.Trigger>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-live="polite"
          onclick={(event) => {
            event.stopPropagation();
            clipboard.copy('fetch', fetchSnippet);
          }}
        >
          <Copy data-icon="inline-start" />
          {clipboard.copiedTarget === 'fetch' ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <Collapsible.Content class="border-t border-border px-3 py-3">
        <pre class="code-block">{fetchSnippet}</pre>
      </Collapsible.Content>
    </Collapsible.Root>
  </div>
</section>
