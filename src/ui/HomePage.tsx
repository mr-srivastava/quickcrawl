import {
  ArrowDown,
  ArrowRightLeft,
  Check,
  Database,
  FileText,
  Gauge,
  ShieldCheck,
  Tags,
} from 'lucide';
import { getRateLimitConfig } from '../config';
import { PLAYGROUND_SCRIPT } from './client/playgroundScript';
import { Icon } from './components/Icon';
import { Playground } from './components/Playground';
import { APP_TAGLINE } from './constants';
import { Layout } from './Layout';

const MARKED_SRI =
  'sha384-b5hg04N6F0rvyz1a/GVoPPY0JcqGTARCmEuFCqwQKX3zq7LsxhV+n+6Ykh2pQOCH';
const DOMPURIFY_SRI =
  'sha384-eEu5CTj3qGvu9PdJuS+YlkNi7d2XxQROAFYOr59zgObtlcux1ae1Il3u7jvdCSWu';

export function HomePage() {
  const rateLimit = getRateLimitConfig();

  return (
    <Layout
      title="Try it"
      activeNav="home"
      wide
      extraHead={
        <>
          <script
            src="https://cdn.jsdelivr.net/npm/marked@15.0.6/marked.min.js"
            integrity={MARKED_SRI}
            crossorigin="anonymous"
          />
          <script
            src="https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js"
            integrity={DOMPURIFY_SRI}
            crossorigin="anonymous"
          />
        </>
      }
    >
      <section class="hero-grid animate-fade-up" aria-labelledby="hero-title">
        <div class="py-3 lg:py-8">
          <p class="eyebrow">
            <Icon icon={ArrowRightLeft} size={14} />
            Web to Markdown
          </p>
          <h1
            id="hero-title"
            class="max-w-3xl font-display text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance text-ink sm:text-6xl dark:text-paper-on-dark"
          >
            {APP_TAGLINE}
          </h1>
          <p class="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg dark:text-paper-muted-dark">
            Point QuickCrawl at any public page. Get readable Markdown and
            structured metadata back—without the navigation, ads, or noise.
          </p>
          <a
            href="#playground"
            class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent no-underline hover:underline"
          >
            Try a URL
            <Icon icon={ArrowDown} size={15} />
          </a>
        </div>

        <div class="pipeline-card" aria-label="Crawl pipeline">
          <div class="flex items-center justify-between border-b border-border px-5 py-4 dark:border-border-dark">
            <span class="font-mono text-xs font-medium tracking-[0.12em] text-ink-muted uppercase dark:text-paper-muted-dark">
              Crawl pipeline
            </span>
            <span class="status-badge">
              <span class="status-dot" /> Ready
            </span>
          </div>
          <ol class="pipeline-list">
            {[
              ['01', 'Fetch', 'Safe public request'],
              ['02', 'Clean', 'Remove page noise'],
              ['03', 'Convert', 'Generate Markdown'],
            ].map(([step, label, description]) => (
              <li class="pipeline-step">
                <span class="pipeline-number">{step}</span>
                <span class="min-w-0 flex-1">
                  <strong class="block text-sm font-semibold text-ink dark:text-paper-on-dark">
                    {label}
                  </strong>
                  <span class="block text-sm text-ink-muted dark:text-paper-muted-dark">
                    {description}
                  </span>
                </span>
                <Icon icon={Check} size={15} class="text-accent" />
              </li>
            ))}
          </ol>
          <div class="flex items-center gap-2 border-t border-border px-5 py-3 text-xs text-ink-muted dark:border-border-dark dark:text-paper-muted-dark">
            <Icon icon={ShieldCheck} size={15} class="text-accent" />
            Private and reserved networks stay blocked
          </div>
        </div>
      </section>

      <div id="playground" class="animate-fade-up-delay-1 scroll-mt-24">
        <Playground />
      </div>

      <aside
        class="animate-fade-up-delay-3 mt-5 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4 dark:border-border-dark dark:bg-border-dark"
        aria-label="QuickCrawl capabilities"
      >
        <span class="feature-pill">
          <Icon icon={Tags} size={14} />
          Metadata extraction
        </span>
        <span class="feature-pill">
          <Icon icon={Database} size={14} />
          LRU caching
        </span>
        <span class="feature-pill">
          <Icon icon={Gauge} size={14} />
          {rateLimit.maxRequests} req / {rateLimit.windowMs / 1000}s
        </span>
        <span class="feature-pill font-mono">
          <Icon icon={FileText} size={14} />
          POST /crawl
        </span>
      </aside>

      <script dangerouslySetInnerHTML={{ __html: PLAYGROUND_SCRIPT }} />
    </Layout>
  );
}
