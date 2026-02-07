# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation (API, Architecture, Development guides)
- Architectural Decision Records (ADR)
- TODO and roadmap tracking

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

### Technical Details
- **Runtime**: Bun
- **Framework**: Hono
- **HTML Parser**: Cheerio
- **Markdown**: Turndown + turndown-plugin-gfm
- **Logging**: Pino
- **Validation**: Zod
- **Language**: TypeScript (strict mode)

---

## Version History

- **0.1.0** - Initial release with core crawling functionality
