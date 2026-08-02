<script lang="ts">
  import { ScanSearch } from '@lucide/svelte';
  import { cn } from '$playground/utils.js';

  let { class: className }: { class?: string } = $props();
</script>

<span
  class={cn(
    'inline-flex shrink-0 items-center justify-center rounded-lg bg-accent/10 p-1.5',
    className,
  )}
  aria-hidden="true"
>
  <ScanSearch class="size-5 text-accent" strokeWidth={2.25} />
</span>
