# QuickCrawl documentation

This page routes you to the canonical source for each QuickCrawl topic. Start
with the document that matches what you want to do, and follow its links when
you need more detail.

## Use QuickCrawl

Use these documents to install QuickCrawl, call the API, and understand release
changes.

- [README](../README.md) — product overview, requirements, quick start, and a
  minimal crawl example
- [API reference](API.md) — endpoints, request and response schemas, status
  codes, rate limiting, caching, and client examples
- [Changelog](../CHANGELOG.md) — released and unreleased behavior changes

## Develop QuickCrawl

Use these documents when you change the codebase or contribute a patch.

- [Development guide](DEVELOPMENT.md) — local setup, development commands,
  testing, debugging, and production builds
- [Contributing guide](../CONTRIBUTING.md) — contribution workflow, code
  conventions, commits, pull requests, and review expectations
- [Architecture](ARCHITECTURE.md) — module boundaries, runtime flow, workflow
  stages, extension points, and technical constraints
- [Architectural decisions](DECISIONS.md) — accepted decisions and their
  rationale
- [Roadmap](../TODO.md) — planned work, known issues, and technical debt

Repository agents also follow [AGENTS.md](../AGENTS.md). That file contains
operational guardrails for automated changes; it isn't contributor or product
documentation.

## Documentation ownership

Each topic has one canonical owner. Other documents can summarize the topic,
but they must link to the canonical document instead of repeating detailed
instructions.

| Topic                                         | Canonical document                       |
| --------------------------------------------- | ---------------------------------------- |
| Product purpose and first run                 | [README](../README.md)                   |
| HTTP endpoints and payloads                   | [API reference](API.md)                  |
| Local setup, commands, testing, and debugging | [Development guide](DEVELOPMENT.md)      |
| Contribution process and code conventions     | [Contributing guide](../CONTRIBUTING.md) |
| Components, data flow, and extension points   | [Architecture](ARCHITECTURE.md)          |
| Decision rationale                            | [Architectural decisions](DECISIONS.md)  |
| Planned work and known issues                 | [Roadmap](../TODO.md)                    |
| Released changes                              | [Changelog](../CHANGELOG.md)             |
| Coding-agent constraints                      | [AGENTS.md](../AGENTS.md)                |

## Choose a starting point

Use the shortest path for your task.

- To run the project, start with the [README](../README.md), then use the
  [development guide](DEVELOPMENT.md) for the full local workflow.
- To integrate with the service, use the [API reference](API.md).
- To fix or extend the implementation, read the
  [development guide](DEVELOPMENT.md) and the relevant section of the
  [architecture guide](ARCHITECTURE.md).
- To submit a change, follow the [contributing guide](../CONTRIBUTING.md).
- To understand why a technology or pattern was selected, read the
  [architectural decisions](DECISIONS.md).

## Maintain the documentation

When behavior changes, update the canonical document in the same change. Keep
summaries short, link to the canonical source, and don't copy long examples
between pages.

- Update `API.md` when an endpoint, payload, status code, or HTTP behavior
  changes.
- Update `DEVELOPMENT.md` when setup, commands, tests, debugging, or build steps
  change.
- Update `CONTRIBUTING.md` when contribution policy or code conventions change.
- Update `ARCHITECTURE.md` when module boundaries, data flow, workflow stages,
  or extension patterns change.
- Add an entry to `DECISIONS.md` when a significant technical choice needs a
  durable explanation.
- Update `README.md` only when the product overview, requirements, quick start,
  or primary example changes.
- Update `TODO.md` for planned work and `CHANGELOG.md` for delivered behavior.
- Update `AGENTS.md` when automated contributors need a new repository-specific
  constraint.

Before finishing a documentation change, verify commands and examples against
the current code, check relative links, and remove conflicting guidance from
noncanonical pages.
