# Architectural Decision Records

This document captures key architectural decisions made during the development of QuickCrawl.

## ADR-001: Use Bun as Runtime

**Date:** 2024  
**Status:** Accepted

**Context:**  
Need a fast, modern runtime for TypeScript execution with minimal configuration overhead.

**Decision:**  
Use Bun instead of Node.js as the primary runtime.

**Rationale:**
- Native TypeScript support without ts-node or tsx
- Significantly faster cold starts and execution
- Built-in test runner
- Compatible with Node.js ecosystem (can use npm packages)
- Simpler development workflow (no separate build step for dev)

**Consequences:**
- **Positive:**
  - Faster development iteration
  - Simpler tooling setup
  - Better performance in production
- **Negative:**
  - Smaller community than Node.js
  - Some packages may have compatibility issues
  - Deployment requires Bun on server
  - Less mature ecosystem

**Alternatives Considered:**
- Node.js with tsx: More mature but slower
- Deno: Good TypeScript support but different module system

---

## ADR-002: Workflow-Based Architecture

**Date:** 2024  
**Status:** Accepted

**Context:**  
Need a maintainable, testable way to process web pages through multiple transformation stages.

**Decision:**  
Implement a generic workflow engine with stage-based pipeline architecture.

**Rationale:**
- Each stage is independently testable
- Type-safe progression through stages using discriminated unions
- Easy to add, remove, or reorder stages
- Clear separation of concerns
- Reusable workflow engine for future use cases

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
- Class-based pipeline: More OOP but less functional

---

## ADR-003: Hono as Web Framework

**Date:** 2024  
**Status:** Accepted

**Context:**  
Need a lightweight, fast web framework for the API server.

**Decision:**  
Use Hono instead of Express or Fastify.

**Rationale:**
- Extremely lightweight and fast
- Works seamlessly with Bun
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

## ADR-004: Discriminated Unions for Type Safety

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

## ADR-005: Result Type for Error Handling

**Date:** 2024  
**Status:** Accepted

**Context:**  
Need consistent, type-safe error handling across the API.

**Decision:**  
Use Result<T, E> pattern (discriminated union of Success | Failure) instead of throwing exceptions.

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

## ADR-006: LRU Cache for Performance

**Date:** 2024  
**Status:** Accepted

**Context:**  
Need to reduce redundant requests to the same URLs without unbounded memory growth.

**Decision:**  
Implement LRU (Least Recently Used) cache with configurable TTL and max size.

**Rationale:**
- Bounded memory usage (max size limit)
- Automatic eviction of stale entries (TTL)
- Evicts least recently used when full
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
  - Not distributed (single-instance only)

**Alternatives Considered:**
- No caching: Simple but slow for repeated requests
- Redis: Distributed but adds complexity
- Simple Map: No eviction, unbounded memory

---

## ADR-007: Cheerio for HTML Parsing

**Date:** 2024  
**Status:** Accepted

**Context:**  
Need to parse and manipulate HTML efficiently in Node.js/Bun environment.

**Decision:**  
Use Cheerio for HTML parsing and manipulation.

**Rationale:**
- jQuery-like API (familiar to many developers)
- Fast and lightweight
- Works in Node.js/Bun (no browser required)
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

## ADR-008: Turndown for Markdown Conversion

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

## ADR-009: Pino for Structured Logging

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
- Good Bun compatibility
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

## Future Considerations

### Potential Future Decisions

1. **Distributed Caching**: Consider Redis if running multiple instances
2. **Database Storage**: Add persistent storage for crawl history
3. **Queue System**: Add job queue for batch crawling
4. **Authentication**: Add API key authentication
5. **Rate Limiting**: Consider Redis-backed rate limiting for distributed setup
6. **Monitoring**: Add metrics and observability (Prometheus, OpenTelemetry)
7. **Browser Rendering**: Consider adding Playwright for JavaScript-heavy sites

---

## Decision Process

When making new architectural decisions:

1. **Document the context**: What problem are we solving?
2. **List alternatives**: What other options did we consider?
3. **Explain rationale**: Why did we choose this approach?
4. **Note consequences**: What are the trade-offs?
5. **Update this document**: Keep it current
