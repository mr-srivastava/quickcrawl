<script lang="ts">
  import {
    Braces,
    CheckCircle2,
    CircleAlert,
    Copy,
    Eye,
    FileText,
    Tags,
  } from '@lucide/svelte';
  import { onDestroy } from 'svelte';
  import * as Alert from '$playground/ui/alert/index.js';
  import { Badge } from '$playground/ui/badge/index.js';
  import { Button } from '$playground/ui/button/index.js';
  import * as Table from '$playground/ui/table/index.js';
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

  function focusOnMount(node: HTMLElement) {
    node.focus({ preventScroll: true });
  }

  onDestroy(() => clipboard.destroy());
</script>

<section
  class="result-workspace"
  use:focusOnMount
  tabindex="-1"
  aria-label="Crawl result"
>
  <header class="result-header">
    <div class="flex min-w-0 items-start gap-3">
      <span class="result-success-icon" aria-hidden="true">
        <CheckCircle2 class="size-5" />
      </span>
      <div class="min-w-0">
        <p class="m-0 text-sm font-semibold text-foreground" role="status">
          Extraction complete
        </p>
        <p class="mt-1 truncate font-mono text-xs text-muted-foreground">
          {url}
        </p>
      </div>
    </div>
    <Badge variant="secondary" aria-label="Extraction statistics">
      {statistics}
    </Badge>
  </header>

  <div class="result-title-row">
    <div class="min-w-0">
      <p
        class="mb-1 font-mono text-[0.68rem] font-medium tracking-[0.14em] text-muted-foreground uppercase"
      >
        Extracted document
      </p>
      <h3 class="m-0 truncate font-display text-xl font-semibold sm:text-2xl">
        {response.data.title ?? '(no title)'}
      </h3>
    </div>
    <Badge>Markdown</Badge>
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

  <Tabs.Root value="preview" class="gap-0">
    <Tabs.List variant="line" aria-label="Result views" class="result-tabs">
      <Tabs.Trigger value="preview">
        <Eye data-icon="inline-start" />
        Preview
      </Tabs.Trigger>
      <Tabs.Trigger value="markdown">
        <FileText data-icon="inline-start" />
        Markdown
      </Tabs.Trigger>
      <Tabs.Trigger value="metadata">
        <Tags data-icon="inline-start" />
        Metadata
      </Tabs.Trigger>
      <Tabs.Trigger value="json">
        <Braces data-icon="inline-start" />
        JSON
      </Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="preview" class="result-panel">
      <div class="document-sheet">
        <div class="markdown-preview">{@html sanitizedPreviewHtml}</div>
      </div>
    </Tabs.Content>

    <Tabs.Content value="markdown" class="result-panel">
      <div class="mb-3 flex items-center justify-between gap-3">
        <span class="font-mono text-xs text-muted-foreground">Raw Markdown</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-live="polite"
          onclick={() => clipboard.copy('markdown', markdown)}
        >
          <Copy data-icon="inline-start" />
          {clipboard.copiedTarget === 'markdown' ? 'Copied' : 'Copy markdown'}
        </Button>
      </div>
      <pre
        class="max-h-[420px] overflow-auto rounded-md border border-border bg-background p-4 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap"
      >{markdown}</pre>
    </Tabs.Content>

    <Tabs.Content value="metadata" class="result-panel">
      <Table.Root aria-label="Extracted metadata">
        <Table.Header>
          <Table.Row>
            <Table.Head>Field</Table.Head>
            <Table.Head>Value</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each metadataEntries as [key, value] (key)}
            <Table.Row>
              <Table.Head scope="row">{key}</Table.Head>
              <Table.Cell>{value}</Table.Cell>
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell colspan={2}>No metadata extracted</Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </Tabs.Content>

    <Tabs.Content value="json" class="result-panel">
      <div class="mb-3 flex items-center justify-between gap-3">
        <span class="font-mono text-xs text-muted-foreground">API response</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-live="polite"
          onclick={() =>
            clipboard.copy('json', JSON.stringify(response, null, 2))}
        >
          <Copy data-icon="inline-start" />
          {clipboard.copiedTarget === 'json' ? 'Copied' : 'Copy JSON'}
        </Button>
      </div>
      <pre
        class="max-h-[420px] overflow-auto rounded-md border border-border bg-background p-4 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap"
      >{JSON.stringify(response, null, 2)}</pre>
    </Tabs.Content>
  </Tabs.Root>
</section>
