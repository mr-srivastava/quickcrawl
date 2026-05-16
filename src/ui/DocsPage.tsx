import { Layout } from './Layout';
import {
  APP_NAME,
  APP_VERSION,
  DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_PORT,
  getRateLimitConfig,
} from '../config';

const preClass =
  'my-3 overflow-x-auto rounded-md border border-border bg-paper px-4 py-4 font-mono text-xs leading-relaxed text-ink dark:border-border-dark dark:bg-paper-dark dark:text-paper-on-dark';

const tableClass = 'my-4 w-full border-collapse text-sm';
const thClass =
  'border border-border bg-paper px-3 py-2 text-left font-display text-sm font-medium text-ink dark:border-border-dark dark:bg-paper-dark dark:text-paper-on-dark';
const tdClass =
  'border border-border px-3 py-2 font-mono text-xs text-ink-muted dark:border-border-dark dark:text-paper-muted-dark';

const healthExample = JSON.stringify(
  {
    status: 'ok',
    service: APP_NAME.toLowerCase(),
    version: APP_VERSION,
  },
  null,
  2,
);

export function DocsPage() {
  const rateLimit = getRateLimitConfig();
  const windowSec = rateLimit.windowMs / 1000;
  const baseUrl = `http://localhost:${DEFAULT_PORT}`;

  return (
    <Layout title="API" activeNav="docs">
      <article class="animate-fade-up">
        <p class="mb-2 font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Reference
        </p>
        <h1 class="mb-4 font-display text-4xl font-semibold tracking-tight text-ink dark:text-paper-on-dark">
          API
        </h1>
        <p class="mb-8 max-w-2xl text-lg text-ink-muted dark:text-paper-muted-dark">
          Integrate QuickCrawl via HTTP. Try the live extractor on the{' '}
          <a href="/" class="link-accent">
            home page
          </a>
          .
        </p>

        <div class="card-editorial mb-8 px-5 py-4 text-sm">
          <strong class="font-display text-ink dark:text-paper-on-dark">Base URL:</strong>{' '}
          <span class="text-ink-muted dark:text-paper-muted-dark">
            Same origin (e.g.{' '}
            <code class="rounded bg-paper px-1.5 py-0.5 font-mono text-xs dark:bg-paper-dark">
              {baseUrl}
            </code>
            ).
          </span>
        </div>

        <h2 class="mt-10 border-t border-border pt-8 font-display text-xl font-semibold text-ink first:mt-0 first:border-t-0 first:pt-0 dark:border-border-dark dark:text-paper-on-dark">
          GET /health
        </h2>
        <p class="text-sm text-ink-muted dark:text-paper-muted-dark">
          JSON health check for monitoring and deploy probes.
        </p>
        <pre class={preClass}>{healthExample}</pre>

        <h2 class="mt-10 border-t border-border pt-8 font-display text-xl font-semibold text-ink dark:border-border-dark dark:text-paper-on-dark">
          POST /crawl
        </h2>
        <p class="text-sm text-ink-muted dark:text-paper-muted-dark">
          Fetches a URL and returns Markdown plus optional metadata.
        </p>

        <h3 class="mt-6 font-display text-base font-semibold text-ink dark:text-paper-on-dark">
          Request
        </h3>
        <p class="text-sm text-ink-muted dark:text-paper-muted-dark">
          <strong class="text-ink dark:text-paper-on-dark">Headers:</strong>{' '}
          <code class="rounded bg-paper px-1.5 py-0.5 font-mono text-xs dark:bg-paper-dark">
            Content-Type: application/json
          </code>
        </p>
        <pre class={preClass}>{`{
  "url": "https://example.com"
}`}</pre>

        <h3 class="mt-6 font-display text-base font-semibold text-ink dark:text-paper-on-dark">
          Success (200)
        </h3>
        <pre class={preClass}>{`{
  "success": true,
  "data": {
    "markdown": "# Example Domain\\n\\n...",
    "title": "Example Domain",
    "metadata": { "ogTitle": "...", "ogImage": "..." }
  }
}`}</pre>

        <h3 class="mt-6 font-display text-base font-semibold text-ink dark:text-paper-on-dark">
          Validation error (422)
        </h3>
        <pre class={preClass}>{`{
  "error": "Invalid input",
  "issues": [{ "path": ["url"], "message": "..." }]
}`}</pre>

        <h3 class="mt-6 font-display text-base font-semibold text-ink dark:text-paper-on-dark">
          Crawl failure (500)
        </h3>
        <pre class={preClass}>{`{
  "success": false,
  "error": { "type": "unknown", "message": "..." }
}`}</pre>

        <h3 class="mt-6 font-display text-base font-semibold text-ink dark:text-paper-on-dark">
          Rate limit (429)
        </h3>
        <pre class={preClass}>{`{ "error": "Rate limit exceeded" }`}</pre>
        <p class="text-sm text-ink-muted dark:text-paper-muted-dark">
          Default: {rateLimit.maxRequests} requests per {windowSec}s per IP.
        </p>

        <h2 class="mt-10 border-t border-border pt-8 font-display text-xl font-semibold text-ink dark:border-border-dark dark:text-paper-on-dark">
          Example
        </h2>
        <pre class={preClass}>{`curl -X POST ${baseUrl}/crawl \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}</pre>

        <h2 class="mt-10 border-t border-border pt-8 font-display text-xl font-semibold text-ink dark:border-border-dark dark:text-paper-on-dark">
          Environment
        </h2>
        <table class={tableClass}>
          <thead>
            <tr>
              <th class={thClass}>Variable</th>
              <th class={thClass}>Default</th>
              <th class={thClass}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class={tdClass}>RATE_LIMIT_MAX_REQUESTS</td>
              <td class={tdClass}>{rateLimit.maxRequests}</td>
              <td class={tdClass}>Max requests per window</td>
            </tr>
            <tr>
              <td class={tdClass}>RATE_LIMIT_WINDOW_MS</td>
              <td class={tdClass}>{rateLimit.windowMs}</td>
              <td class={tdClass}>Window (ms)</td>
            </tr>
            <tr>
              <td class={tdClass}>CACHE_TTL_MS</td>
              <td class={tdClass}>{DEFAULT_CACHE_TTL_MS}</td>
              <td class={tdClass}>Cache TTL</td>
            </tr>
            <tr>
              <td class={tdClass}>CACHE_MAX_SIZE</td>
              <td class={tdClass}>{DEFAULT_CACHE_MAX_SIZE}</td>
              <td class={tdClass}>Max cache entries</td>
            </tr>
          </tbody>
        </table>
      </article>
    </Layout>
  );
}
