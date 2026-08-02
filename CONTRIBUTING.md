# Contributing to QuickCrawl

QuickCrawl welcomes focused bug fixes, tests, documentation improvements, and
well-scoped features. This guide defines the contribution process and repository
conventions. Use the [development guide](docs/DEVELOPMENT.md) for local setup,
commands, testing, and debugging.

## Before you start

Review the existing context before you invest in a change:

1. Search open issues and pull requests for related work.
2. Check the [roadmap](TODO.md) for planned work and known issues.
3. Read the relevant section of the
   [architecture guide](docs/ARCHITECTURE.md).
4. Review the [architectural decisions](docs/DECISIONS.md) for existing
   constraints and tradeoffs.
5. Discuss substantial features or architectural changes in an issue before
   implementation.

## Report a bug

A useful bug report makes the behavior reproducible. Include:

- A clear title and concise description
- Steps to reproduce the problem
- Expected and actual behavior
- Node.js and pnpm versions
- Operating system and deployment environment
- Relevant logs or error messages with secrets removed

Don't include credentials, private URLs, access tokens, or sensitive crawled
content.

## Propose a feature

Describe the problem before the solution. Include the intended users, concrete
use cases, expected behavior, and relevant constraints. An implementation
outline is helpful when the proposal affects workflow stages, URL safety,
public API behavior, or deployment architecture.

## Submit a change

Keep each pull request focused on one coherent outcome. Follow this workflow:

1. Create a branch for the change.
2. Implement the smallest complete solution.
3. Add or update tests for behavioral changes.
4. Update the canonical documentation identified in
   [the documentation map](docs/INDEX.md).
5. Run the required verification commands.
6. Review the diff for unrelated or generated changes.
7. Open a pull request with a clear summary and verification notes.

Run these checks before submission:

```bash
pnpm run check
```

The aggregate check verifies formatting, lint rules, types, tests, and the
production build. Run `pnpm run format` and `pnpm run lint:fix` to apply safe
automatic fixes while you work.

## Code conventions

Match the surrounding TypeScript and keep the compiler in strict mode. Apply
these repository conventions:

- Prefer precise types and discriminated unions.
- Use `unknown` instead of `any` when the input type isn't known.
- Use `import type` for type-only imports.
- Respect `verbatimModuleSyntax`.
- Use type guards to narrow workflow and result variants.
- Keep HTTP concerns at the route boundary.
- Keep reusable business behavior in services.
- Keep crawl-stage transformations in workflow tasks.
- Use structured Pino logging instead of `console.log`.
- Prefer existing utilities and patterns before adding abstractions.

Use these naming conventions:

| Element                       | Convention       | Example                           |
| ----------------------------- | ---------------- | --------------------------------- |
| Types and classes             | PascalCase       | `CrawlContext`, `CrawlService`    |
| Functions and variables       | camelCase        | `extractMetadata`, `crawlResult`  |
| Constants                     | Upper snake case | `DEFAULT_TIMEOUT_MS`              |
| Utility and task files        | camelCase        | `urlSafety.ts`, `fetchHtml.ts`    |
| Class and JSX component files | PascalCase       | `CrawlService.ts`, `HomePage.tsx` |

Keep imports grouped as external dependencies, internal modules, and type-only
imports. Use Oxfmt for repository formatting and Oxlint for correctness-focused
static analysis. Don't reformat generated `public/styles.css` or
`public/assets/` files manually.

## Security requirements

Crawling arbitrary URLs creates a server-side request forgery risk. Treat the
URL-safety rules as required behavior:

- Validate every initial URL and redirect destination.
- Permit only HTTP and HTTPS.
- Reject URL credentials and non-public network addresses.
- Preserve request cancellation, fetch timeouts, redirect bounds, and retry
  bounds.
- Add focused security tests for changes to URL parsing, DNS resolution,
  redirects, proxy identity, or fetching.

Never commit `.env` files, credentials, tokens, private URLs, or captured
production data.

## Testing guidelines

Tests are colocated with source files as `*.test.ts` and `*.test.tsx`. Add tests
at the narrowest useful boundary and cover:

- Successful behavior
- Expected errors
- Validation and boundary cases
- Cancellation and timeout behavior when relevant
- Security cases for network-facing changes
- Cache and rate-limit behavior when those modules change

Keep tests deterministic. Don't depend on live public websites or external DNS
when behavior can be injected or mocked. Run a focused Vitest file while you
iterate:

```bash
pnpm exec vitest run src/workflows/crawl/urlSafety.test.ts
```

## Documentation guidelines

The [documentation map](docs/INDEX.md) assigns one canonical document to each
topic. Update that owner in the same change as the behavior, and link to it from
other pages instead of copying detailed instructions.

Use direct language, sentence-case headings, descriptive links, and examples
that match the current implementation. Wrap prose at 80 characters where
practical. Don't manually edit generated browser assets; regenerate them with
`pnpm run build:assets` when UI source changes.

## Commit conventions

Use Conventional Commits when creating commits:

```text
<type>(<scope>): <description>
```

Common types include `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, and
`perf`. Use a concise imperative description, for example:

```text
fix(crawl): reject private redirect targets
docs(api): clarify rate-limit behavior
test(cache): cover expired entries
```

## Pull request expectations

Use the commit format for the pull request title. In the description, explain:

- What changed and why
- Which behavior or risk the change addresses
- How you verified the result
- Which documentation changed
- Any follow-up work or known limitation

Reviewers evaluate correctness, scope, tests, security, type safety,
documentation, and compatibility with the existing architecture. Address
feedback with focused updates, and keep unrelated cleanup in a separate change.

## Next steps

Set up the repository with the [development guide](docs/DEVELOPMENT.md), then
use the [architecture guide](docs/ARCHITECTURE.md) to find the correct extension
point for your change.
