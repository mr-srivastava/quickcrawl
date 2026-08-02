# Architecture

QuickCrawl is a single Node.js application with a Hono HTTP adapter, crawl
modules, and an explicit crawl workflow. This guide explains the runtime flow,
module seams, core type contracts, security constraints, and supported
extension points.

## Runtime flow

A crawl request moves through a small set of layers. Each layer owns one kind
of behavior and exposes a narrow interface to the next layer.

```text
HTTP request
  -> Hono route and input validation
  -> rate-limit middleware
  -> CachedCrawlService
  -> CrawlService
  -> typed crawl workflow
  -> structured HTTP response
```

`src/index.ts` is the production composition root. Its `createProductionApp`
factory constructs the workflow, crawl services, cache, and rate-limit
middleware. It passes those adapters to `createApp` in `src/app.ts`, while
`src/server.ts` starts the default production application.

## Module boundaries

The source tree separates transport, orchestration, workflow processing, and
shared infrastructure.

| Location               | Responsibility                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `src/app.ts`           | Creates a Hono application from injected dependencies.                                   |
| `src/index.ts`         | Composes and exports the production application.                                         |
| `src/server.ts`        | Starts the Hono Node.js adapter for local and bundled use.                               |
| `src/routes/`          | Defines the crawl transport adapter, browser UI, health, and asset routes.               |
| `src/contracts/`       | Defines the public HTTP and playground initialization contracts shared by routes and UI. |
| `src/ui/`              | Renders Hono JSX pages and contains the client-rendered Svelte playground island.        |
| `src/services/`        | Coordinates workflows and decorates crawling with caching.                               |
| `src/workflow/`        | Defines the generic task and run-option contracts.                                       |
| `src/workflows/crawl/` | Implements crawl stages, URL safety, and workflow composition.                           |
| `src/middleware/`      | Applies HTTP concerns before route processing.                                           |
| `src/lib/`             | Provides configuration-adjacent utilities, logging, errors, caching, and rate limiting.  |

Keep HTTP concerns at the application edge. Crawl modules must not depend on
Hono contexts, and workflow tasks must not format HTTP responses.

## Crawl workflow

The workflow transforms a discriminated `CrawlContext` through explicit stage
transitions. TypeScript checks that each task receives the output type produced
by the preceding task.

```text
initial
  -> fetched
  -> metadata_extracted
  -> parsed
  -> cleaned
  -> completed
```

The stages carry these primary values:

| Stage                | Added value                 |
| -------------------- | --------------------------- |
| `initial`            | Validated input URL string  |
| `fetched`            | HTML and an optional title  |
| `metadata_extracted` | Page metadata               |
| `parsed`             | Serialized parsed document  |
| `cleaned`            | Serialized cleaned document |
| `completed`          | Markdown output             |

`createCrawlWorkflow.ts` calls the tasks in order instead of using a dynamic
pipeline. This makes incompatible transitions compile-time errors and keeps the
workflow's public surface limited to one `run` method.

### Task contract

Each task declares one input context and one output context.

```typescript
export interface Task<TInput, TOutput> {
  readonly name: string;
  run(input: TInput, signal?: AbortSignal): Promise<TOutput>;
}
```

Tasks can perform I/O or transform data, but they must preserve required context
fields and return the next stage. I/O tasks must honor the supplied
`AbortSignal`.

### Cancellation and timeouts

`CrawlService` gives the workflow a 30-second timeout. The workflow combines
that timeout with an optional caller signal and forwards the resulting signal
to every task.

The fetch task also applies a 15-second timeout to each fetch attempt and uses
up to two retries after the initial attempt. A workflow timeout becomes a
structured `timeout` error.

## Crawl modules

The crawl modules convert workflow state into the stable result consumed by the
HTTP route.

### `CrawlService`

`CrawlService` accepts a `CrawlWorkflow` adapter and returns a
`CrawlResult`. It owns workflow timeout selection, completion checks, result
projection, duration logging, and conversion of unexpected failures into
structured crawl errors. Its optional `AbortSignal` is forwarded to the
workflow so callers can cancel active work.

### `CachedCrawlService`

`CachedCrawlService` implements the same `Crawler` interface and decorates
another crawler with injected cache storage. It caches successful results by
exact URL, doesn't cache failures, and forwards caller cancellation on cache
misses. The production composition root supplies the bounded in-memory cache;
tests can supply deterministic cache adapters.

The cache has configurable time-to-live and capacity values. Its state belongs
to one Node.js process and isn't shared across instances.

## HTTP boundary

`createApp` assembles the Hono application from an injected `Crawler` and
rate-limit middleware. `createCrawlRoutes` validates crawl requests, invokes
the crawler, and maps results to HTTP responses. Response builders in
`src/lib/errors.ts` keep validation, rate-limit, crawl, and internal error
envelopes consistent.

`CrawlRequestSchema` performs structural URL validation before the workflow runs.
The fetch task performs the network-safety validation that requires DNS
resolution. `src/lib/errors.ts` maps crawl error variants to stable HTTP status
codes.

