# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Migrated the runtime and package-management workflow from Bun to Node.js and
  pnpm
- Replaced the Bun test runner with Vitest
- Upgraded the build and test toolchain to Vite 8 and TypeScript 7
- Replaced tsup with Rolldown and raised the Node.js requirement to version 24

### Added

- Added API, architecture, development, contribution, and agent documentation.
- Added architectural decision records.
- Added roadmap tracking.
- Added Oxlint and Oxfmt checks, including type-aware TypeScript linting and
  Tailwind CSS v4 class sorting.

## [0.1.0] - 2024

### Added

- Initial release
- Workflow-based crawling architecture
- Five-stage pipeline: Fetch → Extract Metadata → Parse → Clean → Convert to Markdown
- Type-safe workflow with discriminated unions
- LRU cache with configurable TTL and max size
- Rate limiting middleware (per-IP)
- Structured logging with Pino
- Metadata extraction (Open Graph, Twitter Cards, meta tags)
- Markdown conversion with GitHub Flavored Markdown support
- REST API with `/crawl` endpoint
- Result type for type-safe error handling
- Environment-based configuration
- Bun runtime support

### Technical details

- Runtime: Bun
- Framework: Hono
- HTML parser: Cheerio
- Markdown conversion: Turndown and `turndown-plugin-gfm`
- Logging: Pino
- Validation: Zod
- Language: TypeScript in strict mode

---

## Version history

- **0.1.0** - Initial release with core crawling functionality
