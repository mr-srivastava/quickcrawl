# Development Guide

## Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher
- Node.js v20+ (for tooling compatibility)
- Git
- Code editor (VS Code recommended)

## Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd quickcrawl
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your preferred settings:

```env
NODE_ENV=development
LOG_LEVEL=debug           # Use debug for development
PORT=3000
RATE_LIMIT_MAX_REQUESTS=100  # Higher limit for development
RATE_LIMIT_WINDOW_MS=60000
CACHE_TTL_MS=300000
CACHE_MAX_SIZE=100
```

### 3. Start Development Server

```bash
bun run dev
```

The server will start with auto-reload enabled. Any changes to source files will automatically restart the server.

## Project Structure

```
quickcrawl/
├── src/
│   ├── index.ts                    # Server entry point
│   ├── lib/                        # Shared utilities
│   │   ├── cache.ts               # LRU cache implementation
│   │   ├── errors.ts              # Error handling utilities
│   │   ├── logger.ts              # Pino logger configuration
│   │   └── rateLimiter.ts         # Rate limiter implementation
│   ├── middleware/                 # Hono middleware
│   │   └── rateLimit.ts           # Rate limiting middleware
│   ├── services/                   # Business logic layer
│   │   ├── CrawlService.ts        # Core crawl orchestration
│   │   └── CachedCrawlService.ts  # Caching wrapper
│   ├── workflow/                   # Generic workflow engine
│   │   ├── Workflow.ts            # Workflow class
│   │   ├── types.ts               # Workflow type definitions
│   │   └── index.ts               # Public exports
│   └── workflows/                  # Specific workflow implementations
│       └── crawl/                  # Web crawling workflow
│           ├── tasks/              # Individual pipeline tasks
│           │   ├── fetchHtml.ts
│           │   ├── extractMetadata.ts
│           │   ├── parseDocument.ts
│           │   ├── cleanDocument.ts
│           │   └── convertToMarkdown.ts
│           ├── guards.ts           # Type guard functions
│           ├── types.ts            # Workflow context types
│           ├── constants.ts        # Configuration constants
│           ├── utils/              # Workflow utilities
│           ├── __tests__/          # Unit tests
│           └── createCrawlWorkflow.ts
├── docs/                           # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEVELOPMENT.md
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Project overview
```

## Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with auto-reload running:
   ```bash
   bun run dev
   ```

3. **Test your changes:**
   ```bash
   # Manual testing
   curl -X POST http://localhost:3000/crawl \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'
   
   # Run tests (when implemented)
   bun test
   ```

4. **Build to verify:**
   ```bash
   bun run build
   ```

### Adding a New Task

To extend the crawl workflow with a new transformation stage:

#### 1. Define the new stage in types

Edit `src/workflows/crawl/types.ts`:

```typescript
export type CrawlContext =
  | { stage: 'initial'; url: string }
  // ... existing stages ...
  | { stage: 'my_new_stage'; url: string; /* ... */; myData: MyData }
  | { stage: 'completed'; /* ... */ };
```

#### 2. Create the task file

Create `src/workflows/crawl/tasks/myTask.ts`:

```typescript
import type { Task } from '../../../workflow/types';
import type { CrawlContext } from '../types';
import { createModuleLogger } from '../../../lib/logger';

const log = createModuleLogger('myTask');

export const myTask: Task<CrawlContext> = async (ctx) => {
  // Guard: only process at expected stage
  if (ctx.stage !== 'cleaned') {
    return ctx;
  }

  log.debug({ url: ctx.url }, 'Processing my task');

  try {
    // Your transformation logic
    const myData = await processData(ctx.cleanedDocument);

    return {
      ...ctx,
      stage: 'my_new_stage',
      myData,
    };
  } catch (error) {
    log.error({ url: ctx.url, error }, 'Task failed');
    return {
      stage: 'error',
      url: ctx.url,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
};
```

#### 3. Export the task

Add to `src/workflows/crawl/tasks/index.ts`:

```typescript
export { myTask } from './myTask';
```

#### 4. Add to workflow

Edit `src/workflows/crawl/createCrawlWorkflow.ts`:

```typescript
import { myTask } from './tasks/index';

export function createCrawlWorkflow() {
  return new Workflow([
    fetchHtml,
    extractMetadata,
    parseDocument,
    cleanDocument,
    myTask,              // Add your task
    convertToMarkdown,
  ]);
}
```

#### 5. Create type guard (optional)

Add to `src/workflows/crawl/guards.ts`:

```typescript
export function hasMyData(
  ctx: CrawlContext
): ctx is Extract<CrawlContext, { myData: MyData }> {
  return 'myData' in ctx;
}
```

#### 6. Write tests

