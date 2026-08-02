<script lang="ts">
  import {
    Braces,
    CheckCircle2,
    CircleAlert,
    Copy,
    Eye,
    FileText,
  } from '@lucide/svelte';
  import { onDestroy } from 'svelte';
  import * as Alert from '$playground/ui/alert/index.js';
  import { Badge } from '$playground/ui/badge/index.js';
  import { Button } from '$playground/ui/button/index.js';
  import * as Tabs from '$playground/ui/tabs/index.js';
  import { CopyFeedback } from './lib/copy-feedback.svelte';
  import type { CrawlSuccess } from './types';

  let {
    url,
    response,
    sanitizedPreviewHtml,
  }: {
    url: string;
    response: CrawlSuccess;
    sanitizedPreviewHtml: string;
  } = $props();

  const clipboard = new CopyFeedback();
  const metadataEntries = $derived(Object.entries(response.data.metadata ?? {}));
  const markdown = $derived(response.data.markdown);
  const wordCount = $derived(
    markdown.trim() === '' ? 0 : markdown.trim().split(/\s+/).length,
  );
  const statistics = $derived(
    `${wordCount.toLocaleString()} ${wordCount === 1 ? 'word' : 'words'} · ` +
      `${metadataEntries.length} metadata ${metadataEntries.length === 1 ? 'field' : 'fields'}`,
  );

  let markdownMode = $state<'preview' | 'raw'>('preview');

  function focusOnMount(node: HTMLElement) {
    node.focus({ preventScroll: true });
  }

  onDestroy(() => clipboard.destroy());
</script>

<section
  class="result-workspace results-reveal"
  use:focusOnMount
  tabindex="-1"
  aria-label="Crawl result"
>
  <header class="result-header">
    <div class="flex min-w-0 flex-wrap items-center gap-2">
      <span class="result-receipt">POST /crawl</span>
      <Badge variant="success">
        <CheckCircle2 data-icon="inline-start" />
        Success
      </Badge>
      <span class="text-xs text-muted-foreground" aria-label="Extraction statistics">
        {statistics}
      </span>
    </div>
  </header>

  <div class="result-title-row">
    <div class="min-w-0">
      <h3 class="m-0 truncate font-display text-xl font-semibold sm:text-2xl">
        {response.data.title ?? '(no title)'}
      </h3>
      <p class="mt-1 truncate font-mono text-xs text-muted-foreground">{url}</p>
    </div>
    <Badge variant="secondary">Markdown</Badge>
  </div>

  {#if clipboard.copyError}
    <div class="px-5 sm:px-7">
      <Alert.Root variant="destructive" role="alert">
        <CircleAlert />
        <Alert.Title>Copy failed</Alert.Title>
        <Alert.Description>
          Your browser could not access the clipboard. Select and copy the text manually.
        </Alert.Description>
      </Alert.Root>
    </div>
  {/if}

  <Tabs.Root value="markdown" class="gap-0">
    <Tabs.List variant="line" aria-label="Result views" class="result-tabs">
      <Tabs.Trigger value="markdown">
        <FileText data-icon="inline-start" />
        Markdown
      </Tabs.Trigger>
      <Tabs.Trigger value="json">
        <Braces data-icon="inline-start" />
        JSON
      </Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="markdown" class="result-panel">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex gap-1 rounded-lg border border-border bg-surface-sunken p-1">
          <Button
            type="button"
            variant={markdownMode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onclick={() => {
              markdownMode = 'preview';
            }}
          >
            <Eye data-icon="inline-start" />
            Preview
          </Button>
          <Button
            type="button"
            variant={markdownMode === 'raw' ? 'secondary' : 'ghost'}
            size="sm"
            onclick={() => {
              markdownMode = 'raw';
            }}
          >
            <FileText data-icon="inline-start" />
            Raw
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-live="polite"
          onclick={() => clipboard.copy('markdown', markdown)}
        >
          <Copy data-icon="inline-start" />
          {clipboard.copiedTarget === 'markdown' ? 'Copied' : 'Copy markdown'}
        </Button>
      </div>

      {#if markdownMode === 'preview'}
        <div class="document-sheet">
          <div class="markdown-preview">{@html sanitizedPreviewHtml}</div>
        </div>
      {:else}
        <pre class="code-block">{markdown}</pre>
      {/if}
    </Tabs.Content>

    <Tabs.Content value="json" class="result-panel">
      <div class="mb-3 flex items-center justify-between gap-3">
        <span class="font-mono text-xs text-muted-foreground">API response</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-live="polite"
          onclick={() =>
            clipboard.copy('json', JSON.stringify(response, null, 2))}
        >
          <Copy data-icon="inline-start" />
          {clipboard.copiedTarget === 'json' ? 'Copied' : 'Copy JSON'}
        </Button>
      </div>
      <pre class="code-block">{JSON.stringify(response, null, 2)}</pre>

      {#if metadataEntries.length > 0}
        <details class="mt-5 rounded-lg border border-border bg-surface-sunken">
          <summary
            class="cursor-pointer px-4 py-3 font-mono text-xs text-muted-foreground uppercase"
          >
            Metadata ({metadataEntries.length})
          </summary>
          <dl class="m-0 grid gap-2 border-t border-border px-4 py-3 sm:grid-cols-[12rem_1fr]">
            {#each metadataEntries as [key, value] (key)}
              <dt class="font-mono text-xs font-medium text-foreground">{key}</dt>
              <dd class="m-0 font-mono text-xs break-words text-muted-foreground">
                {value}
              </dd>
            {/each}
          </dl>
        </details>
      {/if}
    </Tabs.Content>
  </Tabs.Root>
</section>
