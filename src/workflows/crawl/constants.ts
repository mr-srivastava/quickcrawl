/**
 * Task name constants for the crawl workflow.
 * Use these instead of string literals for consistency and safe refactors.
 */
export const TASK_NAMES = {
  FETCH_HTML: 'fetch_html',
  EXTRACT_METADATA: 'extract_metadata',
  PARSE_DOCUMENT: 'parse_document',
  CLEAN_DOCUMENT: 'clean_document',
  CONVERT_TO_MARKDOWN: 'convert_to_markdown',
} as const;

/** Union of all crawl task name string literals. */
export type TaskName = (typeof TASK_NAMES)[keyof typeof TASK_NAMES];
