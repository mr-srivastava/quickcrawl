<script lang="ts">
  import { ArrowRight, Code2, LoaderCircle, X } from '@lucide/svelte';
  import { Button } from '$playground/ui/button/index.js';
  import GetCodePanel from './GetCodePanel.svelte';

  let {
    exampleUrls,
    recentUrls = [],
    isLoading,
    baseUrl,
    endpoint,
    initialUrl = '',
    onSubmit,
    onCancel,
    onSelectUrl,
  }: {
    exampleUrls: string[];
    recentUrls?: string[];
    isLoading: boolean;
    baseUrl: string;
    endpoint: string;
    initialUrl?: string;
    onSubmit: (url: string) => Promise<void>;
    onCancel?: () => void;
    onSelectUrl?: (url: string) => void;
  } = $props();

  let url = $state('');
  let showCode = $state(false);

  // Seed once from the prop (full page loads pass URL on first render).
  $effect.pre(() => {
    if (url === '' && initialUrl !== '') {
      url = initialUrl;
    }
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const targetUrl = url.trim();
    if (targetUrl === '' || isLoading) return;
    await onSubmit(targetUrl);
  }

  function selectUrl(next: string) {
    url = next;
    onSelectUrl?.(next);
  }
</script>

<div class="surface-raised overflow-hidden">
  <form
    id="playground-form"
    class="p-5 sm:p-6"
    onsubmit={handleSubmit}
  >
    <label class="sr-only" for="url-input">Page URL</label>
    <p id="url-hint" class="sr-only">
      Public HTTP and HTTPS pages only. Private network addresses are blocked.
    </p>

    <div class="url-control">
      <input
        id="url-input"
        name="url"
        type="url"
        placeholder="https://example.com"
        required
        autocomplete="url"
        aria-describedby="url-hint"
        disabled={isLoading}
        bind:value={url}
        class="input-field"
      />
      <button
        type="submit"
        disabled={isLoading}
        class="btn-primary sm:min-w-40"
      >
        {#if isLoading}
          <LoaderCircle class="size-4 animate-spin" />
          Extracting…
        {:else}
          <ArrowRight class="size-4" />
          Start crawling
        {/if}
      </button>
      {#if isLoading && onCancel}
        <Button
          type="button"
          variant="outline"
          class="h-12 sm:min-w-24"
          onclick={onCancel}
        >
          <X data-icon="inline-start" />
          Stop
        </Button>
      {/if}
    </div>

    <div
      class="mt-4 flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Playground actions"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={showCode}
        onclick={() => {
          showCode = !showCode;
        }}
      >
        <Code2 data-icon="inline-start" />
        Get code
      </Button>

      <span class="mx-1 hidden h-4 w-px bg-border sm:inline-block" aria-hidden="true"></span>

      <span class="font-mono text-[0.68rem] tracking-wide text-muted-foreground uppercase">
        Examples
      </span>
      {#each exampleUrls as exampleUrl (exampleUrl)}
        <button
          type="button"
          class="rounded-full bg-surface-sunken px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          onclick={() => selectUrl(exampleUrl)}
        >
          {exampleUrl.replace(/^https?:\/\//, '')}
        </button>
      {/each}
    </div>

    {#if recentUrls.length > 0}
      <div
        class="mt-3 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Recent URLs"
      >
        <span class="font-mono text-[0.68rem] tracking-wide text-muted-foreground uppercase">
          Recent
        </span>
        {#each recentUrls as recentUrl (recentUrl)}
          <button
            type="button"
            class="rounded-full border border-border bg-surface-raised px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            onclick={() => selectUrl(recentUrl)}
          >
            {recentUrl.replace(/^https?:\/\//, '')}
          </button>
        {/each}
      </div>
    {/if}
  </form>

  {#if showCode}
    <GetCodePanel {baseUrl} {endpoint} {url} />
  {/if}
</div>
