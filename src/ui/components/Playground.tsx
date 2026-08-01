import {
  ArrowRight,
  Braces,
  Copy,
  Eye,
  FileText,
  Link2,
  Loader2,
  Tags,
} from 'lucide';
import { EXAMPLE_URLS } from '../constants';
import { Icon } from './Icon';

export function Playground() {
  return (
    <section
      class="card-editorial p-5 sm:p-8"
      aria-labelledby="playground-heading"
    >
      <h2 id="playground-heading" class="sr-only">
        Crawl playground
      </h2>
      <form id="playground-form">
        <label
          class="mb-3 flex items-center gap-2 font-display text-sm font-medium text-ink dark:text-paper-on-dark"
          for="url-input"
        >
          <Icon icon={Link2} size={16} class="text-accent" />
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
            aria-describedby="url-hint"
          />
          <button type="submit" id="crawl-btn" class="btn-primary">
            <Icon icon={ArrowRight} size={18} />
            Extract
          </button>
        </div>
        <p
          id="url-hint"
          class="mt-2 text-sm text-ink-muted dark:text-paper-muted-dark"
        >
          Public HTTP and HTTPS pages only. Private network addresses are
          blocked.
        </p>
        <div
          class="mt-4 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Example URLs"
        >
          <span class="inline-flex items-center gap-1 font-mono text-xs tracking-wider text-ink-faint uppercase dark:text-paper-muted-dark">
            <Icon icon={Link2} size={12} />
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
        aria-busy="true"
      >
        <p class="mb-4 inline-flex items-center gap-2 font-mono text-sm text-accent">
          <Icon icon={Loader2} size={16} class="icon-spin" />
          Extracting page content…
        </p>
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

      <div
        id="playground-results"
        class="mt-8 border-t border-border pt-8 dark:border-border-dark"
        hidden
        tabindex={-1}
      >
        <p class="mb-5 font-display text-lg text-ink dark:text-paper-on-dark">
          <span class="text-ink-muted dark:text-paper-muted-dark">
            Title ·{' '}
          </span>
          <span id="result-title" class="font-medium" />
        </p>

        <div
          class="flex flex-wrap gap-0 border-b border-border dark:border-border-dark"
          role="tablist"
          aria-label="Result views"
        >
          <button
            id="tab-preview"
            type="button"
            class="tab tab-active"
            data-tab="preview"
            role="tab"
            aria-selected="true"
            aria-controls="panel-preview"
            tabindex={0}
          >
            <Icon icon={Eye} size={16} />
            Preview
          </button>
          <button
            id="tab-markdown"
            type="button"
            class="tab"
            data-tab="markdown"
            role="tab"
            aria-selected="false"
            aria-controls="panel-markdown"
            tabindex={-1}
          >
            <Icon icon={FileText} size={16} />
            Markdown
          </button>
          <button
            id="tab-metadata"
            type="button"
            class="tab"
            data-tab="metadata"
            role="tab"
            aria-selected="false"
            aria-controls="panel-metadata"
            tabindex={-1}
          >
            <Icon icon={Tags} size={16} />
            Metadata
          </button>
          <button
            id="tab-json"
            type="button"
            class="tab"
            data-tab="json"
            role="tab"
            aria-selected="false"
            aria-controls="panel-json"
            tabindex={-1}
          >
            <Icon icon={Braces} size={16} />
            JSON
          </button>
        </div>

        <div
          id="panel-preview"
          class="tab-panel"
          data-panel="preview"
          role="tabpanel"
          aria-labelledby="tab-preview"
          tabindex={0}
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
          aria-labelledby="tab-markdown"
          tabindex={0}
          hidden
        >
          <div class="mb-2 flex justify-end">
            <button type="button" class="btn-ghost" data-copy="markdown-raw">
              <Icon icon={Copy} size={14} />
              Copy markdown
            </button>
          </div>
          <pre
            id="markdown-raw"
            class="max-h-[420px] overflow-auto rounded-md border border-border bg-paper px-4 py-4 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-ink dark:border-border-dark dark:bg-paper-dark dark:text-paper-on-dark"
          />
        </div>

        <div
          id="panel-metadata"
          class="tab-panel"
          data-panel="metadata"
          role="tabpanel"
          aria-labelledby="tab-metadata"
          tabindex={0}
          hidden
        >
          <div
            class="overflow-x-auto"
            tabindex={0}
            role="region"
            aria-label="Extracted metadata"
          >
            <table class="w-full min-w-[32rem] border-collapse text-sm">
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
        </div>

        <div
          id="panel-json"
          class="tab-panel"
          data-panel="json"
          role="tabpanel"
          aria-labelledby="tab-json"
          tabindex={0}
          hidden
        >
          <div class="mb-2 flex justify-end">
            <button type="button" class="btn-ghost" data-copy="json-raw">
              <Icon icon={Copy} size={14} />
              Copy JSON
            </button>
          </div>
          <pre
            id="json-raw"
            class="max-h-[420px] overflow-auto rounded-md border border-border bg-paper px-4 py-4 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-ink dark:border-border-dark dark:bg-paper-dark dark:text-paper-on-dark"
          />
        </div>
      </div>
    </section>
  );
}
