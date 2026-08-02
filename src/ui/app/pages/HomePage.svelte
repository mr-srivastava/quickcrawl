<script lang="ts">
  import {
    ArrowRight,
    ArrowRightLeft,
    Database,
    FileText,
    Gauge,
    Tags,
  } from '@lucide/svelte';
  import type { HomePageInit } from '$contracts/page';
  import { Button } from '$playground/ui/button/index.js';
  import { Input } from '$playground/ui/input/index.js';
  import CrawlPipelineCard from '../CrawlPipelineCard.svelte';

  let { init }: { init: HomePageInit } = $props();

  let heroUrl = $state('');

  const rateLimitWindowSec = $derived(init.rateLimit.windowMs / 1000);

  const rateLimitDetail = $derived(
    rateLimitWindowSec === 60
      ? `Up to ${init.rateLimit.maxRequests} crawls per minute`
      : `Up to ${init.rateLimit.maxRequests} requests per ${rateLimitWindowSec}s`,
  );

  const capabilities = $derived([
    {
      icon: Tags,
      label: 'Page metadata',
      detail: 'Title, description, and social tags',
    },
    {
      icon: Database,
      label: 'Response caching',
      detail: 'Faster results for URLs crawled recently',
    },
    {
      icon: Gauge,
      label: 'Fair rate limits',
      detail: rateLimitDetail,
    },
    {
      icon: FileText,
      label: 'Simple HTTP API',
      detail: 'POST /crawl with a page URL',
      mono: true as const,
    },
  ]);

  function playgroundHref(url?: string) {
    const trimmed = url?.trim() ?? '';
    if (trimmed === '') return '/playground';
    return `/playground?url=${encodeURIComponent(trimmed)}`;
  }

  function handleHeroSubmit(event: SubmitEvent) {
    event.preventDefault();
    window.location.assign(playgroundHref(heroUrl));
  }
</script>

<div class="page-fold page-fold-balanced">
<section class="hero-grid animate-fade-up" aria-labelledby="hero-title">
  <div>
    <p class="eyebrow">
      <ArrowRightLeft class="size-3.5" />
      Web to Markdown
    </p>
    <h1
      id="hero-title"
      class="max-w-3xl font-display text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-ink sm:text-6xl"
    >
      {init.tagline}
    </h1>
    <p
      class="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg"
    >
      Point QuickCrawl at any public page. Get readable Markdown and structured
      metadata back—without the navigation, ads, or noise.
    </p>

    <form
      class="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch"
      onsubmit={handleHeroSubmit}
    >
      <Input
        id="hero-url"
        name="url"
        type="url"
        placeholder="https://example.com"
        autocomplete="url"
        aria-label="Page URL"
        bind:value={heroUrl}
        class="h-12 flex-1 border-border bg-surface-raised font-mono shadow-sm"
      />
      <Button type="submit" class="h-12 sm:px-5">
        Try it
        <ArrowRight data-icon="inline-end" />
      </Button>
    </form>
    <p class="mt-3 text-sm text-ink-muted">
      Or open the
      <a href="/playground" class="link-accent">playground</a>
      to crawl live.
    </p>
  </div>

  <CrawlPipelineCard />
</section>

<aside
  class="animate-fade-up-delay-1 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
  aria-label="QuickCrawl capabilities"
>
  {#each capabilities as capability (capability.label)}
    <span class="feature-pill">
      <capability.icon class="mt-0.5 size-3.5 shrink-0 self-start" />
      <span class="min-w-0">
        <span class="feature-pill-label">{capability.label}</span>
        <span class="feature-pill-detail" class:font-mono={'mono' in capability && capability.mono}>
          {capability.detail}
        </span>
      </span>
    </span>
  {/each}
</aside>
</div>
