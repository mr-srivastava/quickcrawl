<script lang="ts">
  import { Braces, Copy, Terminal } from '@lucide/svelte';
  import { onDestroy } from 'svelte';
  import { Button } from '$playground/ui/button/index.js';
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

  onDestroy(() => clipboard.destroy());
</script>

<section
  class="border-t border-border px-5 py-4 sm:px-7"
  aria-label="API code snippets"
>
  <div class="grid gap-4 lg:grid-cols-2">
    <div>
      <div class="mb-2 flex items-center justify-between gap-3">
        <span
          class="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
        >
          <Terminal class="size-3.5" />
          curl
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-live="polite"
          onclick={() => clipboard.copy('curl', curlSnippet)}
        >
          <Copy data-icon="inline-start" />
          {clipboard.copiedTarget === 'curl' ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre class="code-block">{curlSnippet}</pre>
    </div>
    <div>
      <div class="mb-2 flex items-center justify-between gap-3">
        <span
          class="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
        >
          <Braces class="size-3.5" />
          fetch
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-live="polite"
          onclick={() => clipboard.copy('fetch', fetchSnippet)}
        >
          <Copy data-icon="inline-start" />
          {clipboard.copiedTarget === 'fetch' ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre class="code-block">{fetchSnippet}</pre>
    </div>
  </div>
</section>
