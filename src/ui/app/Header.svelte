<script lang="ts">
  import { BookOpen, Home, Sparkles } from '@lucide/svelte';
  import type { PageInit } from '$contracts/page';
  import { Button } from '$playground/ui/button/index.js';
  import Logo from './Logo.svelte';

  let {
    appName,
    page,
  }: {
    appName: string;
    page: PageInit['page'];
  } = $props();

  const activeNav = $derived(
    page === 'home' ? 'home' : page === 'playground' ? 'playground' : 'docs',
  );
</script>

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
        {appName}
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
