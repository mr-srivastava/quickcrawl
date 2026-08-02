<script lang="ts">
  import { BookOpen, Sparkles } from '@lucide/svelte';
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

  const activeNav = $derived(init.page === 'home' ? 'home' : 'docs');
</script>

<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper-elevated"
>
  Skip to main content
</a>
<header
  class="sticky top-0 z-20 border-b border-border/80 bg-paper-elevated/88 backdrop-blur-xl dark:border-border-dark/80 dark:bg-paper-dark-elevated/88"
>
  <div
    class="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-7"
  >
    <a href="/" class="group flex items-center gap-2.5 no-underline">
      <Logo class="transition-transform duration-300 group-hover:scale-105" />
      <span
        class="font-display text-xl font-semibold tracking-tight text-ink dark:text-paper-on-dark"
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
        <Sparkles data-icon="inline-start" />
        Try it
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
  class="border-t border-border/80 bg-paper-elevated/60 py-6 dark:border-border-dark/80 dark:bg-paper-dark-elevated/60"
>
  <div class="mx-auto max-w-6xl px-5 sm:px-7">
    <p
      class="m-0 flex flex-wrap items-center gap-1 font-sans text-sm text-ink-muted dark:text-paper-muted-dark"
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
