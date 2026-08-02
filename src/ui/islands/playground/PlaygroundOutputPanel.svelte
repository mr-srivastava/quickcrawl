<script lang="ts">
  import { AlertCircle } from '@lucide/svelte';
  import * as Alert from '$playground/ui/alert/index.js';
  import * as Empty from '$playground/ui/empty/index.js';
  import { Spinner } from '$playground/ui/spinner/index.js';
  import { LOADING_STAGES, type LoadingStage } from './lib/loading-stages';
  import type PlaygroundResults from './PlaygroundResults.svelte';
  import type { CrawlSuccess, PlaygroundState } from './types';

  let {
    state: panelState,
    loadingStage = 'Fetch',
    loadingStageIndex = 0,
    sanitizedPreviewHtml = '',
    ResultsComponent,
  }: {
    state: PlaygroundState;
    loadingStage?: LoadingStage;
    loadingStageIndex?: number;
    sanitizedPreviewHtml?: string;
    ResultsComponent?: typeof PlaygroundResults;
  } = $props();

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
    <Empty.Root class="min-h-48 border-0 bg-transparent">
      <Empty.Header>
        <Empty.Title>Paste a URL to crawl</Empty.Title>
        <Empty.Description>
          Results appear here as Markdown preview and JSON once extraction finishes.
        </Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {:else if panelState.type === 'loading'}
    <div
      class="flex min-h-48 flex-col items-center justify-center gap-4 px-6 py-12"
      aria-live="polite"
      aria-busy="true"
      aria-label="Extracting page content"
    >
      <Spinner class="size-8 text-info" aria-hidden="true" />
      <div class="text-center">
        <p class="m-0 text-sm font-semibold text-info-foreground">
          {loadingStage}…
        </p>
        <p class="mt-1 font-mono text-xs text-muted-foreground">
          Extracting page content
        </p>
      </div>
      <ol class="m-0 flex list-none gap-2 p-0" aria-hidden="true">
        {#each LOADING_STAGES as stage, index (stage)}
          <li
            class="rounded-full px-2.5 py-1 font-mono text-[0.68rem] uppercase transition-colors"
            class:bg-surface-raised={index === loadingStageIndex}
            class:text-foreground={index === loadingStageIndex}
            class:text-muted-foreground={index !== loadingStageIndex}
          >
            {stage}
          </li>
        {/each}
      </ol>
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
