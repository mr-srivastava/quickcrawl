import type { Child } from 'hono/jsx';
import { BookOpen, Sparkles } from 'lucide';
import { APP_NAME } from './constants';
import { cn } from './cn';
import { FontLinks } from './FontLinks';
import { Icon } from './components/Icon';
import { Logo } from './components/Logo';

type NavKey = 'home' | 'docs';

type LayoutProps = {
  title: string;
  activeNav: NavKey;
  children: Child;
  extraHead?: Child;
  wide?: boolean;
};

function navLinkClass(active: boolean): string {
  return cn('nav-link', active ? 'nav-link-active' : 'nav-link-inactive');
}

export function Layout({
  title,
  activeNav,
  children,
  extraHead,
  wide = false,
}: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>
          {title} | {APP_NAME}
        </title>
        <meta
          name="description"
          content="Fetch web pages and convert them to clean Markdown with metadata extraction."
        />
        <FontLinks />
        <link rel="stylesheet" href="/styles.css" />
        {extraHead}
      </head>
      <body class="body-bg flex min-h-screen flex-col">
        <header class="sticky top-0 z-20 border-b border-border/80 bg-paper-elevated/85 backdrop-blur-md dark:border-border-dark/80 dark:bg-paper-dark-elevated/85">
          <div
            class={cn(
              'mx-auto flex h-16 items-center justify-between px-5',
              wide ? 'max-w-5xl' : 'max-w-4xl',
            )}
          >
            <a href="/" class="group flex items-center gap-2.5 no-underline">
              <Logo class="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />
              <span class="font-display text-xl font-semibold tracking-tight text-ink dark:text-paper-on-dark">
                {APP_NAME}
              </span>
            </a>
            <nav class="flex gap-1" aria-label="Main">
              <a
                href="/"
                class={navLinkClass(activeNav === 'home')}
                aria-current={activeNav === 'home' ? 'page' : undefined}
              >
                <Icon icon={Sparkles} size={16} />
                Try it
              </a>
              <a
                href="/docs"
                class={navLinkClass(activeNav === 'docs')}
                aria-current={activeNav === 'docs' ? 'page' : undefined}
              >
                <Icon icon={BookOpen} size={16} />
                API
              </a>
            </nav>
          </div>
        </header>
        <main
          class={cn(
            'mx-auto w-full flex-1 px-5 py-10',
            wide ? 'max-w-5xl' : 'max-w-4xl',
          )}
        >
          {children}
        </main>
        <footer class="border-t border-border/80 bg-paper-elevated/60 py-6 dark:border-border-dark/80 dark:bg-paper-dark-elevated/60">
          <div class={cn('mx-auto px-5', wide ? 'max-w-5xl' : 'max-w-4xl')}>
            <p class="m-0 flex flex-wrap items-center gap-1 font-sans text-sm text-ink-muted dark:text-paper-muted-dark">
              Rate limited to protect the service.{' '}
              <a
                href="/docs"
                class="link-accent inline-flex items-center gap-1"
              >
                <Icon icon={BookOpen} size={14} />
                API docs
              </a>{' '}
              for limits and configuration.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
