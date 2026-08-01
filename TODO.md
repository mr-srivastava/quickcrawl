# Roadmap

This roadmap tracks possible future work and known technical debt. It isn't a
release commitment; priorities can change as usage and deployment needs become
clearer.

## Current focus

The current priority is to stabilize documentation, security behavior, and
deployment verification.

- [ ] Add continuous integration for type checks, tests, and production builds.
- [ ] Add coverage reporting and identify untested workflow tasks.
- [ ] Add end-to-end route tests that mock external network behavior.
- [ ] Document and test the supported Vercel deployment path.

## Crawl capabilities

These items extend what QuickCrawl can fetch or extract.

- [ ] Respect `robots.txt` according to a documented policy.
- [ ] Add sitemap discovery and parsing.
- [ ] Support configurable user-agent strings.
- [ ] Add batch crawling with explicit concurrency and capacity controls.
- [ ] Add bounded recursive crawling.
- [ ] Support targeted extraction with CSS selectors.
- [ ] Evaluate browser rendering for JavaScript-dependent pages.

## API and output

These items extend the public API or available result formats.

- [ ] Add API-key authentication and per-key rate limiting.
- [ ] Add asynchronous crawl jobs and completion notifications.
- [ ] Evaluate streaming for large Markdown responses.
- [ ] Add cleaned HTML and structured JSON output formats.
- [ ] Define a versioning policy before introducing breaking API changes.

## Operations

These items improve deployment, observability, and multi-instance behavior.

- [ ] Add a container image and documented container workflow.
- [ ] Add metrics and tracing with an agreed observability standard.
- [ ] Evaluate shared caching and rate limiting for multi-instance deployments.
- [ ] Add persistent crawl history only after defining retention and privacy
      requirements.
- [ ] Add background queues if batch or scheduled crawling requires them.

## Technical debt

These items address known implementation limitations.

- [ ] Rename or revise the cache implementation so its documented eviction
      semantics match its ordered insertion behavior.
- [ ] Centralize response schemas for runtime validation and API documentation.
- [ ] Review whether `NODE_ENV` and `LOG_LEVEL` belong in the validated runtime
      configuration schema.
- [ ] Test DNS rebinding assumptions and document the residual risk.
- [ ] Decide whether CORS must remain open for every route.

## Completed foundations

QuickCrawl already includes these foundations:

- [x] Typed crawl stages and explicit task composition
- [x] HTTP and HTTPS URL validation
- [x] Public-address checks for initial and redirected targets
- [x] Bounded retries, redirects, and request timeouts
- [x] Metadata extraction and Markdown conversion
- [x] In-memory caching and rate limiting
- [x] Structured logging
- [x] Browser playground, browser API reference, and health endpoint
- [x] Unit and service-level test coverage for core modules
- [x] Node.js, pnpm, Vitest, and Rolldown toolchain
