<script lang="ts">
  import { onDestroy } from 'svelte';
  import * as Card from '$playground/ui/card/index.js';
  import { crawlPage } from './api';
  import PlaygroundFeedback from './PlaygroundFeedback.svelte';
  import PlaygroundForm from './PlaygroundForm.svelte';
  import type PlaygroundResults from './PlaygroundResults.svelte';
  import type { PlaygroundInit, PlaygroundState } from './types';

  let { init }: { init: PlaygroundInit } = $props();

  let state = $state<PlaygroundState>({ type: 'idle' });
  let ResultsComponent = $state<typeof PlaygroundResults>();
  let sanitizedPreviewHtml = $state('');
  let activeController: AbortController | undefined;

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

  onDestroy(() => activeController?.abort());
</script>

<Card.Root class="overflow-hidden border-border bg-card py-0 shadow-none">
  <Card.Header class="border-b border-border px-5 py-4 sm:px-7">
    <Card.Title
      class="font-mono text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase"
    >
      Interactive extractor
    </Card.Title>
    <Card.Description class="sr-only">
      Crawl a public web page and inspect its Markdown and metadata.
    </Card.Description>
  </Card.Header>
  <Card.Content class="px-0">
    <PlaygroundForm
      exampleUrls={init.exampleUrls}
      isLoading={state.type === 'loading'}
      onSubmit={submit}
    />
    <PlaygroundFeedback {state} />
    {#if state.type === 'success' && ResultsComponent}
      <ResultsComponent
        url={state.url}
        response={state.response}
        {sanitizedPreviewHtml}
      />
    {/if}
  </Card.Content>
</Card.Root>
