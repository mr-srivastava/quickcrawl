# Documentation Index

Welcome to QuickCrawl's documentation! This index helps you find the right documentation for your needs.

## Quick Navigation

### For Users

- **[README](../README.md)** - Start here! Quick overview and getting started guide
- **[API Reference](API.md)** - Complete API documentation with examples
- **[Changelog](../CHANGELOG.md)** - Version history and what's new

### For Developers

- **[Development Guide](DEVELOPMENT.md)** - Setup, workflows, and how to contribute
- **[Architecture](ARCHITECTURE.md)** - Technical deep dive into the system design
- **[Decisions](DECISIONS.md)** - Why we made specific technical choices (ADRs)
- **[TODO](../TODO.md)** - Roadmap and planned features

## Documentation Overview

### README.md
**Purpose:** Entry point for the project  
**Audience:** Everyone  
**Contains:**
- Quick start guide
- Basic usage examples
- Configuration overview
- Links to detailed docs

### API.md
**Purpose:** Complete API reference  
**Audience:** API users, frontend developers  
**Contains:**
- Endpoint specifications
- Request/response examples
- Error handling
- Rate limiting details
- Usage examples in multiple languages

### ARCHITECTURE.md
**Purpose:** Technical architecture documentation  
**Audience:** Developers, contributors  
**Contains:**
- Workflow pipeline details
- Type system explanation
- Services layer architecture
- Error handling patterns
- Extension points

### DEVELOPMENT.md
**Purpose:** Developer onboarding and guidelines  
**Audience:** Contributors, maintainers  
**Contains:**
- Setup instructions
- How to add features
- Testing strategies
- Code style guidelines
- Git commit conventions
- Debugging tips

### DECISIONS.md
**Purpose:** Architectural Decision Records (ADRs)  
**Audience:** Developers, future maintainers  
**Contains:**
- Why we chose Bun over Node.js
- Why workflow-based architecture
- Why specific libraries (Hono, Cheerio, etc.)
- Trade-offs and consequences
- Alternatives considered

### TODO.md
**Purpose:** Roadmap and task tracking  
**Audience:** Contributors, project planners  
**Contains:**
- Current work in progress
- Planned features
- Future ideas
- Completed features
- Known issues

### CHANGELOG.md
**Purpose:** Version history  
**Audience:** Users, developers  
**Contains:**
- What changed in each version
- New features
- Bug fixes
- Breaking changes

## Common Workflows

### "I want to use QuickCrawl"
1. Read [README](../README.md) for quick start
2. Check [API Reference](API.md) for detailed usage
3. Review [Changelog](../CHANGELOG.md) for latest features

### "I want to contribute"
1. Read [Development Guide](DEVELOPMENT.md) for setup
2. Review [Architecture](ARCHITECTURE.md) to understand the system
3. Check [Decisions](DECISIONS.md) to understand why things are the way they are
4. Look at [TODO](../TODO.md) for what needs to be done

### "I want to understand the design"
1. Read [Architecture](ARCHITECTURE.md) for technical details
2. Review [Decisions](DECISIONS.md) for rationale
3. Check code examples in [Development Guide](DEVELOPMENT.md)

### "I want to extend functionality"
1. Read [Architecture](ARCHITECTURE.md) → Extension Points section
2. Follow examples in [Development Guide](DEVELOPMENT.md) → Adding a New Task
3. Review [Decisions](DECISIONS.md) to align with existing patterns

### "I'm debugging an issue"
1. Check [Development Guide](DEVELOPMENT.md) → Debugging section
2. Review [API Reference](API.md) → Troubleshooting
3. Enable debug logging (see [README](../README.md) → Configuration)

## Documentation Maintenance

### When to Update Each Document

**README.md:**
- New major features
- Changed installation process
- Updated configuration options

**API.md:**
- New endpoints
- Changed request/response formats
- New error types
- Updated rate limits

**ARCHITECTURE.md:**
- New architectural patterns
- Changed workflow stages
- New services or layers
- Updated type system

**DEVELOPMENT.md:**
- New development tools
- Changed setup process
- Updated code style guidelines
- New testing approaches

**DECISIONS.md:**
- Any significant architectural decision
- Technology changes
- Pattern adoptions
- Trade-off discussions

**TODO.md:**
- When starting new work (move to "In Progress")
- When completing features (move to "Completed")
- When planning new features (add to "Planned")

**CHANGELOG.md:**
- Every release
- Significant changes
- Breaking changes
- New features

## Contributing to Documentation

Documentation improvements are always welcome! When contributing:

1. **Keep it current**: Update docs alongside code changes
2. **Be clear**: Write for someone unfamiliar with the project
3. **Use examples**: Show, don't just tell
4. **Link related docs**: Help readers find more information
5. **Follow the format**: Match the style of existing docs

## Questions?

If you can't find what you're looking for:
1. Check the [README](../README.md) first
2. Search across all documentation files
3. Look at code comments for implementation details
4. Open an issue on GitHub

---

**Last Updated:** 2024  
**Documentation Version:** 0.1.0
