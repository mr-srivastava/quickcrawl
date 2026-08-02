<script lang="ts">
  import { ArrowRight, Link2, LoaderCircle } from '@lucide/svelte';
  import { Button } from '$playground/ui/button/index.js';
  import * as Field from '$playground/ui/field/index.js';
  import { Input } from '$playground/ui/input/index.js';

  let {
    exampleUrls,
    isLoading,
    onSubmit,
  }: {
    exampleUrls: string[];
    isLoading: boolean;
    onSubmit: (url: string) => Promise<void>;
  } = $props();

  let url = $state('');

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const targetUrl = url.trim();
    if (targetUrl === '' || isLoading) return;
    await onSubmit(targetUrl);
  }
</script>

<form id="playground-form" class="p-5 sm:p-7" onsubmit={handleSubmit}>
  <Field.Group>
    <Field.Field>
      <div class="flex items-end justify-between gap-4">
        <Field.Label for="url-input">
          <Link2 data-icon="inline-start" />
          Page URL
        </Field.Label>
        <span
          class="hidden font-mono text-xs text-muted-foreground sm:block"
        >
          POST /crawl
        </span>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <Input
          id="url-input"
          name="url"
          type="url"
          placeholder="https://example.com"
          required
          autocomplete="url"
          aria-describedby="url-hint"
          disabled={isLoading}
          bind:value={url}
          class="h-11 flex-1"
        />
        <Button type="submit" disabled={isLoading} class="h-11 sm:px-5">
          {#if isLoading}
            <LoaderCircle data-icon="inline-start" class="animate-spin" />
            Extracting…
          {:else}
            <ArrowRight data-icon="inline-start" />
            Crawl page
          {/if}
        </Button>
      </div>
      <Field.Description id="url-hint">
        Public HTTP and HTTPS pages only. Private network addresses are blocked.
      </Field.Description>
    </Field.Field>

    <Field.Field>
      <Field.Title>
        <Link2 data-icon="inline-start" />
        Examples
      </Field.Title>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Example URLs">
        {#each exampleUrls as exampleUrl (exampleUrl)}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onclick={() => {
              url = exampleUrl;
            }}
          >
            {exampleUrl.replace('https://', '')}
          </Button>
        {/each}
      </div>
    </Field.Field>
  </Field.Group>
</form>
