import { describe, expect, it, vi } from 'vitest';
import { anyAbortSignal } from './abortSignal';

describe('anyAbortSignal', () => {
  it('aborts immediately when an input signal is already aborted', () => {
    const controller = new AbortController();
    controller.abort('already-done');

    const combined = anyAbortSignal([
      controller.signal,
      AbortSignal.timeout(60_000),
    ]);

    expect(combined.aborted).toBe(true);
    expect(combined.reason).toBe('already-done');
  });

  it('aborts when any input signal aborts later', () => {
    const first = new AbortController();
    const second = new AbortController();
    const combined = anyAbortSignal([first.signal, second.signal]);
    const onAbort = vi.fn<() => void>();
    combined.addEventListener('abort', onAbort);

    expect(combined.aborted).toBe(false);
    second.abort('from-second');

    expect(combined.aborted).toBe(true);
    expect(combined.reason).toBe('from-second');
    expect(onAbort).toHaveBeenCalledOnce();
  });
});
