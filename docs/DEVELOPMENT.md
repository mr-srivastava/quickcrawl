# Development guide

This guide explains how to set up QuickCrawl locally, run the development
tooling, test changes, debug the server, and verify a production build. Read
the [architecture guide](ARCHITECTURE.md) for implementation design and
extension patterns, and read the [contributing guide](../CONTRIBUTING.md) for
code and pull request conventions.

## Prerequisites

Install the supported runtime and package manager before you clone the
repository:

- Node.js 24 or later
- pnpm 10 or later
- Git

The versions declared in `package.json` are authoritative.

## Set up the repository

Follow these steps to create a local development environment:

1. Clone the repository and enter it.

   ```bash
   git clone <repository-url>
   cd quickcrawl
   ```

2. Install the locked dependencies.

   ```bash
   pnpm install
   ```

3. Create your local environment file.

   ```bash
   cp .env.example .env
   ```

4. Start the development server.

   ```bash
   pnpm run dev
   ```

The application starts at `http://localhost:3000` by default. The development
command compiles Tailwind CSS, watches the stylesheet, and reloads the Node.js
server when source files change.

## Configure the application

Copy `.env.example` and change only the values you need. `src/config.ts`
validates numeric and proxy-related runtime settings.

| Variable                  |       Default | Purpose                                                                         |
| ------------------------- | ------------: | ------------------------------------------------------------------------------- |
| `NODE_ENV`                | `development` | Selects the runtime environment.                                                |
| `LOG_LEVEL`               |        `info` | Sets the Pino log level.                                                        |
| `PORT`                    |        `3000` | Sets the local HTTP port.                                                       |
| `RATE_LIMIT_MAX_REQUESTS` |          `10` | Sets the request ceiling for each rate-limit window.                            |
| `RATE_LIMIT_WINDOW_MS`    |       `60000` | Sets the rate-limit window in milliseconds.                                     |
| `TRUST_PROXY`             |       `false` | Trusts proxy-provided client addresses when the upstream proxy overwrites them. |
| `CACHE_TTL_MS`            |      `300000` | Sets cache lifetime in milliseconds.                                            |
| `CACHE_MAX_SIZE`          |         `100` | Sets the maximum number of cached crawl results.                                |

Don't commit `.env` or production credentials. When you add a variable, update
`.env.example`, `src/config.ts`, and the user-facing configuration reference.

## Use development commands

Run scripts through pnpm so local and hosted builds use the same toolchain.

| Command                      | Purpose                                                   |
| ---------------------------- | --------------------------------------------------------- |
| `pnpm run dev`               | Runs the server, Svelte, and Tailwind watchers.           |
| `pnpm run dev:client`        | Watches and rebuilds the Svelte playground.               |
| `pnpm run dev:css`           | Watches and recompiles Tailwind CSS.                      |
| `pnpm run build:assets`      | Generates the browser JavaScript and stylesheet.          |
| `pnpm run build:client`      | Generates the Svelte playground browser bundle.           |
| `pnpm run build:css`         | Generates minified `public/styles.css`.                   |
| `pnpm run format`            | Formats supported repository files with Oxfmt.            |
| `pnpm run format:check`      | Checks formatting without changing files.                 |
| `pnpm run lint`              | Runs Oxlint, including type-aware TypeScript rules.       |
| `pnpm run lint:fix`          | Applies Oxlint's safe automatic fixes.                    |
| `pnpm run typecheck`         | Runs TypeScript without emitting files.                   |
| `pnpm test`                  | Runs the Vitest suite once.                               |
| `pnpm run test:watch`        | Runs Vitest in watch mode.                                |
| `pnpm run build`             | Generates CSS and bundles the server with Rolldown.       |
| `pnpm run check:client-size` | Enforces the initial playground's 15 KiB gzip limit.      |
| `pnpm run check`             | Runs all checks, the build, and the client bundle budget. |
| `pnpm start`                 | Runs `dist/server.js`.                                    |
| `pnpm run dev:vercel`        | Runs the application through Vercel CLI.                  |

`public/styles.css` and `public/assets/` are generated output. Change
`src/ui/styles/input.css`, the Hono JSX pages, or the Svelte playground source,
then run `pnpm run build:assets`. Don't edit generated browser assets manually.

The shadcn-svelte CLI writes component source into
`src/ui/islands/playground/ui`. Review and commit that source like application
code. Add a component with `pnpm dlx shadcn-svelte@latest add <component>` and
keep its imports inside the Svelte island.

## Test changes

Tests are colocated with the implementation as `*.test.ts` and `*.test.tsx`.
Run the smallest relevant test while you iterate, then run the complete checks
before you finish.

```bash
pnpm exec vitest run src/workflows/crawl/urlSafety.test.ts
pnpm run check
```

Write deterministic tests that don't require live public websites. Inject or
mock network and DNS behavior when you test crawling. Cover success, expected
errors, validation boundaries, and cancellation or timeout behavior when it is
relevant.

Oxlint uses `.oxlintrc.json`. Its type-aware rules use the TypeScript 7 compiler
through `oxlint-tsgolint`. Oxfmt uses `.oxfmtrc.json`, skips generated output,
and sorts Tailwind CSS v4 classes using `src/ui/styles/input.css`.

The [contributing guide](../CONTRIBUTING.md#testing-guidelines) defines the
repository's test expectations. The [architecture guide](ARCHITECTURE.md)
describes the boundaries to test when you change the crawl workflow.

## Debug the server

Set `LOG_LEVEL=debug` in `.env`, restart the development server, and reproduce
the request. QuickCrawl uses structured Pino logs, so filter by fields such as
the request ID, URL, workflow stage, or module name.

Use the health route to confirm that the HTTP server is running:

```bash
curl http://localhost:3000/health
```

Use a local crawl request to exercise the complete API path:

```bash
curl --request POST http://localhost:3000/crawl \
  --header 'Content-Type: application/json' \
  --data '{"url":"https://example.com"}'
```

If port `3000` is occupied, set another positive integer in `.env`:

```env
PORT=3001
```

Don't terminate unrelated processes to free the default port.

## Verify a production build

Build and run the bundled server when a change can affect compilation,
packaging, generated CSS, or runtime startup:

```bash
pnpm run build
pnpm start
```

The build writes runtime output to `dist/`. Vercel runs from the TypeScript
source and builds the Svelte and Tailwind assets through the command declared
in `vercel.json`.

## Extend the implementation

Keep design instructions with the architecture they modify:

- Use [crawl workflow](ARCHITECTURE.md#crawl-workflow) to understand the
  typed crawl stages.
- Use [extension points](ARCHITECTURE.md#extension-points) before adding a task,
  workflow, service, or route.
- Use [architectural decisions](DECISIONS.md) to understand existing technology
  and pattern choices.
- Use the [API reference](API.md) when a change affects the public HTTP
  contract.

## Next steps

Before you submit a change, follow the
[contributing guide](../CONTRIBUTING.md) and update the canonical documentation
identified in the [documentation map](INDEX.md).
