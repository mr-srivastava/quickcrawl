import {
  ArrowRight,
  Braces,
  CheckCircle2,
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
      class="card-editorial overflow-hidden"
      aria-labelledby="playground-heading"
    >
      <h2 id="playground-heading" class="sr-only">
        Crawl playground
      </h2>
      <div class="border-b border-border px-5 py-4 sm:px-7 dark:border-border-dark">
        <p class="m-0 font-mono text-xs font-medium tracking-[0.12em] text-ink-muted uppercase dark:text-paper-muted-dark">
          Interactive extractor
        </p>
      </div>
      <form id="playground-form" class="p-5 sm:p-7">
        <div class="mb-3 flex items-end justify-between gap-4">
          <label
            class="flex items-center gap-2 font-display text-base font-semibold text-ink dark:text-paper-on-dark"
            for="url-input"
          >
            <Icon icon={Link2} size={16} class="text-accent" />
            Page URL
          </label>
          <span class="hidden font-mono text-xs text-ink-faint sm:block dark:text-paper-muted-dark">
            POST /crawl
          </span>
        </div>
        <div class="url-control">
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
            Crawl page
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
          class="mt-5 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Example URLs"
        >
          <span class="mr-1 inline-flex items-center gap-1 font-mono text-xs tracking-wider text-ink-faint uppercase dark:text-paper-muted-dark">
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

      <div
        id="playground-error"
        class="mt-6 rounded-md border border-danger/30 bg-danger-bg px-4 py-3 font-sans text-sm text-danger dark:border-danger-dark/30 dark:bg-danger-bg-dark dark:text-danger-dark"
        hidden
        role="alert"
      />

      <div
        id="playground-results"
        class="result-workspace"
        hidden
        tabindex={-1}
      >
        <header class="result-header">
          <div class="flex min-w-0 items-start gap-3">
            <span class="result-success-icon">
              <Icon icon={CheckCircle2} size={19} />
            </span>
            <div class="min-w-0">
              <p
                id="playground-status"
                class="m-0 text-sm font-semibold text-ink dark:text-paper-on-dark"
                hidden
                role="status"
              />
              <p
                id="result-source"
                class="mt-1 truncate font-mono text-xs text-ink-muted dark:text-paper-muted-dark"
              />
            </div>
          </div>
          <span
            id="result-stats"
            class="result-receipt"
            aria-label="Extraction statistics"
          />
        </header>

        <div class="result-title-row">
          <div class="min-w-0">
            <p class="mb-1 font-mono text-[0.68rem] font-medium tracking-[0.14em] text-ink-faint uppercase dark:text-paper-muted-dark">
              Extracted document
            </p>
            <h3
              id="result-title"
              class="m-0 truncate font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl dark:text-paper-on-dark"
            />
          </div>
          <span class="result-format">Markdown</span>
        </div>

        <div class="result-tabs" role="tablist" aria-label="Result views">
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
          class="tab-panel result-panel"
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
          class="tab-panel result-panel"
          data-panel="markdown"
          role="tabpanel"
          aria-labelledby="tab-markdown"
          tabindex={0}
          hidden
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <span class="font-mono text-xs text-ink-faint dark:text-paper-muted-dark">
              Raw Markdown
            </span>
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
          class="tab-panel result-panel"
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
          class="tab-panel result-panel"
          data-panel="json"
          role="tabpanel"
          aria-labelledby="tab-json"
          tabindex={0}
          hidden
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <span class="font-mono text-xs text-ink-faint dark:text-paper-muted-dark">
              API response
            </span>
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
