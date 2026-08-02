<script lang="ts">
  import type { PlaygroundPageInit } from '$contracts/page';
  import Playground from '$playground/Playground.svelte';

  let { init }: { init: PlaygroundPageInit } = $props();

  const pipelineSteps = [
    ['01', 'Fetch', 'Safe public request'],
    ['02', 'Clean', 'Remove page noise'],
    ['03', 'Convert', 'Generate Markdown'],
  ] as const;

  // Read synchronously on first client render so Playground receives the URL
  // immediately (avoid onMount → empty initialUrl → missed / delayed auto-start).
  const initialUrl =
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('url')?.trim() ?? '')
      : '';
</script>

<div class="page-fold page-fold-balanced mx-auto w-full max-w-5xl">
  <header class="shrink-0">
    <h1
      class="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
    >
      Playground
    </h1>
    <p class="mt-2 max-w-2xl text-base text-ink-muted">
      Crawl a public URL and inspect Markdown and JSON output. API, docs, and
      playground — all in one place.
    </p>
  </header>

  <div class="flex min-h-0 flex-1 flex-col">
    <Playground
      init={init.playground}
      baseUrl={init.baseUrl}
      {initialUrl}
    />
  </div>

  <details class="pipeline-card shrink-0">
    <summary
      class="cursor-pointer list-none px-5 py-4 font-mono text-xs font-medium tracking-[0.12em] text-ink-muted uppercase [&::-webkit-details-marker]:hidden"
    >
      How it works
    </summary>
    <ol class="pipeline-list border-t border-border">
      {#each pipelineSteps as [step, label, description] (step)}
        <li class="pipeline-step">
          <span class="pipeline-number">{step}</span>
          <span class="min-w-0 flex-1">
            <strong
              class="block text-sm font-semibold text-ink"
            >
              {label}
            </strong>
            <span class="block text-sm text-ink-muted">
              {description}
            </span>
          </span>
        </li>
      {/each}
    </ol>
  </details>
</div>
