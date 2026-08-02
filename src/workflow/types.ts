/**
 * Task with explicit input and output types for type-safe pipelines.
 * Each task receives TInput and returns Promise<TOutput>.
 */
export interface Task<TInput, TOutput = TInput> {
  name: string;
  run: (ctx: TInput, signal?: AbortSignal) => Promise<TOutput>;
}

/** Options shared by workflow implementations. */
export interface RunOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}
