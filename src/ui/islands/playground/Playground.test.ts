// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, test, vi } from 'vitest';
import Playground from './Playground.svelte';
import { renderMarkdown } from './markdown';

const init = {
  endpoint: '/crawl',
  exampleUrls: [
    'https://example.com',
    'https://www.iana.org/help/example-domains',
  ],
};

function successResponse(data: {
  markdown: string;
  title?: string;
  metadata?: Record<string, string>;
}): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Playground', () => {
  test('selects an example URL and renders a successful crawl', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          successResponse({
            markdown: '# Example\n\nPage content',
            title: 'Example title',
            metadata: { description: 'Example description' },
          }),
        ),
      ),
    );
    const { container } = render(Playground, {
      props: { init, baseUrl: 'http://localhost:3000' },
    });

    await user.click(screen.getByRole('button', { name: 'example.com' }));
    expect(screen.getByLabelText('Page URL')).toHaveValue(
      'https://example.com',
    );
    await user.click(screen.getByRole('button', { name: 'Start crawling' }));

    expect(
      await screen.findByText('Success', {}, { timeout: 5000 }),
    ).toBeVisible();
    expect(screen.getByText('Example title')).toBeVisible();
    expect(screen.getByText('4 words · 1 metadata field')).toBeVisible();
    expect(screen.getByRole('region', { name: 'Crawl result' })).toHaveFocus();

    await user.click(screen.getByRole('tab', { name: 'JSON' }));
    expect(screen.getByText('Metadata (1)')).toBeVisible();
    expect(await axe(container)).toHaveNoViolations();
  });

  test('disables duplicate submission while loading and reports errors', async () => {
    const user = userEvent.setup();
    let resolveResponse: ((response: Response) => void) | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveResponse = resolve;
          }),
      ),
    );
    render(Playground, {
      props: { init, baseUrl: 'http://localhost:3000' },
    });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Start crawling' }));
    expect(screen.getByRole('button', { name: 'Extracting…' })).toBeDisabled();
    expect(screen.getByLabelText('Extracting page content')).toBeVisible();

    resolveResponse?.(
      new Response(
        JSON.stringify({
          success: false,
          error: { type: 'network_error', message: 'Network request failed' },
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Network request failed',
    );
    expect(
      screen.getByRole('button', { name: 'Start crawling' }),
    ).toBeEnabled();
  });

  test('shows no-title and empty-metadata states', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(successResponse({ markdown: '' }))),
    );
    render(Playground, {
      props: { init, baseUrl: 'http://localhost:3000' },
    });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Start crawling' }));
    expect(
      await screen.findByText('(no title)', {}, { timeout: 5000 }),
    ).toBeVisible();
    await user.click(screen.getByRole('tab', { name: 'JSON' }));
    expect(screen.queryByText(/Metadata \(/)).toBeNull();
  });

  test('supports tab keyboard navigation and copy feedback', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn<(text: string) => Promise<void>>(() =>
      Promise.resolve(),
    );
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(successResponse({ markdown: '# Example' }))),
    );
    render(Playground, {
      props: { init, baseUrl: 'http://localhost:3000' },
    });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Start crawling' }));
    const markdownTab = await screen.findByRole(
      'tab',
      { name: 'Markdown' },
      { timeout: 5000 },
    );
    markdownTab.focus();
    await fireEvent.keyDown(markdownTab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'JSON' })).toHaveFocus();
    await user.click(screen.getByRole('tab', { name: 'Markdown' }));
    await user.click(screen.getByRole('button', { name: 'Raw' }));
    await user.click(screen.getByRole('button', { name: 'Copy markdown' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('# Example'));
    expect(screen.getByRole('button', { name: 'Copied' })).toBeVisible();
  });

  test('aborts an active request when the island unmounts', async () => {
    const user = userEvent.setup();
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal ?? undefined;
        return new Promise<Response>(() => undefined);
      }),
    );
    const view = render(Playground, {
      props: { init, baseUrl: 'http://localhost:3000' },
    });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Start crawling' }));
    expect(requestSignal?.aborted).toBe(false);
    view.unmount();
    expect(requestSignal?.aborted).toBe(true);
  });

  test('keeps the copy action available when the clipboard rejects', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn<(text: string) => Promise<void>>(() =>
          Promise.reject(new Error('Clipboard unavailable')),
        ),
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(successResponse({ markdown: '# Example' }))),
    );
    render(Playground, {
      props: { init, baseUrl: 'http://localhost:3000' },
    });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Start crawling' }));
    await user.click(
      await screen.findByRole('button', { name: 'Raw' }, { timeout: 5000 }),
    );
    await user.click(screen.getByRole('button', { name: 'Copy markdown' }));
    expect(screen.getByRole('button', { name: 'Copy markdown' })).toBeVisible();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your browser could not access the clipboard',
    );
  });

  test('toggles Get code snippets for the current URL', async () => {
    const user = userEvent.setup();
    render(Playground, {
      props: { init, baseUrl: 'http://localhost:3000' },
    });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Get code' }));
    expect(screen.getByLabelText('API code snippets')).toBeVisible();
    expect(
      screen.getByText(/curl -X POST http:\/\/localhost:3000\/crawl/),
    ).toBeVisible();
    expect(screen.getByText(/"https:\/\/example.com"/)).toBeVisible();
  });

  test('stores successful URLs in recent history chips', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          successResponse({ markdown: '# Example', title: 'Example' }),
        ),
      ),
    );
    render(Playground, {
      props: { init, baseUrl: 'http://localhost:3000' },
    });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Start crawling' }));
    expect(
      await screen.findByText('Success', {}, { timeout: 5000 }),
    ).toBeVisible();

    const recentGroup = screen.getByRole('group', { name: 'Recent URLs' });
    expect(recentGroup).toBeVisible();
    expect(recentGroup).toHaveTextContent('example.com');
  });

  test('auto-starts crawling when initialUrl is provided', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        successResponse({ markdown: '# Auto', title: 'Auto title' }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(Playground, {
      props: {
        init,
        baseUrl: 'http://localhost:3000',
        initialUrl: 'https://example.com',
      },
    });

    expect(screen.getByLabelText('Page URL')).toHaveValue(
      'https://example.com',
    );
    expect(
      await screen.findByText('Success', {}, { timeout: 5000 }),
    ).toBeVisible();
    expect(screen.getByText('Auto title')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/crawl',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' }),
      }),
    );
  });
});

test('sanitizes unsafe Markdown HTML', () => {
  const html = renderMarkdown('<img src=x onerror="alert(1)">');
  expect(html).toContain('<img src="x">');
  expect(html).not.toContain('onerror');
});

test.each([
  ['javascript URL', '[unsafe](javascript:alert(1))', 'javascript:'],
  ['SVG event handler', '<svg onload="alert(1)"></svg>', 'onload'],
  ['encoded event handler', '<img src=x o&#x6E;error="alert(1)">', '<img'],
])('sanitizes a %s in Markdown HTML', (_name, markdown, unsafeValue) => {
  expect(renderMarkdown(markdown).toLowerCase()).not.toContain(unsafeValue);
});
