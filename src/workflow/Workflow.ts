import pPipe from 'p-pipe';
import pTimeout from 'p-timeout';
import type { RunOptions, Task } from './types';

/**
 * Runs a linear pipeline of tasks. Each task's output is passed as input to the next.
 * TInput is the type of the initial context; TOutput is the type after all tasks run.
 */
export class Workflow<TInput, TOutput> {
  private readonly tasks: Task<any, any>[];

  constructor(tasks: Task<any, any>[]) {
    this.tasks = [...tasks];
  }

  async run(initial: TInput, options?: RunOptions): Promise<TOutput> {
    const runners = this.tasks.map((t) => t.run);
    const pipeline = pPipe(...runners);
    const promise = pipeline(initial);

    if (options?.timeoutMs != null) {
      return pTimeout(promise, {
        milliseconds: options.timeoutMs,
      }) as Promise<TOutput>;
    }

    return promise as Promise<TOutput>;
  }
}