Create `src/workflows/crawl/tasks/__tests__/myTask.test.ts`:

```typescript
import { describe, it, expect } from 'bun:test';
import { myTask } from '../myTask';

describe('myTask', () => {
  it('should process cleaned document', async () => {
    const ctx = {
      stage: 'cleaned' as const,
      url: 'https://example.com',
      html: '<html>...</html>',
      cleanedDocument: /* mock cheerio */,
    };

    const result = await myTask(ctx);

    expect(result.stage).toBe('my_new_stage');
    expect(result.myData).toBeDefined();
  });

  it('should skip if not at cleaned stage', async () => {
    const ctx = {
      stage: 'initial' as const,
      url: 'https://example.com',
    };

    const result = await myTask(ctx);

    expect(result).toBe(ctx); // Unchanged
  });
});
```

### Creating a New Workflow

The workflow engine is generic and can be used for any multi-stage process:

#### 1. Define context types

Create `src/workflows/myworkflow/types.ts`:

```typescript
export type MyContext =
  | { stage: 'start'; input: string }
  | { stage: 'processed'; input: string; output: string }
  | { stage: 'done'; input: string; output: string; result: number }
  | { stage: 'error'; input: string; error: Error };
```

#### 2. Create tasks

Create task files in `src/workflows/myworkflow/tasks/`:

```typescript
import type { Task } from '../../../workflow/types';
import type { MyContext } from '../types';

export const processTask: Task<MyContext> = async (ctx) => {
  if (ctx.stage !== 'start') return ctx;

  const output = await process(ctx.input);

  return {
    ...ctx,
    stage: 'processed',
    output,
  };
};
```

#### 3. Create workflow factory

Create `src/workflows/myworkflow/createMyWorkflow.ts`:

```typescript
import { Workflow } from '../../workflow';
import type { MyContext } from './types';
import { processTask, finalizeTask } from './tasks';

type InitialContext = Extract<MyContext, { stage: 'start' }>;
type FinalContext = Extract<MyContext, { stage: 'done' }>;

export function createMyWorkflow(): Workflow<InitialContext, FinalContext> {
  return new Workflow([
    processTask,
    finalizeTask,
  ]);
}
```

#### 4. Create service

Create `src/services/MyService.ts`:

```typescript
import type { Workflow } from '../workflow';
import type { MyContext } from '../workflows/myworkflow/types';

type InitialContext = Extract<MyContext, { stage: 'start' }>;
type FinalContext = Extract<MyContext, { stage: 'done' }>;

export class MyService {
  constructor(
    private workflow: Workflow<InitialContext, FinalContext>
  ) {}

  async process(input: string) {
    const ctx = await this.workflow.run({ stage: 'start', input });
    return ctx.result;
  }
}
```

#### 5. Add API endpoint

Edit `src/index.ts`:

```typescript
import { createMyWorkflow } from './workflows/myworkflow';
import { MyService } from './services/MyService';

const myWorkflow = createMyWorkflow();
const myService = new MyService(myWorkflow);

app.post('/myendpoint', async (c) => {
  const { input } = await c.req.json();
  const result = await myService.process(input);
  return c.json({ result });
});
```

## Testing

### Unit Tests

Test individual tasks in isolation:

```typescript
import { describe, it, expect } from 'bun:test';
import { fetchHtml } from '../fetchHtml';

describe('fetchHtml', () => {
  it('should fetch HTML from URL', async () => {
    const ctx = await fetchHtml({
      stage: 'initial',
      url: 'https://example.com'
    });

    expect(ctx.stage).toBe('fetched');
    expect(ctx.html).toBeDefined();
    expect(ctx.html.length).toBeGreaterThan(0);
  });

  it('should handle fetch errors', async () => {
    const ctx = await fetchHtml({
      stage: 'initial',
      url: 'https://invalid-domain-that-does-not-exist.com'
    });

    expect(ctx.stage).toBe('error');
    expect(ctx.error).toBeDefined();
  });
});
```

### Integration Tests

Test complete workflows:

```typescript
import { describe, it, expect } from 'bun:test';
import { CrawlService } from '../../services/CrawlService';
import { createCrawlWorkflow } from '../createCrawlWorkflow';

describe('CrawlService', () => {
  it('should crawl URL and return markdown', async () => {
    const service = new CrawlService(createCrawlWorkflow());
    const result = await service.crawlUrl('https://example.com');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.markdown).toBeDefined();
      expect(result.data.title).toBeDefined();
    }
  });
});
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/workflows/crawl/tasks/__tests__/fetchHtml.test.ts

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage
```

## Debugging

### Enable Debug Logging

Set log level in `.env`:

```env
LOG_LEVEL=debug
```

