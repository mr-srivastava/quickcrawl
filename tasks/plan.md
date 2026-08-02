# Implementation plan: Application composition refactor

## Overview

Refactor application construction and the crawl HTTP path around explicit,
injectable seams while preserving the public HTTP contract and typed crawl
workflow.

## Architecture decisions

These decisions keep construction explicit without adding a dependency
injection framework.

- Keep `Crawler` as the single crawl module interface.
- Build production adapters in one composition root.
- Inject cache storage and HTTP middleware instead of constructing them inside
  feature modules.
- Keep the workflow stages explicitly composed rather than introducing a
  generic pipeline.

## Task list

### Phase 1: Define construction seams

This phase separates HTTP behavior from production construction.

- [x] Extract response builders and crawl-route construction.
- [x] Add an application factory with injected dependencies.

### Checkpoint: HTTP composition

This checkpoint verifies the new HTTP seam through its public interface.

- [x] Route behavior passes focused tests with a fake crawler.

### Phase 2: Move production construction

This phase moves all production adapter selection into one composition root.

- [x] Add the production composition root.
- [x] Inject cache storage into `CachedCrawlService`.

### Checkpoint: Production composition

This checkpoint confirms that production behavior stays stable.

- [x] Existing application behavior remains unchanged.

### Phase 3: Document and verify

This phase records the new architecture and performs repository verification.

- [x] Update canonical architecture and release documentation.
- [x] Run the complete repository check.

### Checkpoint: Complete

This checkpoint confirms that the refactor is ready for review.

- [x] All acceptance criteria pass.
- [x] The final diff contains no unrelated changes.

## Risks and mitigations

The refactor addresses these risks through contract tests and narrow seams.

| Risk                | Impact | Mitigation                                              |
| ------------------- | ------ | ------------------------------------------------------- |
| HTTP response drift | High   | Reuse centralized builders and preserve contract tests. |
| Shared test state   | Medium | Construct a fresh app and fake crawler per route test.  |
| Excess abstraction  | Medium | Add seams only where production and test adapters vary. |

## Open questions

There are no blocking questions. The requested refactor confirms the proposed
construction model.
