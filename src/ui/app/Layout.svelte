<script lang="ts">
  import { BookOpen, Home, Sparkles } from '@lucide/svelte';
  import type { PageInit } from '$contracts/page';
  import { Button } from '$playground/ui/button/index.js';
  import Logo from './Logo.svelte';

  let {
    init,
    children,
  }: {
    init: PageInit;
    children: import('svelte').Snippet;
  } = $props();

  const activeNav = $derived(
    init.page === 'home'
      ? 'home'
      : init.page === 'playground'
        ? 'playground'
        : 'docs',
  );
</script>

<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper-elevated"
>
  Skip to main content
</a>
<header
  class="sticky top-0 z-20 border-b border-border bg-surface-raised shadow-[0_1px_2px_rgb(16_25_35/0.04)]"
>
  <div
    class="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-7"
  >
    <a href="/" class="group flex items-center gap-2.5 no-underline">
      <Logo class="transition-transform duration-300 group-hover:scale-105" />
      <span
        class="font-display text-xl font-semibold tracking-tight text-ink"
      >
        {init.appName}
      </span>
    </a>
    <nav class="flex gap-1" aria-label="Main">
      <Button
        href="/"
        variant={activeNav === 'home' ? 'secondary' : 'ghost'}
        size="sm"
        aria-current={activeNav === 'home' ? 'page' : undefined}
      >
        <Home data-icon="inline-start" />
        Home
      </Button>
      <Button
        href="/playground"
        variant={activeNav === 'playground' ? 'secondary' : 'ghost'}
        size="sm"
        aria-current={activeNav === 'playground' ? 'page' : undefined}
      >
        <Sparkles data-icon="inline-start" />
        Playground
      </Button>
      <Button
        href="/docs"
        variant={activeNav === 'docs' ? 'secondary' : 'ghost'}
        size="sm"
        aria-current={activeNav === 'docs' ? 'page' : undefined}
      >
        <BookOpen data-icon="inline-start" />
        API
      </Button>
    </nav>
  </div>
</header>
<main
  id="main-content"
  class="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-7 sm:py-12"
>
  {@render children()}
</main>
<footer
  class="border-t border-border bg-surface-raised/80 py-6"
>
  <div class="mx-auto max-w-6xl px-5 sm:px-7">
    <p
      class="m-0 flex flex-wrap items-center gap-1 font-sans text-sm text-ink-muted"
    >
      Rate limited to protect the service.
      <Button href="/docs" variant="link" class="h-auto p-0 text-accent">
        <BookOpen data-icon="inline-start" />
        API docs
      </Button>
      for limits and configuration.
    </p>
  </div>
</footer>
