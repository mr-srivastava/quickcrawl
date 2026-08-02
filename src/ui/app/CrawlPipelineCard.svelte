<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { ShieldCheck } from '@lucide/svelte';
  import PipelineItem, {
    type PipelineItemCopy,
    type PipelineItemState,
  } from './PipelineItem.svelte';

  const STEP_DURATION_MS = 2200;
  const COMPLETE_PAUSE_MS = 2600;

  const pipelineItems = [
    {
      id: 'fetch',
      copy: {
        label: {
          waiting: 'Fetch',
          in_progress: 'Fetching',
          success: 'Fetched',
        },
        description: {
          waiting: 'Queue the target URL',
          in_progress: 'Safe public HTTP request',
          success: 'Response received',
        },
      },
    },
    {
      id: 'clean',
      copy: {
        label: {
          waiting: 'Clean',
          in_progress: 'Cleaning',
          success: 'Cleaned',
        },
        description: {
          waiting: 'Strip navigation and noise',
          in_progress: 'Removing boilerplate',
          success: 'Main content isolated',
        },
      },
    },
    {
      id: 'convert',
      copy: {
        label: {
          waiting: 'Convert',
          in_progress: 'Converting',
          success: 'Converted',
        },
        description: {
          waiting: 'Generate Markdown output',
          in_progress: 'Turning HTML into Markdown',
          success: 'Markdown ready',
        },
      },
    },
  ] as const satisfies ReadonlyArray<{
    id: string;
    copy: PipelineItemCopy;
  }>;

  /** 0–2: that step is active; 3: all steps complete */
  let phase = $state(0);
  let timer: number | undefined;

  const isRunning = $derived(phase < 3);

  function stepState(index: number): PipelineItemState {
    if (phase > index) return 'success';
    if (phase === index) return 'in_progress';
    return 'waiting';
  }

  function scheduleNextPhase() {
    const delay = phase === 3 ? COMPLETE_PAUSE_MS : STEP_DURATION_MS;
    timer = window.setTimeout(() => {
      phase = (phase + 1) % 4;
      scheduleNextPhase();
    }, delay);
  }

  onMount(() => {
    scheduleNextPhase();
  });

  onDestroy(() => {
    if (timer !== undefined) window.clearTimeout(timer);
  });
</script>

<div class="pipeline-card" aria-label="Crawl pipeline" aria-live="polite">
  <div
    class="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5"
  >
    <span
      class="font-mono text-[0.7rem] font-medium tracking-[0.14em] text-ink/70 uppercase"
    >
      Crawl pipeline
    </span>
    <span class="status-badge" class:status-badge-running={isRunning}>
      <span
        class="status-dot"
        class:status-dot-pulse={isRunning}
        class:status-dot-running={isRunning}
      ></span>
      {isRunning ? 'Running' : 'Ready'}
    </span>
  </div>
  <ol class="pipeline-list">
    {#each pipelineItems as item, index (item.id)}
      <PipelineItem
        copy={item.copy}
        state={stepState(index)}
        isLast={index === pipelineItems.length - 1}
      />
    {/each}
  </ol>
  <div
    class="flex items-center gap-2 border-t border-border bg-surface-sunken/40 px-5 py-2.5 text-xs text-ink-muted"
  >
    <ShieldCheck class="size-4 text-info" />
    Private and reserved networks stay blocked
  </div>
</div>
