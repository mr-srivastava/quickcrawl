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
    const { container } = render(Playground, { props: { init } });

    await user.click(screen.getByRole('button', { name: 'example.com' }));
    expect(screen.getByLabelText('Page URL')).toHaveValue(
      'https://example.com',
    );
    await user.click(screen.getByRole('button', { name: 'Crawl page' }));

    expect(await screen.findByText('Extraction complete')).toBeVisible();
    expect(screen.getByText('Example title')).toBeVisible();
    expect(screen.getByText('4 words · 1 metadata field')).toBeVisible();
    expect(screen.getByRole('region', { name: 'Crawl result' })).toHaveFocus();

    await user.click(screen.getByRole('tab', { name: 'Metadata' }));
    expect(screen.getByText('Example description')).toBeVisible();
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
    render(Playground, { props: { init } });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Crawl page' }));
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
    expect(screen.getByRole('button', { name: 'Crawl page' })).toBeEnabled();
  });

  test('shows no-title and empty-metadata states', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(successResponse({ markdown: '' }))),
    );
    render(Playground, { props: { init } });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Crawl page' }));
    expect(await screen.findByText('(no title)')).toBeVisible();
    await user.click(screen.getByRole('tab', { name: 'Metadata' }));
    expect(screen.getByText('No metadata extracted')).toBeVisible();
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
    render(Playground, { props: { init } });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Crawl page' }));
    const previewTab = await screen.findByRole('tab', { name: 'Preview' });
    previewTab.focus();
    await fireEvent.keyDown(previewTab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Markdown' })).toHaveFocus();
    await user.click(screen.getByRole('tab', { name: 'Markdown' }));
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
    const view = render(Playground, { props: { init } });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Crawl page' }));
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
    render(Playground, { props: { init } });

    await user.type(screen.getByLabelText('Page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Crawl page' }));
    await user.click(await screen.findByRole('tab', { name: 'Markdown' }));
    await user.click(screen.getByRole('button', { name: 'Copy markdown' }));
    expect(screen.getByRole('button', { name: 'Copy markdown' })).toBeVisible();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your browser could not access the clipboard',
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
