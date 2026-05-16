import { Layout } from './Layout';
import { Playground } from './components/Playground';
import { APP_TAGLINE, RATE_LIMIT_DEFAULT } from './constants';
import { PLAYGROUND_SCRIPT } from './client/playgroundScript';

export function HomePage() {
  return (
    <Layout
      title="Try it"
      activeNav="home"
      wide
      extraHead={
        <>
          <script src="https://cdn.jsdelivr.net/npm/marked@15.0.6/marked.min.js" />
          <script src="https://cdn.jsdelivr.net/npm/dompurify@3.2.4/dist/purify.min.js" />
        </>
      }
    >
      <div class="mb-8 animate-fade-up">
        <p class="mb-2 font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Web to Markdown
        </p>
        <h1 class="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl dark:text-paper-on-dark">
          {APP_TAGLINE}
        </h1>
      </div>

      <div class="animate-fade-up-delay-1">
        <Playground />
      </div>

      <aside class="mt-10 flex flex-wrap gap-2 border-t border-border pt-8 animate-fade-up-delay-3 dark:border-border-dark">
        <span class="feature-pill">Metadata extraction</span>
        <span class="feature-pill">LRU caching</span>
        <span class="feature-pill">
          {RATE_LIMIT_DEFAULT.maxRequests} req / {RATE_LIMIT_DEFAULT.windowMs / 1000}s
        </span>
        <span class="feature-pill font-mono">POST /crawl</span>
      </aside>

      <script dangerouslySetInnerHTML={{ __html: PLAYGROUND_SCRIPT }} />
    </Layout>
  );
}
