<script lang="ts">
  import { onDestroy } from 'svelte';
  import { crawlPage } from './api';
  import { loadRecentUrls, rememberUrl } from './lib/history';
  import { LOADING_STAGES } from './lib/loading-stages';
  import PlaygroundCommandBar from './PlaygroundCommandBar.svelte';
  import PlaygroundOutputPanel from './PlaygroundOutputPanel.svelte';
  import type PlaygroundResults from './PlaygroundResults.svelte';
  import type { PlaygroundInit, PlaygroundState } from './types';

  let {
    init,
    baseUrl = '',
    initialUrl = '',
  }: {
    init: PlaygroundInit;
    baseUrl?: string;
    initialUrl?: string;
  } = $props();

  let state = $state<PlaygroundState>({ type: 'idle' });
  let ResultsComponent = $state<typeof PlaygroundResults>();
  let sanitizedPreviewHtml = $state('');
  let recentUrls = $state<string[]>(loadRecentUrls());
  let activeController: AbortController | undefined;
  let autoStarted = false;
  let loadingStageIndex = $state(0);
  let stageTimer: number | undefined;

  const loadingStage = $derived(LOADING_STAGES[loadingStageIndex]);

  $effect(() => {
    if (state.type !== 'loading') {
      if (stageTimer !== undefined) {
        window.clearInterval(stageTimer);
        stageTimer = undefined;
      }
      loadingStageIndex = 0;
      return;
    }

    loadingStageIndex = 0;
    stageTimer = window.setInterval(() => {
      loadingStageIndex = (loadingStageIndex + 1) % LOADING_STAGES.length;
    }, 900);
  });

  function cancel() {
    activeController?.abort();
    activeController = undefined;
    if (state.type === 'loading') {
      state = { type: 'idle' };
    }
  }

  async function submit(url: string) {
    if (state.type === 'loading') return;

    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    state = { type: 'loading', url };

    try {
      const response = await crawlPage(init.endpoint, url, controller.signal);
      const [{ default: resultsComponent }, { renderMarkdown }] =
        await Promise.all([
          import('./PlaygroundResults.svelte'),
          import('./markdown'),
        ]);
      if (controller.signal.aborted) return;

      ResultsComponent = resultsComponent;
      sanitizedPreviewHtml = renderMarkdown(response.data.markdown);
      recentUrls = rememberUrl(url);
      state = { type: 'success', url, response };
    } catch (error) {
      if (controller.signal.aborted) return;
      state = {
        type: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    } finally {
      if (activeController === controller) activeController = undefined;
    }
  }

  // Auto-start once when arriving from home with ?url=…
  $effect(() => {
    const url = initialUrl.trim();
    if (autoStarted || url === '') return;
    autoStarted = true;
    void submit(url);
  });

  onDestroy(() => {
    if (stageTimer !== undefined) window.clearInterval(stageTimer);
    activeController?.abort();
  });
</script>

<div class="flex flex-col gap-5">
  <PlaygroundCommandBar
    exampleUrls={init.exampleUrls}
    {recentUrls}
    isLoading={state.type === 'loading'}
    {loadingStage}
    baseUrl={baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')}
    endpoint={init.endpoint}
    {initialUrl}
    onSubmit={submit}
    onCancel={cancel}
  />
  <PlaygroundOutputPanel
    {state}
    {loadingStage}
    loadingStageIndex={loadingStageIndex}
    {sanitizedPreviewHtml}
    {ResultsComponent}
  />
</div>
