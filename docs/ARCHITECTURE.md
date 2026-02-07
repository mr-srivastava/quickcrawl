# Architecture

## Overview

QuickCrawl uses a modular workflow-based architecture that processes web pages through a series of transformation stages. Each stage is type-safe and composable.

## Workflow Pipeline

The crawl workflow consists of five sequential stages:

```
URL → Fetch HTML → Extract Metadata → Parse Document → Clean Document → Convert to Markdown
```

### Stage Details

1. **Fetch HTML** (`fetchHtml`)
   - Downloads the web page using native fetch
   - Handles redirects and HTTP errors
   - Extracts initial title from HTML
   - **Input**: `{ stage: 'initial', url }`
   - **Output**: `{ stage: 'fetched', url, html, title? }`

2. **Extract Metadata** (`extractMetadata`)
   - Parses meta tags, Open Graph, Twitter Cards
   - Extracts structured metadata (description, images, etc.)
   - **Input**: `{ stage: 'fetched', ... }`
   - **Output**: `{ stage: 'metadata_extracted', ..., metadata }`

3. **Parse Document** (`parseDocument`)
   - Loads HTML into Cheerio DOM
   - Prepares document for manipulation
   - **Input**: `{ stage: 'metadata_extracted', ... }`
   - **Output**: `{ stage: 'parsed', ..., document }`

4. **Clean Document** (`cleanDocument`)
   - Removes scripts, styles, and unwanted elements
   - Cleans up navigation, footers, ads
   - **Input**: `{ stage: 'parsed', ... }`
   - **Output**: `{ stage: 'cleaned', ..., cleanedDocument }`

5. **Convert to Markdown** (`convertToMarkdown`)
   - Transforms clean HTML to Markdown using Turndown
   - Supports GitHub Flavored Markdown
   - **Input**: `{ stage: 'cleaned', ... }`
   - **Output**: `{ stage: 'completed', ..., markdown }`

## Type System

### Discriminated Unions

Each workflow stage is represented as a distinct type with guaranteed fields:

```typescript
type CrawlContext =
  | { stage: 'initial'; url: string }
  | { stage: 'fetched'; url: string; html: string; title?: string }
  | { stage: 'metadata_extracted'; url: string; html: string; title?: string; metadata: Metadata }
  | { stage: 'parsed'; url: string; html: string; title?: string; metadata: Metadata; document: CheerioAPI }
  | { stage: 'cleaned'; url: string; html: string; title?: string; metadata: Metadata; document: CheerioAPI; cleanedDocument: CheerioAPI }
  | { stage: 'completed'; url: string; html: string; title?: string; metadata: Metadata; document: CheerioAPI; cleanedDocument: CheerioAPI; markdown: string }
  | { stage: 'error'; url: string; error: Error };
```

This ensures:
- **Compile-time safety**: TypeScript knows exactly what fields exist at each stage
- **No runtime surprises**: Can't access fields that don't exist yet
- **Clear progression**: Stage transitions are explicit and type-checked

### Type Guards

Type guards allow safe narrowing of context types:

```typescript
import { isFetched, isCompleted, hasMetadata } from './workflows/crawl/guards';

// Example: Check if HTML was fetched
if (isFetched(ctx)) {
  // TypeScript knows ctx.html exists
  console.log(ctx.html.length);
}

// Example: Check if workflow completed
if (isCompleted(ctx)) {
  // TypeScript knows ctx.markdown exists
  return ctx.markdown;
}

// Example: Check if metadata was extracted
if (hasMetadata(ctx)) {
  // TypeScript knows ctx.metadata exists
  console.log(ctx.metadata.description);
}
```

### Result Type

API responses use a discriminated union for type-safe error handling:

```typescript
type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

This pattern:
- Forces explicit error handling
- Makes success/failure states mutually exclusive
- Provides type-safe access to data or error

**Usage:**

```typescript
const result = await crawlService.crawlUrl(url);

if (result.success) {
  // TypeScript knows result.data exists
  console.log(result.data.markdown);
} else {
  // TypeScript knows result.error exists
  console.error(result.error.message);
}
```

## Services Layer

### CrawlService

Core service that orchestrates the workflow:

```typescript
class CrawlService {
  constructor(
    private workflow: Workflow<InitialContext, FinalContext>,
    private timeoutMs: number = 30_000
  )
  
  async crawlUrl(url: string): Promise<CrawlResult>
}
```

**Responsibilities:**
- Initializes workflow with URL
- Handles timeout management
- Converts workflow result to API response
- Logs crawl metrics (duration, markdown length, etc.)

### CachedCrawlService

Wrapper service that adds caching:

```typescript
class CachedCrawlService {
  constructor(
    private crawlService: CrawlService,
    private cache: LRUCache<string, CrawlResult>
  )
  
  async crawlUrl(url: string): Promise<CrawlResult>
}
```

**Features:**
- LRU cache with configurable TTL and max size
- Cache key based on URL
- Transparent caching (same interface as CrawlService)
- Cache hit/miss logging

## Workflow Engine

### Generic Workflow Class

The workflow engine is generic and reusable:

```typescript
class Workflow<TInitial, TFinal> {
  constructor(private tasks: Task<any>[])
  
