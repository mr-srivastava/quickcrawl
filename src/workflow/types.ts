/**
 * Task with explicit input and output types for type-safe pipelines.
 * Each task receives TInput and returns Promise<TOutput>.
 */
export interface Task<TInput, TOutput = TInput> {
  name: string;
  run: (ctx: TInput) => Promise<TOutput>;
}

/**
 * Task with optional metadata about requirements and produced fields.
 * Use for documentation and tooling; run signature is the same as Task.
 */
export interface TaskWithMetadata<TInput, TOutput = TInput>
  extends Task<TInput, TOutput> {
  description?: string;
  requiredFields?: (keyof TInput)[];
  producedFields?: (keyof TOutput)[];
}

/** Options for Workflow.run (timeout and optional progress callback). */
export interface RunOptions {
  timeoutMs?: number;
  onProgress?: (taskName: string, progress: number) => void;
}
