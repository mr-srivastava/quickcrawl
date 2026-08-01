import { ArrowRightLeft, Database, FileText, Gauge, Tags } from 'lucide';
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
      <div class="animate-fade-up mb-8 grid gap-6 border-b border-border pb-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end dark:border-border-dark">
        <div>
          <p class="mb-2 inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
            <Icon icon={ArrowRightLeft} size={14} />
            Web to Markdown
          </p>
          <h1 class="max-w-3xl font-display text-4xl leading-[1.05] font-semibold tracking-tight text-ink sm:text-5xl dark:text-paper-on-dark">
            {APP_TAGLINE}
          </h1>
        </div>
        <p class="m-0 max-w-md text-base leading-relaxed text-ink-muted dark:text-paper-muted-dark">
          Enter any public page. QuickCrawl fetches it safely, removes the
          noise, and returns clean Markdown with structured metadata.
        </p>
      </div>

      <div class="animate-fade-up-delay-1">
        <Playground />
      </div>

      <aside
        class="animate-fade-up-delay-3 mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4 dark:border-border-dark dark:bg-border-dark"
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
