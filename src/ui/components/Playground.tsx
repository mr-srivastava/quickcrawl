import { EXAMPLE_URLS } from '../constants';

export function Playground() {
  return (
    <section class="card-editorial p-6 sm:p-8">
      <h2 id="playground-heading" class="sr-only">
        Crawl playground
      </h2>
      <form id="playground-form">
        <label
          class="mb-3 block font-display text-sm font-medium text-ink dark:text-paper-on-dark"
          for="url-input"
        >
          Paste a URL
        </label>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            type="url"
            id="url-input"
            name="url"
            class="input-field"
            placeholder="https://example.com"
            required
            autocomplete="url"
          />
          <button type="submit" id="crawl-btn" class="btn-primary">
            Extract
          </button>
        </div>
        <div
          class="mt-4 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Example URLs"
        >
          <span class="font-mono text-xs uppercase tracking-wider text-ink-faint dark:text-paper-muted-dark">
            Examples
          </span>
          {EXAMPLE_URLS.map((url) => (
            <button type="button" class="btn-ghost" data-example-url={url}>
              {url.replace('https://', '')}
            </button>
          ))}
        </div>
      </form>

      <div
        id="playground-loading"
        class="mt-8 border-t border-border pt-8 dark:border-border-dark"
        hidden
        aria-live="polite"
      >
        <p class="mb-4 font-mono text-sm text-accent">Extracting page content…</p>
        <div class="document-sheet space-y-3 p-8">
          <div class="skeleton-line w-3/4" />
          <div class="skeleton-line w-full" />
          <div class="skeleton-line w-full" />
          <div class="skeleton-line w-5/6" />
          <div class="skeleton-line w-2/3" />
        </div>
      </div>

      <p
        id="playground-status"
        class="mt-6 font-mono text-sm text-ink-muted dark:text-paper-muted-dark"
        hidden
        role="status"
      />

      <div
        id="playground-error"
        class="mt-6 rounded-md border border-danger/30 bg-danger-bg px-4 py-3 font-sans text-sm text-danger dark:border-danger-dark/30 dark:bg-danger-bg-dark dark:text-danger-dark"
        hidden
        role="alert"
      />

      <div id="playground-results" class="mt-8 border-t border-border pt-8 dark:border-border-dark" hidden>
        <p class="mb-5 font-display text-lg text-ink dark:text-paper-on-dark">
          <span class="text-ink-muted dark:text-paper-muted-dark">Title · </span>
          <span id="result-title" class="font-medium" />
        </p>

        <div
          class="flex flex-wrap gap-0 border-b border-border dark:border-border-dark"
          role="tablist"
          aria-label="Result views"
        >
          <button
            type="button"
            class="tab tab-active"
            data-tab="preview"
            role="tab"
            aria-selected="true"
            aria-controls="panel-preview"
          >
            Preview
          </button>
          <button
            type="button"
            class="tab"
            data-tab="markdown"
            role="tab"
            aria-selected="false"
            aria-controls="panel-markdown"
          >
            Markdown
          </button>
          <button
            type="button"
            class="tab"
            data-tab="metadata"
            role="tab"
            aria-selected="false"
            aria-controls="panel-metadata"
          >
            Metadata
          </button>
          <button
            type="button"
            class="tab"
            data-tab="json"
            role="tab"
            aria-selected="false"
            aria-controls="panel-json"
          >
            JSON
          </button>
        </div>

        <div
          id="panel-preview"
          class="tab-panel"
          data-panel="preview"
          role="tabpanel"
        >
          <div class="document-sheet">
            <div id="markdown-preview" class="markdown-preview" />
          </div>
        </div>

        <div
          id="panel-markdown"
          class="tab-panel"
          data-panel="markdown"
          role="tabpanel"
          hidden
        >
          <div class="mb-2 flex justify-end">
            <button type="button" class="btn-ghost" data-copy="markdown-raw">
              Copy markdown
            </button>
          </div>
          <pre
            id="markdown-raw"
            class="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-paper px-4 py-4 font-mono text-xs leading-relaxed text-ink dark:border-border-dark dark:bg-paper-dark dark:text-paper-on-dark"
          />
        </div>

        <div
          id="panel-metadata"
          class="tab-panel"
          data-panel="metadata"
          role="tabpanel"
          hidden
        >
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th class="w-[30%] border border-border bg-paper px-3 py-2 text-left font-display text-sm font-medium dark:border-border-dark dark:bg-paper-dark">
                  Field
                </th>
                <th class="border border-border bg-paper px-3 py-2 text-left font-display text-sm font-medium dark:border-border-dark dark:bg-paper-dark">
                  Value
                </th>
              </tr>
            </thead>
            <tbody id="metadata-body" />
          </table>
        </div>

        <div
          id="panel-json"
          class="tab-panel"
          data-panel="json"
          role="tabpanel"
          hidden
        >
          <div class="mb-2 flex justify-end">
            <button type="button" class="btn-ghost" data-copy="json-raw">
              Copy JSON
            </button>
          </div>
          <pre
            id="json-raw"
            class="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-paper px-4 py-4 font-mono text-xs leading-relaxed text-ink dark:border-border-dark dark:bg-paper-dark dark:text-paper-on-dark"
          />
        </div>
      </div>
    </section>
  );
}
