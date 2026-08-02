# Architectural decision records

This document records durable architectural decisions, their rationale, and
their tradeoffs. Update a record when the implementation changes enough that
the original decision no longer describes the system.

## ADR-001: Use Node.js with pnpm

**Date:** August 1, 2026
**Status:** Accepted

**Context:**
The project needs a widely supported production runtime and a deterministic,
space-efficient package manager.

**Decision:**
Use Node.js 24 or later as the runtime and pnpm 10 or later as the package
manager. Use `tsx` during development, Vitest for tests, and Rolldown for
production bundles.

**Rationale:**

- Broad hosting and package compatibility
- Strict, deterministic dependency installation through `pnpm-lock.yaml`
- Fast TypeScript execution during development with `tsx`
- A focused test runner with TypeScript support through Vitest
- A fast, Rust-based production bundler through Rolldown
- One package-manager workflow for local development and Vercel

**Consequences:**

- **Positive:**
  - Broad ecosystem and deployment support
  - Efficient dependency storage with pnpm
  - Consistent local and hosted builds
- **Negative:**
  - TypeScript source requires `tsx` during development or compilation for
    production
  - Testing requires a separate test runner

**Alternatives Considered:**

- Bun: Integrated runtime, package manager, and test runner, but less universal
  hosting support
- npm: Bundled with Node.js, but less space-efficient for multi-project setups
- Deno: Good TypeScript support, but a different module and tooling ecosystem

---

## ADR-002: Use explicit typed workflows

**Date:** 2024
**Status:** Accepted

**Context:**
Need a maintainable, testable way to process web pages through multiple transformation stages.

**Decision:**
Represent workflow state with discriminated unions and compose each transition
explicitly behind a small workflow interface.

**Rationale:**

- Each stage is independently testable
- Type-safe progression through stages using discriminated unions
- Explicit ordering makes incompatible adjacent stages fail type checking
- Clear separation of concerns
- A small public interface hides task composition from callers

**Consequences:**

- **Positive:**
  - Excellent maintainability
  - Easy to extend with new stages
  - Type safety catches errors at compile time
  - Each stage can be developed and tested independently
- **Negative:**
  - More boilerplate than monolithic approach
  - Requires understanding of discriminated unions
  - Slightly more complex for simple use cases

**Alternatives Considered:**

- Monolithic function: Simpler but harder to test and maintain
- Generic dynamic pipeline: More reusable, but it weakens adjacent-stage type
  guarantees
- Class-based pipeline: More object-oriented structure with little benefit for
  the current sequential flow

---

## ADR-003: Use Hono as the web framework

**Date:** 2024
**Status:** Accepted

**Context:**
Need a lightweight, fast web framework for the API server.

**Decision:**
Use Hono instead of Express or Fastify.

**Rationale:**

- Extremely lightweight and fast
- Includes an official Node.js server adapter
- Modern API design (similar to Express but cleaner)
- Built-in TypeScript support
- Edge-runtime compatible (future-proof)

**Consequences:**

- **Positive:**
  - Minimal overhead
  - Excellent performance
  - Clean, modern API
  - Good TypeScript support
- **Negative:**
  - Smaller ecosystem than Express
  - Fewer middleware options
  - Less community resources

**Alternatives Considered:**

- Express: More mature but heavier and slower
- Fastify: Fast but more complex configuration

---

## ADR-004: Use discriminated unions for type safety

**Date:** 2024
**Status:** Accepted

**Context:**
Need to ensure type safety across workflow stages and prevent accessing fields that don't exist yet.

**Decision:**
Use discriminated unions with a `stage` discriminator for workflow context types.

**Rationale:**