  async run(
    initialContext: TInitial,
    options?: { timeoutMs?: number }
  ): Promise<TFinal>
}
```

**Features:**
- Type-safe input/output
- Sequential task execution
- Timeout support with `p-timeout`
- Retry logic with `p-retry`
- Composable task pipeline

### Task Interface

Each task is a simple async function:

```typescript
type Task<TContext> = (ctx: TContext) => Promise<TContext>;
```

Tasks:
- Receive context
- Transform context
- Return new context
- Can be pure functions or have side effects

## Error Handling

### Error Types

```typescript
type CrawlError = {
  type: 'fetch_error' | 'parse_error' | 'timeout_error' | 'unknown';
  message: string;
  cause?: unknown;
};
```

### Error Flow

1. **Task Level**: Tasks catch and transform errors into error context
2. **Service Level**: CrawlService catches workflow errors and returns Result
3. **API Level**: Error handler middleware formats errors for HTTP response

### Structured Logging

All errors are logged with context:

```typescript
logger.error({
  url,
  error: err,
  stage: ctx.stage,
  duration
}, 'Crawl failed');
```

## Middleware

### Rate Limiting

Token bucket algorithm with configurable limits:

```typescript
rateLimitMiddleware({
  maxRequests: 10,      // Max requests per window
  windowMs: 60_000,     // Time window in ms
  keyGenerator: (c) => c.req.header('x-forwarded-for') || 'default'
})
```

**Features:**
- Per-IP rate limiting
- Configurable via environment variables
- Returns 429 when limit exceeded
- Includes `Retry-After` header

## Performance Considerations

### Caching Strategy

- **LRU Cache**: Evicts least recently used entries when full
- **TTL**: Entries expire after configured time
- **Memory Efficient**: Bounded cache size prevents memory leaks

### Resource Management

- **Timeouts**: Prevents hanging requests (default 30s)
- **Streaming**: Cheerio loads HTML efficiently
- **Connection Pooling**: Native fetch handles connection reuse

### Scalability

- **Stateless**: Each request is independent
- **Horizontal Scaling**: Can run multiple instances behind load balancer
- **Rate Limiting**: Protects against abuse and resource exhaustion

## Extension Points

### Adding a New Task

Create a task file in `src/workflows/crawl/tasks/`:

```typescript
import type { Task } from '../../../workflow/types';
import type { CrawlContext } from '../types';

export const myTask: Task<CrawlContext> = async (ctx) => {
  // Only process if at expected stage
  if (ctx.stage !== 'cleaned') return ctx;
  
  // Your transformation logic
  const processed = processDocument(ctx.cleanedDocument);
  
  // Return new context with updated stage
  return {
    ...ctx,
    stage: 'my_new_stage',
    processedData: processed
  };
};
```

Then add to workflow:

```typescript
export function createCrawlWorkflow() {
  return new Workflow([
    fetchHtml,
    extractMetadata,
    parseDocument,
    cleanDocument,
    myTask,           // Add your task
    convertToMarkdown,
  ]);
}
```

### Creating a New Workflow

The workflow engine is generic and can be used for any multi-stage process:

```typescript
import { Workflow } from './workflow';

type MyContext = 
  | { stage: 'start'; input: string }
  | { stage: 'processed'; input: string; output: string }
  | { stage: 'done'; input: string; output: string; result: number };

const workflow = new Workflow<
  Extract<MyContext, { stage: 'start' }>,
  Extract<MyContext, { stage: 'done' }>
>([
  processTask,
  finalizeTask
]);

const result = await workflow.run({ stage: 'start', input: 'data' });
```

## Dependencies

### Core Dependencies

- **Hono**: Fast web framework
- **Cheerio**: HTML parsing and manipulation
- **Turndown**: HTML to Markdown conversion
- **Pino**: Structured logging
- **Zod**: Runtime validation

### Utility Libraries

- **p-retry**: Retry logic with exponential backoff
- **p-timeout**: Promise timeout wrapper
- **p-pipe**: Function composition

## Testing Strategy

### Unit Tests

Test individual tasks in isolation:

```typescript
describe('fetchHtml', () => {
  it('should fetch HTML from URL', async () => {
    const ctx = await fetchHtml({ stage: 'initial', url: 'https://example.com' });
    expect(ctx.stage).toBe('fetched');
    expect(ctx.html).toBeDefined();
  });
});
```

### Integration Tests

Test complete workflow:

```typescript
describe('CrawlService', () => {
  it('should crawl URL and return markdown', async () => {
    const service = new CrawlService(createCrawlWorkflow());
    const result = await service.crawlUrl('https://example.com');
    expect(result.success).toBe(true);
    expect(result.data.markdown).toBeDefined();
  });
});
```

### End-to-End Tests

Test API endpoints:

```typescript
describe('POST /crawl', () => {
  it('should return markdown for valid URL', async () => {
    const response = await app.request('/crawl', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' })
    });
    expect(response.status).toBe(200);
  });
});
```
