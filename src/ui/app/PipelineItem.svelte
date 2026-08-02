<script lang="ts">
  import { fade } from 'svelte/transition';

  export type PipelineItemState = 'waiting' | 'in_progress' | 'success';

  export type PipelineItemCopy = {
    label: Record<PipelineItemState, string>;
    description: Record<PipelineItemState, string>;
  };

  let {
    copy,
    state,
    isLast = false,
  }: {
    copy: PipelineItemCopy;
    state: PipelineItemState;
    isLast?: boolean;
  } = $props();

  const label = $derived(copy.label[state]);
  const description = $derived(copy.description[state]);
</script>

<li
  class="pipeline-step"
  class:pipeline-step-waiting={state === 'waiting'}
  class:pipeline-step-active={state === 'in_progress'}
  class:pipeline-step-success={state === 'success'}
  aria-current={state === 'in_progress' ? 'step' : undefined}
>
  <span class="pipeline-rail" aria-hidden="true">
    <span
      class="pipeline-dot"
      class:pipeline-dot-waiting={state === 'waiting'}
      class:pipeline-dot-active={state === 'in_progress'}
      class:pipeline-dot-success={state === 'success'}
    ></span>
    {#if !isLast}
      <span class="pipeline-line"></span>
    {/if}
  </span>
  <span class="min-w-0 flex-1 pb-3">
    {#key label}
      <strong
        class="block text-sm leading-snug text-ink"
        class:font-semibold={state === 'in_progress'}
        class:font-medium={state !== 'in_progress'}
        in:fade={{ duration: 180 }}
      >
        {label}
      </strong>
    {/key}
    {#key description}
      <span
        class="pipeline-step-description mt-0.5 block text-xs leading-relaxed text-ink-muted"
        in:fade={{ duration: 180 }}
      >
        {description}
      </span>
    {/key}
  </span>
</li>
