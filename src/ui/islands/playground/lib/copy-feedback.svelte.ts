import { copyToClipboard } from '@svelte-put/copy';

/** Tracks copy success/failure with auto-reset for playground copy buttons. */
export class CopyFeedback {
  copiedTarget = $state<string | null>(null);
  copyError = $state(false);
  #timer: number | undefined;

  async copy(target: string, text: string) {
    this.#clearTimer();
    this.copyError = false;

    try {
      await copyToClipboard(text);
      this.copiedTarget = target;
      this.#timer = window.setTimeout(() => {
        if (this.copiedTarget === target) this.copiedTarget = null;
        this.#clearTimer();
      }, 1500);
    } catch {
      this.copiedTarget = null;
      this.copyError = true;
    }
  }

  destroy() {
    this.#clearTimer();
  }

  #clearTimer() {
    if (this.#timer === undefined) return;
    window.clearTimeout(this.#timer);
    this.#timer = undefined;
  }
}
