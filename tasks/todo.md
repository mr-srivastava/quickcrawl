# Application composition refactor tasks

## Task 1: Extract the crawl HTTP module

**Description:** Move crawl parsing, validation, invocation, and response
mapping behind a route factory.

**Acceptance criteria:**

The task is complete when these conditions hold.

- [x] A fake `Crawler` can drive route tests.
- [x] Public response shapes and status codes remain unchanged.

**Verification:**

Verify the task with the focused route suite.

- [x] Run focused crawl-route tests.

**Dependencies:** None

**Files likely touched:**

The implementation is expected to change these files.

- `src/routes/crawl.ts`
- `src/lib/errors.ts`

**Estimated scope:** Medium

## Task 2: Add application and production factories

**Description:** Separate Hono application assembly from production adapter
construction.

**Acceptance criteria:**

The task is complete when these conditions hold.

- [x] `createApp` accepts application dependencies.
- [x] The default export uses production adapters.

**Verification:**

Verify the task with route tests and the compiler.

- [x] Run route and type tests.

**Dependencies:** Task 1

**Files likely touched:**

The implementation is expected to change these files.

- `src/lib/createApp.ts`
- `src/index.ts`

**Estimated scope:** Small

## Task 3: Inject cache storage

**Description:** Make the caching decorator accept cache storage through its
constructor and construct the production cache at the composition root.

**Acceptance criteria:**

The task is complete when these conditions hold.

- [x] Cache policy is configured outside the decorator.
- [x] Cache behavior remains covered by tests.

**Verification:**

Verify the task with the crawl module tests.

- [x] Run crawl module tests.

**Dependencies:** Task 2

**Files likely touched:**

The implementation is expected to change these files.

- `src/services/CachedCrawlService.ts`
- `src/index.ts`

**Estimated scope:** Small

## Task 4: Update documentation and verify

**Description:** Document the composition root and run all required checks.

**Acceptance criteria:**

The task is complete when these conditions hold.

- [x] Architecture documentation matches the new seams.
- [x] Formatting, linting, types, tests, and build pass.

**Verification:**

Verify the complete change with the aggregate repository check.

- [x] Run `pnpm run check`.

**Dependencies:** Tasks 1–3

**Files likely touched:**

The implementation is expected to change these files.

- `docs/ARCHITECTURE.md`
- `CHANGELOG.md`

**Estimated scope:** Small