Read the [API reference](API.md) for the public request and response contract.

## URL and network safety

User-controlled crawl targets create a server-side request forgery risk. The
fetch path treats URL safety as a workflow invariant, not just an API input
check.

Before each request, `assertSafeCrawlUrl` enforces these rules:

- The URL uses HTTP or HTTPS.
- The URL contains no username or password.
- The hostname isn't localhost or a localhost subdomain.
- Every resolved address is public.
- Literal IP addresses pass the same public-address checks.

The fetch task disables automatic redirect following. It validates each
redirect destination before issuing the next request and stops after five
redirects. Changes to URL parsing, DNS handling, redirect behavior, or fetch
logic require focused security tests.

## Error model

QuickCrawl uses discriminated unions at workflow, service, and API boundaries.
Expected crawl failures use `CrawlError`, while service results use
`Result<T, E>`. A shared runtime schema validates unknown thrown values before
the service or HTTP boundary treats them as a `CrawlError`.

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };
```

Callers must narrow on `success` before reading `data` or `error`. Preserve the
specific error variant while crossing modules so the HTTP adapter can choose
the correct status code.

All layers use structured Pino logging. Add values such as URLs, request IDs,
stages, and durations as fields instead of interpolating them into messages.

## Rate limiting

The crawl route applies an in-memory windowed rate limiter before parsing the
request body. The default configuration permits 10 requests in 60 seconds.

Without trusted-proxy mode, one application instance uses a global identity.
With `TRUST_PROXY=true`, the middleware uses the first `X-Forwarded-For` value.
Only enable this setting behind an upstream proxy that sanitizes and overwrites
forwarded headers.

Like the cache, rate-limit state is local to one process. Deployments with
multiple instances don't share counters.

## UI and styles

The browser UI uses Hono JSX for the document shell and static pages. The home
page renders a stable playground host with initialization data and useful
fallback content. A Svelte 5 client island mounts into that host and owns the
form, request state, result tabs, copying, and Markdown preview. The island
validates its initialization data and every `/crawl` response at runtime.

The island composes locally owned shadcn-svelte source under
`src/ui/islands/playground/ui`. Hono JSX and Svelte components don't import one
another. They communicate through serialized plain data defined in
`src/contracts/` and the public HTTP contract, so the application doesn't
require SvelteKit or a separate frontend server.

Server routes and the browser island share Valibot schemas in
`src/contracts/`. Request validation, response parsing, and playground
initialization all use the same schemas and inferred types. Zod remains for
workflow error schemas and runtime configuration validation.

Tailwind source lives in `src/ui/styles/input.css`. Hono JSX, Svelte components,
and generated shadcn-svelte sources use the same QuickCrawl semantic color
tokens. `pnpm run build:assets` generates `public/styles.css` and the ignored
`public/assets/playground.js` browser bundle. The `/styles.css` and
`/assets/playground.js` routes disable caching during development and require
revalidation in production.

## Extension points

Extend QuickCrawl through its existing module boundaries. Avoid exposing task
internals or adding a dynamic workflow abstraction unless the type guarantees
can be preserved.

### Add a crawl stage

Add a stage through the typed workflow in this order:

1. Add the new context variant to `src/workflows/crawl/types.ts`.
2. Create a task with exact input and output `Extract` types.
3. Export the task from `src/workflows/crawl/tasks/index.ts`.
4. Compose the task explicitly in `createCrawlWorkflow.ts`.
5. Forward the workflow `AbortSignal` to cancellable work.
6. Test the transition, failure behavior, and cancellation when relevant.
7. Update this workflow description.

For example, a task between `cleaned` and a new `analyzed` stage starts with an
explicit contract:

```typescript
type Input = Extract<CrawlContext, { stage: 'cleaned' }>;
type Output = Extract<CrawlContext, { stage: 'analyzed' }>;

export const analyzeDocument: Task<Input, Output> = {
  name: 'analyze_document',
  async run(context, signal) {
    signal?.throwIfAborted();
    return {
      ...context,
      stage: 'analyzed',
      analysis: analyze(context.cleanedDocument),
    };
  },
};
```

### Add an endpoint

Keep request parsing and response formatting in a route module. Accept runtime
dependencies through the route factory, and assemble production adapters in
`createProductionApp`. Put reusable business behavior in a crawl module, and
put multistage processing behind a workflow interface. Update the
[API reference](API.md) in the same change.

### Change infrastructure behavior

Extend the existing abstractions when changing caching, rate limiting, logging,
or configuration. Add or update an architectural decision when the change
introduces a durable tradeoff or a new system-wide constraint.

## Verification

Architecture changes require focused tests and the complete repository checks:

```bash
pnpm run typecheck
pnpm test
pnpm run build
```

Use the [development guide](DEVELOPMENT.md) for local workflows and the
[contributing guide](../CONTRIBUTING.md) for submission requirements.
