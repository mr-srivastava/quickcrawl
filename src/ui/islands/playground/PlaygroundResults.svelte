<script lang="ts">
  import {
    Braces,
    CheckCircle2,
    CircleAlert,
    Copy,
    Download,
    ExternalLink,
    Eye,
    FileText,
    Tags,
  } from '@lucide/svelte';
  import { onDestroy } from 'svelte';
  import * as Alert from '$playground/ui/alert/index.js';
  import { Badge } from '$playground/ui/badge/index.js';
  import { Button } from '$playground/ui/button/index.js';
  import * as Empty from '$playground/ui/empty/index.js';
  import * as Tabs from '$playground/ui/tabs/index.js';
  import * as ToggleGroup from '$playground/ui/toggle-group/index.js';
  import { CopyFeedback } from './lib/copy-feedback.svelte';
  import { downloadText } from './lib/errors';
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
  const charCount = $derived(markdown.length);
  const statistics = $derived(
    `${wordCount.toLocaleString()} ${wordCount === 1 ? 'word' : 'words'} · ` +
      `${charCount.toLocaleString()} ${charCount === 1 ? 'character' : 'characters'} · ` +
      `${metadataEntries.length} metadata ${metadataEntries.length === 1 ? 'field' : 'fields'}`,
  );
  const jsonPayload = $derived(JSON.stringify(response, null, 2));
  const downloadBaseName = $derived(
    (response.data.title ?? 'crawl-result')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'crawl-result',
  );

  let markdownMode = $state('preview');

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
    <div class="flex shrink-0 items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink data-icon="inline-start" />
        Open source
      </Button>
      <Badge variant="secondary">Markdown</Badge>
    </div>
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
      {#if metadataEntries.length > 0}
        <Tabs.Trigger value="metadata">
          <Tags data-icon="inline-start" />
          Metadata
        </Tabs.Trigger>
      {/if}
      <Tabs.Trigger value="json">
        <Braces data-icon="inline-start" />
        JSON
      </Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="markdown" class="result-panel">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup.Root
          type="single"
          variant="outline"
          size="sm"
          bind:value={markdownMode}
          aria-label="Markdown view"
        >
          <ToggleGroup.Item value="preview">
            <Eye data-icon="inline-start" />
            Preview
          </ToggleGroup.Item>
          <ToggleGroup.Item value="raw">
            <FileText data-icon="inline-start" />
            Raw
          </ToggleGroup.Item>
        </ToggleGroup.Root>
        <div class="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onclick={() => downloadText(`${downloadBaseName}.md`, markdown)}
          >
            <Download data-icon="inline-start" />
            Download
          </Button>
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
      </div>

      {#if markdownMode === 'preview'}
        {#if markdown.trim() === ''}
          <Empty.Root class="min-h-40 border border-dashed border-border bg-surface-sunken">
            <Empty.Header>
              <Empty.Title>No extractable content</Empty.Title>
              <Empty.Description>
                The page did not yield Markdown output. Try the Raw view or JSON tab for details.
              </Empty.Description>
            </Empty.Header>
          </Empty.Root>
        {:else}
          <div class="document-sheet">
            <div class="markdown-preview">{@html sanitizedPreviewHtml}</div>
          </div>
        {/if}
      {:else if markdown.trim() === ''}
        <Empty.Root class="min-h-40 border border-dashed border-border bg-surface-sunken">
          <Empty.Header>
            <Empty.Title>Empty Markdown</Empty.Title>
            <Empty.Description>
              The crawler returned an empty Markdown string for this page.
            </Empty.Description>
          </Empty.Header>
        </Empty.Root>
      {:else}
        <pre class="code-block">{markdown}</pre>
      {/if}
    </Tabs.Content>

    {#if metadataEntries.length > 0}
      <Tabs.Content value="metadata" class="result-panel">
        <div class="mb-3 flex items-center justify-between gap-3">
          <span class="font-mono text-xs text-muted-foreground">
            {metadataEntries.length} extracted {metadataEntries.length === 1
              ? 'field'
              : 'fields'}
          </span>
        </div>
        <dl class="m-0 grid gap-2 rounded-lg border border-border bg-surface-sunken p-4 sm:grid-cols-[12rem_1fr]">
          {#each metadataEntries as [key, value] (key)}
            <dt class="font-mono text-xs font-medium text-foreground">{key}</dt>
            <dd class="m-0 font-mono text-xs break-words text-muted-foreground">
              {value}
            </dd>
          {/each}
        </dl>
      </Tabs.Content>
    {/if}

    <Tabs.Content value="json" class="result-panel">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span class="font-mono text-xs text-muted-foreground">API response</span>
        <div class="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onclick={() => downloadText(`${downloadBaseName}.json`, jsonPayload)}
          >
            <Download data-icon="inline-start" />
            Download
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-live="polite"
            onclick={() => clipboard.copy('json', jsonPayload)}
          >
            <Copy data-icon="inline-start" />
            {clipboard.copiedTarget === 'json' ? 'Copied' : 'Copy JSON'}
          </Button>
        </div>
      </div>
      <pre class="code-block">{jsonPayload}</pre>
    </Tabs.Content>
  </Tabs.Root>
</section>