- Compile-time guarantees about available fields
- TypeScript can narrow types based on stage
- Impossible to access fields that don't exist yet
- Self-documenting code (types show what's available when)
- Prevents entire classes of runtime errors

**Consequences:**

- **Positive:**
  - Excellent type safety
  - Catches errors at compile time
  - Clear progression through stages
  - Better IDE autocomplete
- **Negative:**
  - Requires understanding of advanced TypeScript
  - More verbose type definitions
  - Learning curve for contributors

**Alternatives Considered:**

- Optional fields: Less safe, can access undefined values
- Separate types per stage: More verbose, harder to compose

---

## ADR-005: Use result types for error handling

**Date:** 2024
**Status:** Accepted

**Context:**
Need consistent, type-safe error handling across the API.

**Decision:**
Use a `Result<T, E>` discriminated union at service and API boundaries instead
of relying only on thrown exceptions.

**Rationale:**

- Forces explicit error handling
- Type-safe access to data or error
- Clear API contracts
- Prevents unhandled exceptions
- Functional programming approach

**Consequences:**

- **Positive:**
  - No unhandled exceptions
  - Explicit error handling in API
  - Type-safe error access
  - Clear success/failure paths
- **Negative:**
  - More verbose than try/catch
  - Requires checking success before accessing data
  - Different from typical JavaScript patterns

**Alternatives Considered:**

- Throwing exceptions: Standard but can be missed
- Error-first callbacks: Outdated pattern
- Promise rejection: Less type-safe

---

## ADR-006: Use a bounded in-memory cache

**Date:** 2024
**Status:** Accepted

**Context:**
Need to reduce redundant requests to the same URLs without unbounded memory growth.

**Decision:**
Implement an in-memory cache with configurable expiration and capacity. Evict
the oldest stored or updated key when the cache reaches capacity.

**Rationale:**

- Bounded memory usage (max size limit)
- Automatic eviction of stale entries (TTL)
- Evicts the oldest stored or updated entry when full
- Simple to implement and understand
- Configurable via environment variables

**Consequences:**

- **Positive:**
  - Significant performance improvement for repeated URLs
  - Predictable memory usage
  - Simple configuration
- **Negative:**
  - Stale data possible (within TTL)
  - Memory overhead for cache storage
  - Reads don't refresh eviction order
  - State isn't distributed across application instances

**Alternatives Considered:**

- No caching: Simple but slow for repeated requests
- Redis: Distributed but adds complexity
- Simple Map: No eviction, unbounded memory

---

## ADR-007: Use Cheerio for HTML parsing

**Date:** 2024
**Status:** Accepted

**Context:**
Need to parse and manipulate HTML efficiently in a Node.js environment.

**Decision:**
Use Cheerio for HTML parsing and manipulation.

**Rationale:**

- jQuery-like API (familiar to many developers)
- Fast and lightweight
- Works in Node.js (no browser required)
- Good for server-side HTML manipulation
- Mature and well-maintained

**Consequences:**

- **Positive:**
  - Familiar API
  - Excellent performance
  - Easy to use
  - Good documentation
- **Negative:**
  - Not a full browser (no JavaScript execution)
  - Can't handle dynamic content
  - Limited to static HTML

**Alternatives Considered:**

- JSDOM: Full DOM but much slower
- Playwright/Puppeteer: Can execute JS but heavy and slow
- Native parsing: Too low-level

---

## ADR-008: Use Turndown for Markdown conversion

**Date:** 2024
**Status:** Accepted

**Context:**
Need to convert cleaned HTML to clean, readable Markdown.

**Decision:**
Use Turndown with GitHub Flavored Markdown plugin.

**Rationale:**

- Mature and well-tested
- Supports GitHub Flavored Markdown
- Configurable output
- Handles edge cases well
- Active maintenance

**Consequences:**

- **Positive:**
  - Clean Markdown output
  - GFM support (tables, strikethrough, etc.)
  - Reliable conversion
- **Negative:**
  - Some HTML elements may not convert perfectly
  - Limited customization options

**Alternatives Considered:**

- html-to-md: Less mature
- Custom conversion: Too much work, error-prone
- Pandoc: Requires external binary

---

## ADR-009: Use Pino for structured logging

**Date:** 2024
**Status:** Accepted

**Context:**
Need fast, structured logging with minimal performance impact.

**Decision:**
Use Pino for structured logging with JSON output.

**Rationale:**

- Extremely fast (fastest Node.js logger)
- Structured JSON logging
- Child loggers for context
- Good Node.js compatibility
- Production-ready

**Consequences:**

- **Positive:**
  - Minimal performance impact
  - Structured logs easy to parse
  - Good for log aggregation tools
- **Negative:**
  - JSON output less readable in dev (use pino-pretty)
  - Requires log parsing tools for analysis

**Alternatives Considered:**

- Winston: Slower, more complex
- Console.log: Not structured, no levels
- Bunyan: Similar but less maintained

---

## ADR-010: Use Oxlint and Oxfmt for code quality

**Date:** August 1, 2026
**Status:** Accepted

**Context:**
The project needs consistent formatting and correctness-focused static analysis
for TypeScript, TSX, tests, documentation, and configuration files.

**Decision:**
Use Oxlint for linting and Oxfmt for formatting. Enable selected type-aware
TypeScript rules, fail CI on warnings, and use Oxfmt's Tailwind CSS v4 class
sorting. Keep TypeScript type checking as a separate required check.

**Rationale:**

- Native TypeScript, TSX, Node.js, import, and Vitest rule coverage
- Type-aware linting aligned with the project's TypeScript 7 toolchain
- Built-in Tailwind CSS v4 class sorting for Hono JSX
- Fast local and CI feedback with a small configuration surface
- No existing ESLint, Prettier, or plugin configuration to migrate

**Consequences:**

- **Positive:**
  - One formatter covers source, documentation, styles, and configuration
  - Linting catches asynchronous TypeScript errors beyond syntax checks
  - Contributors can run every required check through `pnpm run check`
- **Negative:**
  - Oxlint's JavaScript plugin compatibility and type-aware mode are newer than
    the equivalent ESLint ecosystem
  - Unsupported third-party lint rules may require adding ESLint in the future

**Alternatives Considered:**

- ESLint with Prettier: Mature and extensible, but requires more dependencies and
  configuration for the current needs
- Biome: Integrated linting and formatting, but doesn't match the selected
  TypeScript 7 type-aware workflow and Tailwind setup as directly
- No repository tooling: Minimal setup, but leaves formatting and static-analysis
  behavior inconsistent across contributors

---

## ADR-011: Use a Svelte island for the crawl playground

**Date:** August 2, 2026
**Status:** Accepted

**Context:**
The browser playground needs typed request state, accessible interactive
components, and runtime validation without replacing the lightweight Hono JSX
document shell or introducing a separate frontend application.

**Decision:**
Keep Hono JSX for page rendering and mount one client-rendered Svelte 5 island
for the complete playground. Compose locally owned shadcn-svelte source, build
the island with Vite, and serve its generated module through Hono. Use client
rendering rather than Svelte server rendering or hydration.

**Rationale:**

- Limits the client framework to the only stateful page region
- Replaces the untyped inline program and selector-based DOM contract
- Provides accessible, locally maintainable interface primitives
- Preserves the existing API server, page routes, and Tailwind design tokens
- Leaves static pages free of a client-side framework runtime

**Consequences:**

- **Positive:**
  - Browser requests and initialization data have runtime-validated contracts
  - Playground components receive Svelte type checking and focused UI tests
  - Hono continues to serve one application without SvelteKit
- **Negative:**
  - Development and production builds have separate browser and server targets
  - Contributors must distinguish Hono JSX from Svelte component boundaries
  - The browser downloads the Svelte, component, Markdown, and sanitization code

**Alternatives considered:**

- Typed vanilla TypeScript: Smaller runtime, but retains manual state rendering
  and accessible widget implementation
- React with shadcn/ui: Larger runtime and broader migration pressure for one
  interactive region
- Astro: Provides native island orchestration, but would replace the current
  presentation framework rather than extend it
- Full Svelte application: Simplifies one rendering model but unnecessarily
  moves static Hono pages into a client-oriented toolchain

---

## Future considerations

### Potential future decisions

1. **Distributed Caching**: Consider Redis if running multiple instances
2. **Database Storage**: Add persistent storage for crawl history
3. **Queue System**: Add job queue for batch crawling
4. **Authentication**: Add API key authentication
5. **Rate Limiting**: Consider Redis-backed rate limiting for distributed setup
6. **Monitoring**: Add metrics and observability (Prometheus, OpenTelemetry)
7. **Browser Rendering**: Consider adding Playwright for JavaScript-heavy sites

---

## Decision process

When making new architectural decisions:

1. **Document the context**: What problem are we solving?
2. **List alternatives**: What other options did we consider?
3. **Explain rationale**: Why did we choose this approach?
4. **Note consequences**: What are the trade-offs?
5. **Update this document**: Keep it current
