<script lang="ts">
  import { AlertCircle, RotateCcw } from '@lucide/svelte';
  import * as Alert from '$playground/ui/alert/index.js';
  import { Button } from '$playground/ui/button/index.js';
  import * as Empty from '$playground/ui/empty/index.js';
  import { Spinner } from '$playground/ui/spinner/index.js';
  import {
    formatValidationDetails,
    playgroundErrorTitle,
  } from './lib/errors';
  import { LOADING_STAGES, type LoadingStage } from './lib/loading-stages';
  import type PlaygroundResults from './PlaygroundResults.svelte';
  import type { CrawlSuccess, PlaygroundState } from './types';

  let {
    state: panelState,
    loadingStage = 'Fetch',
    loadingStageIndex = 0,
    sanitizedPreviewHtml = '',
    ResultsComponent,
    onRetry,
  }: {
    state: PlaygroundState;
    loadingStage?: LoadingStage;
    loadingStageIndex?: number;
    sanitizedPreviewHtml?: string;
    ResultsComponent?: typeof PlaygroundResults;
    onRetry?: () => void;
  } = $props();

  let rateLimitRemaining = $state(0);
  let rateLimitTimer: number | undefined;

  const panelClass = $derived(
    panelState.type === 'idle'
      ? 'output-panel output-panel-idle'
      : panelState.type === 'loading'
        ? 'output-panel output-panel-loading'
        : panelState.type === 'error' || panelState.type === 'cancelled'
          ? 'output-panel output-panel-error'
          : 'output-panel',
  );

  const validationIssues = $derived(
    panelState.type === 'error' && panelState.error.kind === 'validation'
      ? formatValidationDetails(panelState.error.details)
      : [],
  );

  $effect(() => {
    if (rateLimitTimer !== undefined) {
      window.clearInterval(rateLimitTimer);
      rateLimitTimer = undefined;
    }

    if (
      panelState.type !== 'error' ||
      panelState.error.kind !== 'rate_limit'
    ) {
      rateLimitRemaining = 0;
      return;
    }

    rateLimitRemaining = panelState.error.retryAfterSeconds;
    rateLimitTimer = window.setInterval(() => {
      rateLimitRemaining = Math.max(0, rateLimitRemaining - 1);
      if (rateLimitRemaining === 0 && rateLimitTimer !== undefined) {
        window.clearInterval(rateLimitTimer);
        rateLimitTimer = undefined;
      }
    }, 1000);
  });

  function focusOnMount(node: HTMLElement) {
    if (panelState.type === 'error' || panelState.type === 'cancelled') {
      node.focus({ preventScroll: true });
    }
  }
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
            class:bg-surface-raised={index <= loadingStageIndex}
            class:text-foreground={index <= loadingStageIndex}
            class:text-muted-foreground={index > loadingStageIndex}
          >
            {stage}
          </li>
        {/each}
      </ol>
    </div>
  {:else if panelState.type === 'cancelled'}
    <div
      class="p-5 sm:p-7"
      use:focusOnMount
      tabindex="-1"
      aria-live="polite"
    >
      <Alert.Root role="status">
        <AlertCircle />
        <Alert.Title>Crawl cancelled</Alert.Title>
        <Alert.Description>
          The request was stopped. Edit the URL above or try again.
        </Alert.Description>
        {#if onRetry}
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" onclick={onRetry}>
              <RotateCcw data-icon="inline-start" />
              Try again
            </Button>
          </Alert.Action>
        {/if}
      </Alert.Root>
    </div>
  {:else if panelState.type === 'error'}
    <div
      class="p-5 sm:p-7"
      use:focusOnMount
      tabindex="-1"
      aria-live="assertive"
    >
      <Alert.Root variant="destructive" role="alert">
        <AlertCircle />
        <Alert.Title>{playgroundErrorTitle(panelState.error)}</Alert.Title>
        <Alert.Description>
          {panelState.error.message}
          {#if validationIssues.length > 0}
            <ul class="mt-2 list-disc space-y-1 pl-4">
              {#each validationIssues as issue (issue)}
                <li>{issue}</li>
              {/each}
            </ul>
          {/if}
          {#if panelState.error.kind === 'rate_limit'}
            <p class="mt-2 font-mono text-xs">
              {#if rateLimitRemaining > 0}
                Retry available in {rateLimitRemaining}s
              {:else}
                You can try again now.
              {/if}
            </p>
          {/if}
        </Alert.Description>
        {#if onRetry}
          <Alert.Action>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={panelState.error.kind === 'rate_limit' &&
                rateLimitRemaining > 0}
              onclick={onRetry}
            >
              <RotateCcw data-icon="inline-start" />
              {panelState.error.kind === 'rate_limit' && rateLimitRemaining > 0
                ? `Retry in ${rateLimitRemaining}s`
                : 'Try again'}
            </Button>
          </Alert.Action>
        {/if}
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