This outputs detailed logs including:
- Request/response details
- Cache hits/misses
- Rate limit tracking
- Workflow stage transitions
- Error stack traces

### Using VS Code Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["--inspect", "src/index.ts"],
      "console": "integratedTerminal",
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

Set breakpoints and press F5 to start debugging.

### Logging Best Practices

Use structured logging with context:

```typescript
import { createModuleLogger } from '../lib/logger';

const log = createModuleLogger('MyModule');

// Good: Structured logging with context
log.info({ url, duration, size }, 'Request completed');

// Bad: String concatenation
log.info(`Request completed for ${url}`);
```

## Code Style

### TypeScript Conventions

**Types vs Interfaces:**
- Use `type` for unions, primitives, and complex types
- Use `interface` for object shapes that may be extended (rare in this project)
- Prefer discriminated unions for state machines

**Naming:**
- **Types**: PascalCase (`CrawlContext`, `WorkflowTask`, `Result`)
- **Functions**: camelCase with descriptive verbs (`fetchHtml`, `extractMetadata`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT_MS`, `MAX_RETRIES`)
- **Files**: camelCase for utilities, PascalCase for classes (`CrawlService.ts`)
- **Variables**: camelCase (`crawlResult`, `htmlContent`)

**Error Handling:**
- Return discriminated unions (Result type) over throwing in service layer
- Use try/catch only for truly exceptional cases
- Log errors with structured context using Pino
- Always include URL in error logs for crawl operations

**Async/Await:**
- Always use async/await over raw promises
- No `.then()` chains
- Handle errors explicitly with try/catch or Result type
- Use `Promise.all()` for parallel operations

**Imports:**
- Group imports: external → internal → types
- Use absolute imports from src root when beneficial
- Prefer named exports over default exports
- Order: React/framework → libraries → local modules → types

**Example:**
```typescript
// External
import { Hono } from 'hono';
import { z } from 'zod';

// Internal
import { CrawlService } from './services/CrawlService';
import { logger } from './lib/logger';

// Types
import type { CrawlContext } from './workflows/crawl/types';
```

**Comments:**
- Use JSDoc for public APIs and complex functions
- Avoid obvious comments (code should be self-documenting)
- Explain "why" not "what"
- Use `TODO:` for future improvements

**Type Safety:**
- Avoid `any` - use `unknown` instead
- Use type guards for narrowing
- Leverage discriminated unions
- Make impossible states unrepresentable

### Code Organization

- One primary export per file (exceptions: utils, types, barrel exports)
- Group related functionality in directories
- Keep files under 200 lines when possible
- Use barrel exports (`index.ts`) for public APIs
- Separate concerns: types, logic, presentation

### File Structure Pattern

```typescript
// 1. Imports (grouped as above)
// 2. Constants
// 3. Types (if small, otherwise separate file)
// 4. Main implementation
// 5. Exports
```

### Git Commit Conventions

Use conventional commits format for clear history:

```
<type>(<scope>): <description>

[optional body]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (deps, config, etc.)
- `perf`: Performance improvement

**Examples:**
```
feat(crawl): add retry logic for failed requests
fix(cache): prevent memory leak in LRU eviction
docs: update API examples with error handling
refactor(workflow): simplify task composition
test(services): add CrawlService integration tests
chore(deps): update dependencies to latest
```

## Performance Tips

### 1. Use Bun APIs

Bun provides optimized APIs:

```typescript
// Use Bun's native fetch (faster than node-fetch)
const response = await fetch(url);

// Use Bun's file I/O
const file = Bun.file('path/to/file');
const text = await file.text();
```

### 2. Optimize Cheerio Usage

```typescript
// Reuse selectors
const $ = cheerio.load(html);
const elements = $('selector');

// Avoid unnecessary DOM traversal
const text = $('p').first().text(); // Better
const text = $('p')[0].innerText;   // Slower
```

### 3. Cache Expensive Operations

```typescript
// Cache regex compilation
const URL_REGEX = /https?:\/\/.+/;

// Cache parsed data
const metadataCache = new Map();
```

### 4. Use Streaming When Possible

```typescript
// For large responses
const stream = await fetch(url).then(r => r.body);
```

## Common Issues

### Port Already in Use

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Resolution Issues

Ensure `tsconfig.json` has correct settings:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "ESNext"
  }
}
```

### Type Errors After Adding Task

1. Update `CrawlContext` type union
2. Add type guard if needed
3. Update workflow type parameters
4. Rebuild: `bun run build`

## Building for Production

```bash
# Build TypeScript
bun run build

# Test production build
bun run start

# Check output
ls -lh dist/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure build passes
6. Submit a pull request

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Hono Documentation](https://hono.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Cheerio Documentation](https://cheerio.js.org/)
