<script lang="ts">
  import {
    ArrowDown,
    ArrowRightLeft,
    Check,
    Database,
    FileText,
    Gauge,
    ShieldCheck,
    Tags,
  } from '@lucide/svelte';
  import type { HomePageInit } from '$contracts/page';
  import Playground from '$playground/Playground.svelte';

  let { init }: { init: HomePageInit } = $props();

  const pipelineSteps = [
    ['01', 'Fetch', 'Safe public request'],
    ['02', 'Clean', 'Remove page noise'],
    ['03', 'Convert', 'Generate Markdown'],
  ] as const;

  const rateLimitWindowSec = $derived(init.rateLimit.windowMs / 1000);
</script>

<section class="hero-grid animate-fade-up" aria-labelledby="hero-title">
  <div class="py-3 lg:py-8">
    <p class="eyebrow">
      <ArrowRightLeft class="size-3.5" />
      Web to Markdown
    </p>
    <h1
      id="hero-title"
      class="max-w-3xl font-display text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-ink sm:text-6xl dark:text-paper-on-dark"
    >
      {init.tagline}
    </h1>
    <p
      class="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg dark:text-paper-muted-dark"
    >
      Point QuickCrawl at any public page. Get readable Markdown and structured
      metadata back—without the navigation, ads, or noise.
    </p>
    <a
      href="#playground"
      class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent no-underline hover:underline"
    >
      Try a URL
      <ArrowDown class="size-4" />
    </a>
  </div>

  <div class="pipeline-card" aria-label="Crawl pipeline">
    <div
      class="flex items-center justify-between border-b border-border px-5 py-4 dark:border-border-dark"
    >
      <span
        class="font-mono text-xs font-medium tracking-[0.12em] text-ink-muted uppercase dark:text-paper-muted-dark"
      >
        Crawl pipeline
      </span>
      <span class="status-badge">
        <span class="status-dot"></span>
        Ready
      </span>
    </div>
    <ol class="pipeline-list">
      {#each pipelineSteps as [step, label, description] (step)}
        <li class="pipeline-step">
          <span class="pipeline-number">{step}</span>
          <span class="min-w-0 flex-1">
            <strong
              class="block text-sm font-semibold text-ink dark:text-paper-on-dark"
            >
              {label}
            </strong>
            <span
              class="block text-sm text-ink-muted dark:text-paper-muted-dark"
            >
              {description}
            </span>
          </span>
          <Check class="size-4 text-accent" />
        </li>
      {/each}
    </ol>
    <div
      class="flex items-center gap-2 border-t border-border px-5 py-3 text-xs text-ink-muted dark:border-border-dark dark:text-paper-muted-dark"
    >
      <ShieldCheck class="size-4 text-accent" />
      Private and reserved networks stay blocked
    </div>
  </div>
</section>

<div id="playground" class="animate-fade-up-delay-1 scroll-mt-24">
  <Playground init={init.playground} />
</div>

<aside
  class="animate-fade-up-delay-3 mt-5 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4 dark:border-border-dark dark:bg-border-dark"
  aria-label="QuickCrawl capabilities"
>
  <span class="feature-pill">
    <Tags class="size-3.5" />
    Metadata extraction
  </span>
  <span class="feature-pill">
    <Database class="size-3.5" />
    LRU caching
  </span>
  <span class="feature-pill">
    <Gauge class="size-3.5" />
    {init.rateLimit.maxRequests} req / {rateLimitWindowSec}s
  </span>
  <span class="feature-pill font-mono">
    <FileText class="size-3.5" />
    POST /crawl
  </span>
</aside>
