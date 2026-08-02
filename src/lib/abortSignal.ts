/**
 * Returns a signal that aborts when any of the input signals abort.
 * Prefer this over `AbortSignal.any` until tooling types consistently include it.
 */
export function anyAbortSignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }

    signal.addEventListener(
      'abort',
      () => {
        controller.abort(signal.reason);
      },
      { once: true, signal: controller.signal },
    );
  }

  return controller.signal;
}
