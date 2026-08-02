<script lang="ts">
  import type { PageInit } from '$contracts/page';
  import Layout from './Layout.svelte';
  import DocsPage from './pages/DocsPage.svelte';
  import HomePage from './pages/HomePage.svelte';
  import PlaygroundPage from './pages/PlaygroundPage.svelte';

  let { init }: { init: PageInit } = $props();
</script>

<Layout {init}>
  {#if init.page === 'home'}
    <HomePage {init} />
  {:else if init.page === 'playground'}
    <PlaygroundPage {init} />
  {:else}
    <DocsPage {init} />
  {/if}
</Layout>
