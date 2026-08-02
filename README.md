# QuickCrawl

A type-safe web crawler API built with TypeScript, Hono, and Node.js. QuickCrawl
fetches public web pages, extracts metadata, and converts HTML to Markdown with
built-in caching and rate limiting.

## Features

QuickCrawl provides a focused set of crawling and conversion capabilities:

- Converts cleaned HTML to GitHub Flavored Markdown.
- Extracts standard, Open Graph, Twitter Card, and custom metadata.
- Caches successful results with configurable expiration and capacity.
- Limits crawl requests through configurable in-memory counters.
- Models workflow stages and service results with discriminated unions.
- Emits structured Pino logs with request and module context.
- Validates each target and redirect against private and reserved networks.

## Quick start

### Prerequisites

Install the supported runtime and package manager:

- [Node.js](https://nodejs.org/) v24 or higher
- [pnpm](https://pnpm.io/) v10 or higher

### Installation

Clone the repository, install the locked dependencies, and create a local
environment file:

```bash
# Clone the repository
git clone <your-repo-url>
cd quickcrawl

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
```

### Run the server

Use development mode while editing, or build and start the production bundle:

```bash
# Development mode (with auto-reload)
pnpm run dev

# Build for production (local only; Vercel deploy runs from source)
pnpm run build

# Start production server
pnpm start
```

The server starts at `http://localhost:3000`.

### Use the web UI

Open [http://localhost:3000](http://localhost:3000) in your browser for:

- Browse the marketing home page and jump into the playground.
- Use the [playground](http://localhost:3000/playground) to enter a URL and
  preview Markdown and JSON.
- Open the [browser API reference](http://localhost:3000/docs).
- Call `GET /health` to check server status.

### Build browser assets

The web UI uses a minimal Hono JSX document shell and a Svelte client application
for all visible interface. The application composes locally owned shadcn-svelte
source components. Tailwind source lives in `src/ui/styles/input.css`.

```bash
pnpm run build:assets # Build the client JavaScript and stylesheet
pnpm run build:client # Build only the client JavaScript
pnpm run build:css    # Build only the stylesheet
```

`pnpm run dev` builds both browser assets, starts their watchers, and runs the
API server.

### Deploy to Vercel

The app runs on Vercel from source using Node.js. Vercel installs dependencies
with pnpm and runs `pnpm run build:css` before deployment (see `vercel.json`).
Use [Vercel CLI](https://vercel.com/docs/cli) for local parity:

```bash
vc dev      # Local dev matching Vercel (optional; or use pnpm run dev)
vc deploy   # Deploy to Vercel
```

Vercel installs dependencies and runs `pnpm run build:assets` before serving
the application. Environment variables can be set in the Vercel project
settings.

## Call the API

### curl example

Send a JSON request to the local crawl endpoint:

```bash
curl --request POST http://localhost:3000/crawl \
  --header 'Content-Type: application/json' \
  --data '{"url":"https://example.com"}'
```

The endpoint returns a discriminated JSON result:

```json
{
  "success": true,
  "data": {
    "markdown": "# Page Title\n\nPage content...",
    "title": "Page Title",
    "metadata": {
      "description": "Page description",
      "ogTitle": "Open Graph Title",
      "ogImage": "https://example.com/image.jpg"
    }
  }
}
```

### JavaScript and TypeScript example

Use the standard Fetch API to call QuickCrawl from JavaScript or TypeScript:

```typescript
const response = await fetch('http://localhost:3000/crawl', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' }),
});

const result = await response.json();

if (result.success) {
  console.log('Markdown:', result.data.markdown);
  console.log('Title:', result.data.title);
  console.log('Metadata:', result.data.metadata);
}
```

## Documentation

Use the [documentation map](docs/INDEX.md) to find the canonical source for
each topic. The main entry points are:

- [API reference](docs/API.md) — endpoints, payloads, status codes, and client
  examples
- [Development guide](docs/DEVELOPMENT.md) — local setup, tests, debugging, and
  builds
- [Architecture](docs/ARCHITECTURE.md) — module boundaries, runtime flow, and
  extension points
- [Contributing guide](CONTRIBUTING.md) — code conventions and pull request
  workflow
- [Changelog](CHANGELOG.md) — released and unreleased changes

## Configure QuickCrawl

Use `.env.example` as the configuration template. The
[development guide](docs/DEVELOPMENT.md#configure-the-application) contains the
canonical configuration reference.

| Variable                  | Default       | Description                                                                 |
| ------------------------- | ------------- | --------------------------------------------------------------------------- |
| `NODE_ENV`                | `development` | Environment mode                                                            |
| `LOG_LEVEL`               | `info`        | Logging level (debug/info/warn/error)                                       |
| `PORT`                    | `3000`        | Server port                                                                 |
| `RATE_LIMIT_MAX_REQUESTS` | `10`          | Request ceiling per window                                                  |
| `RATE_LIMIT_WINDOW_MS`    | `60000`       | Window duration in milliseconds                                             |
| `TRUST_PROXY`             | `false`       | Trust proxy-provided client IPs when the proxy overwrites `X-Forwarded-For` |
| `CACHE_TTL_MS`            | `300000`      | Cache lifetime in milliseconds                                              |
| `CACHE_MAX_SIZE`          | `100`         | Maximum cached results                                                      |

## How it works

QuickCrawl processes each URL through an explicit, typed workflow: fetch HTML,
extract metadata, parse and clean the document, and convert it to Markdown. Read
the [architecture guide](docs/ARCHITECTURE.md) for component boundaries,
workflow stages, security constraints, and extension points.

## Contributing

Follow the [contributing guide](CONTRIBUTING.md) for contribution policy and the
[development guide](docs/DEVELOPMENT.md) for local setup and verification.

## License

MIT
