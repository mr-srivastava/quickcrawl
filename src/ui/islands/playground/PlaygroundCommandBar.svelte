<script lang="ts">
  import { ArrowRight, Code2 } from '@lucide/svelte';
  import { Button } from '$playground/ui/button/index.js';
  import * as Field from '$playground/ui/field/index.js';
  import * as InputGroup from '$playground/ui/input-group/index.js';
  import { Separator } from '$playground/ui/separator/index.js';
  import { Spinner } from '$playground/ui/spinner/index.js';
  import { formatValidationDetails } from './lib/errors';
  import type { LoadingStage } from './lib/loading-stages';
  import type { PlaygroundError } from './types';
  import GetCodePanel from './GetCodePanel.svelte';

  let {
    exampleUrls,
    recentUrls = [],
    isLoading,
    loadingStage = 'Fetch',
    baseUrl,
    endpoint,
    initialUrl = '',
    error,
    onSubmit,
    onCancel,
  }: {
    exampleUrls: string[];
    recentUrls?: string[];
    isLoading: boolean;
    loadingStage?: LoadingStage;
    baseUrl: string;
    endpoint: string;
    initialUrl?: string;
    error?: PlaygroundError;
    onSubmit: (url: string) => Promise<void>;
    onCancel?: () => void;
  } = $props();

  let url = $state('');
  let showCode = $state(false);
  let urlInput = $state<HTMLInputElement | null>(null);

  const validationIssues = $derived(
    error?.kind === 'validation'
      ? formatValidationDetails(error.details)
      : [],
  );

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

  async function selectUrl(next: string, submitImmediately = true) {
    url = next;
    if (submitImmediately && !isLoading) {
      await onSubmit(next);
    }
  }

  function formatUrlLabel(value: string) {
    return value.replace(/^https?:\/\//, '');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isLoading) {
      event.preventDefault();
      onCancel?.();
      return;
    }

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      const form = (event.currentTarget as HTMLElement).closest('form');
      form?.requestSubmit();
    }
  }

  function focusUrlInput() {
    urlInput?.focus();
  }

  $effect(() => {
    if (error?.kind === 'validation') {
      focusUrlInput();
    }
  });
</script>

<div class="surface-raised overflow-hidden">
  <form
    id="playground-form"
    class="p-5 sm:p-6"
    onsubmit={handleSubmit}
  >
    <Field.Group>
      <Field.Field>
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Field.Label for="url-input">Page URL</Field.Label>
          <span class="font-mono text-[0.68rem] tracking-wide text-muted-foreground uppercase">
            POST {endpoint}
          </span>
        </div>
        <Field.Description id="url-hint">
          Public HTTP and HTTPS pages only. Private network addresses are blocked.
        </Field.Description>

        <InputGroup.Root
          class="mt-2 h-auto flex-col gap-2 rounded-xl border-border bg-surface-sunken focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/15 sm:flex-row sm:items-stretch sm:gap-1 sm:p-1"
        >
          <InputGroup.Input
            bind:ref={urlInput}
            id="url-input"
            name="url"
            type="url"
            placeholder="https://example.com"
            required
            autocomplete="url"
            aria-describedby="url-hint"
            aria-invalid={error?.kind === 'validation' ? true : undefined}
            disabled={isLoading}
            bind:value={url}
            class="h-12 font-mono"
            onkeydown={handleKeydown}
          />
          <InputGroup.Addon align="inline-end" class="flex w-full gap-2 p-0 sm:w-auto">
            {#if isLoading}
              <div
                class="inline-flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-lg bg-info-subtle px-4 text-sm font-medium text-info-foreground sm:w-auto sm:min-w-40"
                role="status"
                aria-live="polite"
              >
                <Spinner class="size-4 text-info" aria-hidden="true" />
                {loadingStage}…
              </div>
              {#if onCancel}
                <Button
                  type="button"
                  variant="outline"
                  class="h-12 sm:min-w-24"
                  onclick={onCancel}
                >
                  Stop
                </Button>
              {/if}
            {:else}
              <Button
                type="submit"
                class="h-12 w-full sm:min-w-40"
              >
                <ArrowRight data-icon="inline-start" />
                Start crawling
              </Button>
            {/if}
          </InputGroup.Addon>
        </InputGroup.Root>

        {#if error?.kind === 'validation'}
          <Field.Error class="mt-2">
            {error.message}
            {#if validationIssues.length > 0}
              <ul class="mt-2 list-disc space-y-1 pl-4">
                {#each validationIssues as issue (issue)}
                  <li>{issue}</li>
                {/each}
              </ul>
            {/if}
          </Field.Error>
        {/if}

        <p class="mt-2 font-mono text-[0.68rem] text-muted-foreground">
          Press <kbd class="rounded border border-border bg-surface-sunken px-1 py-0.5">⌘</kbd>+<kbd class="rounded border border-border bg-surface-sunken px-1 py-0.5">Enter</kbd> to crawl · <kbd class="rounded border border-border bg-surface-sunken px-1 py-0.5">Esc</kbd> to stop
        </p>
      </Field.Field>
    </Field.Group>

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

      <Separator
        orientation="vertical"
        class="mx-1 hidden h-4 sm:block"
      />

      <span class="font-mono text-[0.68rem] tracking-wide text-muted-foreground uppercase">
        Examples
      </span>
      {#each exampleUrls as exampleUrl (exampleUrl)}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          class="h-auto min-h-9 rounded-full px-2.5 py-1 font-mono text-xs"
          title={exampleUrl}
          disabled={isLoading}
          onclick={() => selectUrl(exampleUrl)}
        >
          {formatUrlLabel(exampleUrl)}
        </Button>
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="h-auto min-h-9 max-w-full rounded-full px-2.5 py-1 font-mono text-xs"
            title={recentUrl}
            disabled={isLoading}
            onclick={() => selectUrl(recentUrl)}
          >
            <span class="truncate">{formatUrlLabel(recentUrl)}</span>
          </Button>
        {/each}
      </div>
    {/if}
  </form>

  {#if showCode}
    <GetCodePanel {baseUrl} {endpoint} {url} />
  {/if}
</div>
