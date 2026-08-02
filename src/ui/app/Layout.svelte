<script lang="ts">
  import type { PageInit } from '$contracts/page';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';

  let {
    init,
    children,
  }: {
    init: PageInit;
    children: import('svelte').Snippet;
  } = $props();
</script>

<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper-elevated"
>
  Skip to main content
</a>
<Header appName={init.appName} page={init.page} />
<main
  id="main-content"
  class="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-0 sm:px-7"
>
  {@render children()}
</main>
<Footer appName={init.appName} />
