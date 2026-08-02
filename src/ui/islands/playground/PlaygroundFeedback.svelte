<script lang="ts">
  import { AlertCircle, LoaderCircle } from '@lucide/svelte';
  import * as Alert from '$playground/ui/alert/index.js';
  import { Skeleton } from '$playground/ui/skeleton/index.js';
  import type { PlaygroundState } from './types';

  let { state }: { state: PlaygroundState } = $props();
</script>

{#if state.type === 'loading'}
  <section
    class="flex flex-col gap-4 border-t border-border p-5 sm:p-7"
    aria-live="polite"
    aria-busy="true"
    aria-label="Extracting page content"
  >
    <p class="inline-flex items-center gap-2 font-mono text-sm text-primary">
      <LoaderCircle class="size-4 animate-spin" />
      Extracting page content…
    </p>
    <div class="document-sheet flex flex-col gap-3 p-8">
      <Skeleton class="h-3 w-3/4" />
      <Skeleton class="h-3 w-full" />
      <Skeleton class="h-3 w-full" />
      <Skeleton class="h-3 w-5/6" />
      <Skeleton class="h-3 w-2/3" />
    </div>
  </section>
{:else if state.type === 'error'}
  <div class="p-5 pt-0 sm:p-7 sm:pt-0">
    <Alert.Root variant="destructive" role="alert">
      <AlertCircle />
      <Alert.Title>Crawl failed</Alert.Title>
      <Alert.Description>{state.message}</Alert.Description>
    </Alert.Root>
  </div>
{/if}
