import { z } from 'zod';

// --- Metadata ---

/** Known metadata fields with proper types for IDE autocomplete and type safety */
interface KnownMetadata {
  title?: string;
  description?: string;
  author?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  favicon?: string;
}

/** Metadata type: known fields plus arbitrary string keys for custom meta tags */
export type Metadata = KnownMetadata & Record<string, string | undefined>;

// --- CrawlError (discriminated union for error handling) ---

/** Specific error types for different failure modes */
export type CrawlError =
  | { type: 'fetch_failed'; status: number; statusText: string; url: string }
  | { type: 'timeout'; timeoutMs: number; stage: string }
  | { type: 'parse_failed'; message: string; stage: string }
  | { type: 'network_error'; message: string; cause?: string }
  | { type: 'invalid_html'; message: string }
  | { type: 'unknown'; message: string; cause?: unknown };

// --- Result type ---

/** Success variant of Result */
export type Success<T> = {
  success: true;
  data: T;
};

/** Failure variant of Result */
export type Failure<E = CrawlError> = {
  success: false;
  error: E;
};

/** Result type for workflow execution and API responses */
export type Result<T, E = CrawlError> = Success<T> | Failure<E>;

// --- Discriminated union context types ---

type BaseContext = {
  url: string;
};

type InitialContext = BaseContext & {
  stage: 'initial';
};

type FetchedContext = BaseContext & {
  stage: 'fetched';
  html: string;
  title?: string;
};

type MetadataExtractedContext = Omit<FetchedContext, 'stage'> & {
  stage: 'metadata_extracted';
  metadata: Metadata;
};

type ParsedContext = Omit<MetadataExtractedContext, 'stage'> & {
  stage: 'parsed';
  document: string;
};

type CleanedContext = Omit<ParsedContext, 'stage'> & {
  stage: 'cleaned';
  cleanedDocument: string;
};

type CompletedContext = Omit<CleanedContext, 'stage'> & {
  stage: 'completed';
  markdown: string;
};

type ErrorContext = BaseContext & {
  stage: 'error';
  error: CrawlError;
  partialData?: Partial<CompletedContext>;
};

/** Union of all workflow stages; use type guards to narrow */
export type CrawlContext =
  | InitialContext
  | FetchedContext
  | MetadataExtractedContext
  | ParsedContext
  | CleanedContext
  | CompletedContext
  | ErrorContext;

// --- Zod schemas (unchanged for runtime validation) ---

export const CrawlInputSchema = z.object({
  url: z.string().url(),
});

export type CrawlInput = z.infer<typeof CrawlInputSchema>;

export const CrawlResultSchema = z.object({
  markdown: z.string(),
  title: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

/** Crawl result payload type; API can wrap in Result<CrawlResultData> */
export type CrawlResultData = {
  markdown: string;
  title?: string;
  metadata?: Metadata;
};

export type CrawlResult = Result<CrawlResultData>;
