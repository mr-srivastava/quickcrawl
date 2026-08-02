<script lang="ts">
  import {
    Activity,
    BookOpen,
    Globe,
    Settings,
    Terminal,
  } from '@lucide/svelte';
  import type { DocsPageInit } from '$contracts/page';
  import * as Card from '$playground/ui/card/index.js';

  let { init }: { init: DocsPageInit } = $props();

  const rateLimitWindowSec = $derived(init.rateLimit.windowMs / 1000);
</script>

<article class="animate-fade-up">
  <p
    class="mb-2 inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase"
  >
    <BookOpen class="size-3.5" />
    Reference
  </p>
  <h1
    class="mb-4 flex items-center gap-3 font-display text-4xl font-semibold tracking-tight text-ink dark:text-paper-on-dark"
  >
    <BookOpen class="size-8 text-accent" />
    API
  </h1>
  <p class="mb-8 max-w-2xl text-lg text-ink-muted dark:text-paper-muted-dark">
    Integrate QuickCrawl via HTTP. Try the live extractor on the
    <a href="/" class="link-accent">home page</a>.
  </p>

  <Card.Root class="mb-8 border-border bg-card shadow-sm">
    <Card.Content class="px-5 py-4 text-sm">
      <strong class="font-display text-foreground">Base URL:</strong>
      <span class="text-muted-foreground">
        Same origin (e.g.
        <code
          class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
        >
          {init.baseUrl}
        </code>
        ).
      </span>
    </Card.Content>
  </Card.Root>

  <h2
    class="mt-0 flex items-center gap-2 border-t-0 pt-0 font-display text-xl font-semibold text-ink dark:text-paper-on-dark"
  >
    <Activity class="size-5 text-accent" />
    GET /health
  </h2>
  <p class="text-sm text-muted-foreground">
    JSON health check for monitoring and deploy probes.
  </p>
  <pre
    class="my-3 overflow-x-auto rounded-md border border-border bg-muted px-4 py-4 font-mono text-xs leading-relaxed text-foreground"
  >{init.healthExample}</pre>

  <h2
    class="mt-10 flex items-center gap-2 border-t border-border pt-8 font-display text-xl font-semibold text-ink dark:border-border-dark dark:text-paper-on-dark"
  >
    <Globe class="size-5 text-accent" />
    POST /crawl
  </h2>
  <p class="text-sm text-muted-foreground">
    Fetches a URL and returns Markdown plus optional metadata.
  </p>

  <h3 class="mt-6 font-display text-base font-semibold text-foreground">
    Request
  </h3>
  <p class="text-sm text-muted-foreground">
    <strong class="text-foreground">Headers:</strong>
    <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
      Content-Type: application/json
    </code>
  </p>
  <pre
    class="my-3 overflow-x-auto rounded-md border border-border bg-muted px-4 py-4 font-mono text-xs leading-relaxed text-foreground"
  >{`{
  "url": "https://example.com"
}`}</pre>

  <h3 class="mt-6 font-display text-base font-semibold text-foreground">
    Success (200)
  </h3>
  <pre
    class="my-3 overflow-x-auto rounded-md border border-border bg-muted px-4 py-4 font-mono text-xs leading-relaxed text-foreground"
  >{`{
  "success": true,
  "data": {
    "markdown": "# Example Domain\\n\\n...",
    "title": "Example Domain",
    "metadata": { "ogTitle": "...", "ogImage": "..." }
  }
}`}</pre>

  <h3 class="mt-6 font-display text-base font-semibold text-foreground">
    Validation error (422)
  </h3>
  <pre
    class="my-3 overflow-x-auto rounded-md border border-border bg-muted px-4 py-4 font-mono text-xs leading-relaxed text-foreground"
  >{`{
  "success": false,
  "error": {
    "type": "validation_error",
    "message": "Invalid input",
    "details": [{ "path": ["url"], "message": "..." }]
  }
}`}</pre>

  <h3 class="mt-6 font-display text-base font-semibold text-foreground">
    Crawl failure (422, 500, 502, 503, or 504)
  </h3>
  <pre
    class="my-3 overflow-x-auto rounded-md border border-border bg-muted px-4 py-4 font-mono text-xs leading-relaxed text-foreground"
  >{`{
  "success": false,
  "error": { "type": "unknown", "message": "..." }
}`}</pre>

  <h3 class="mt-6 font-display text-base font-semibold text-foreground">
    Rate limit (429)
  </h3>
  <pre
    class="my-3 overflow-x-auto rounded-md border border-border bg-muted px-4 py-4 font-mono text-xs leading-relaxed text-foreground"
  >{`{
  "success": false,
  "error": { "type": "rate_limit", "message": "Rate limit exceeded" }
}`}</pre>
  <p class="text-sm text-muted-foreground">
    Default: {init.rateLimit.maxRequests} requests per {rateLimitWindowSec}s
    {init.trustProxy ? 'per proxy-provided client IP' : 'globally'}.
  </p>

  <h2
    class="mt-10 flex items-center gap-2 border-t border-border pt-8 font-display text-xl font-semibold text-ink dark:border-border-dark dark:text-paper-on-dark"
  >
    <Terminal class="size-5 text-accent" />
    Example
  </h2>
  <pre
    class="my-3 overflow-x-auto rounded-md border border-border bg-muted px-4 py-4 font-mono text-xs leading-relaxed text-foreground"
  >{`curl -X POST ${init.baseUrl}/crawl \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}</pre>

  <h2
    class="mt-10 flex items-center gap-2 border-t border-border pt-8 font-display text-xl font-semibold text-ink dark:border-border-dark dark:text-paper-on-dark"
  >
    <Settings class="size-5 text-accent" />
    Environment
  </h2>
  <table class="my-4 w-full border-collapse text-sm">
    <thead>
      <tr>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          TRUST_PROXY
        </td>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          {String(init.trustProxy)}
        </td>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          Trust a proxy that overwrites X-Forwarded-For
        </td>
      </tr>
      <tr>
        <th
          class="border border-border bg-muted px-3 py-2 text-left font-display text-sm font-medium text-foreground"
        >
          Variable
        </th>
        <th
          class="border border-border bg-muted px-3 py-2 text-left font-display text-sm font-medium text-foreground"
        >
          Default
        </th>
        <th
          class="border border-border bg-muted px-3 py-2 text-left font-display text-sm font-medium text-foreground"
        >
          Description
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          RATE_LIMIT_MAX_REQUESTS
        </td>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          {init.rateLimit.maxRequests}
        </td>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          Max requests per window
        </td>
      </tr>
      <tr>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          RATE_LIMIT_WINDOW_MS
        </td>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          {init.rateLimit.windowMs}
        </td>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          Window (ms)
        </td>
      </tr>
      <tr>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          CACHE_TTL_MS
        </td>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          {init.cacheTtlMs}
        </td>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          Cache TTL
        </td>
      </tr>
      <tr>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          CACHE_MAX_SIZE
        </td>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          {init.cacheMaxSize}
        </td>
        <td
          class="border border-border px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          Max cache entries
        </td>
      </tr>
    </tbody>
  </table>
</article>
