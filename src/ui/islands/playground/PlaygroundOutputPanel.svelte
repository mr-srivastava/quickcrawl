<script lang="ts">
  import { AlertCircle, LoaderCircle } from '@lucide/svelte';
  import { onDestroy } from 'svelte';
  import * as Alert from '$playground/ui/alert/index.js';
  import type PlaygroundResults from './PlaygroundResults.svelte';
  import type { CrawlSuccess, PlaygroundState } from './types';

  let {
    state: panelState,
    sanitizedPreviewHtml = '',
    ResultsComponent,
    onCancel,
  }: {
    state: PlaygroundState;
    sanitizedPreviewHtml?: string;
    ResultsComponent?: typeof PlaygroundResults;
    onCancel?: () => void;
  } = $props();

  const stages = ['Fetch', 'Clean', 'Convert'] as const;
  let stageIndex = $state(0);
  let stageTimer: number | undefined;

  $effect(() => {
    if (panelState.type !== 'loading') {
      if (stageTimer !== undefined) {
        window.clearInterval(stageTimer);
        stageTimer = undefined;
      }
      stageIndex = 0;
      return;
    }

    stageIndex = 0;
    stageTimer = window.setInterval(() => {
      stageIndex = (stageIndex + 1) % stages.length;
    }, 900);
  });

  onDestroy(() => {
    if (stageTimer !== undefined) window.clearInterval(stageTimer);
  });

  const panelClass = $derived(
    panelState.type === 'idle'
      ? 'output-panel output-panel-idle'
      : panelState.type === 'loading'
        ? 'output-panel output-panel-loading'
        : panelState.type === 'error'
          ? 'output-panel output-panel-error'
          : 'output-panel',
  );
</script>

<section class={panelClass} aria-label="Playground output">
  {#if panelState.type === 'idle'}
    <div
      class="flex min-h-48 flex-col items-center justify-center gap-2 px-6 py-12 text-center"
    >
      <p class="m-0 text-sm font-medium text-foreground">Paste a URL to crawl</p>
      <p class="m-0 max-w-sm text-sm text-muted-foreground">
        Results appear here as Markdown preview and JSON once extraction finishes.
      </p>
    </div>
  {:else if panelState.type === 'loading'}
    <div
      class="flex min-h-48 flex-col items-center justify-center gap-4 px-6 py-12"
      aria-live="polite"
      aria-busy="true"
      aria-label="Extracting page content"
    >
      <LoaderCircle class="size-8 animate-spin text-info" />
      <div class="text-center">
        <p class="m-0 text-sm font-semibold text-info-foreground">
          {stages[stageIndex]}…
        </p>
        <p class="mt-1 font-mono text-xs text-muted-foreground">
          Extracting page content
        </p>
      </div>
      <ol class="m-0 flex list-none gap-2 p-0" aria-hidden="true">
        {#each stages as stage, index (stage)}
          <li
            class="rounded-full px-2.5 py-1 font-mono text-[0.68rem] uppercase transition-colors"
            class:bg-surface-raised={index === stageIndex}
            class:text-foreground={index === stageIndex}
            class:text-muted-foreground={index !== stageIndex}
          >
            {stage}
          </li>
        {/each}
      </ol>
      {#if onCancel}
        <button type="button" class="btn-ghost" onclick={onCancel}>
          Stop
        </button>
      {/if}
    </div>
  {:else if panelState.type === 'error'}
    <div class="p-5 sm:p-7">
      <Alert.Root variant="destructive" role="alert">
        <AlertCircle />
        <Alert.Title>Crawl failed</Alert.Title>
        <Alert.Description>{panelState.message}</Alert.Description>
      </Alert.Root>
    </div>
  {:else if panelState.type === 'success' && ResultsComponent}
    <ResultsComponent
      url={panelState.url}
      response={panelState.response as CrawlSuccess}
      {sanitizedPreviewHtml}
    />
  {/if}
</section>
