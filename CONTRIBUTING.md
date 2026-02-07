# Contributing to QuickCrawl

Thank you for your interest in contributing to QuickCrawl! This document provides guidelines and information for contributors.

## Getting Started

1. **Read the documentation:**
   - [README](README.md) - Project overview
   - [Development Guide](docs/DEVELOPMENT.md) - Setup and workflows
   - [Architecture](docs/ARCHITECTURE.md) - Technical design
   - [Decisions](docs/DECISIONS.md) - Why we made certain choices

2. **Set up your development environment:**
   ```bash
   git clone <your-fork-url>
   cd quickcrawl
   bun install
   cp .env.example .env
   bun run dev
   ```

3. **Check the TODO list:**
   - See [TODO.md](TODO.md) for planned features and improvements
   - Look for issues labeled "good first issue" on GitHub

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use a clear title** that describes the bug
3. **Provide details:**
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (OS, Bun version, etc.)
   - Relevant logs or error messages

### Suggesting Features

1. **Check TODO.md** to see if it's already planned
2. **Open an issue** with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach (optional)

### Submitting Code

#### Before You Start

1. **Open an issue** to discuss significant changes
2. **Check existing PRs** to avoid duplicate work
3. **Review the architecture** to understand the design

#### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow the [code style guidelines](#code-style)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes:**
   ```bash
   bun run dev        # Manual testing
   bun test           # Run tests (when implemented)
   bun run build      # Verify build works
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```
   See [Commit Conventions](#commit-conventions) below

5. **Push and create a PR:**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub

## Code Style

### TypeScript Guidelines

- **Use strict mode** - All code must pass TypeScript strict checks
- **Prefer `type` over `interface`** for unions and complex types
- **Use discriminated unions** for state machines
- **Avoid `any`** - Use `unknown` or proper types
- **Use type guards** for narrowing types

### Naming Conventions

- **Types**: PascalCase (`CrawlContext`, `Result`)
- **Functions**: camelCase (`fetchHtml`, `extractMetadata`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT_MS`)
- **Files**: camelCase for utilities, PascalCase for classes

### Code Organization

- One primary export per file
- Group imports: external → internal → types
- Keep files under 200 lines when possible
- Use meaningful variable names (no single letters except in loops)

### Example

```typescript
// Good
import { Hono } from 'hono';
import { CrawlService } from './services/CrawlService';
import type { CrawlContext } from './workflows/crawl/types';

const DEFAULT_TIMEOUT_MS = 30_000;

export async function crawlUrl(url: string): Promise<Result<CrawlData, CrawlError>> {
  // Implementation
}

// Bad
import type { CrawlContext } from './workflows/crawl/types';
import { CrawlService } from './services/CrawlService';
import { Hono } from 'hono';

const timeout = 30000;

export async function crawl(u: string): Promise<any> {
  // Implementation
}
```

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring (no behavior change)
- `test`: Adding or updating tests
- `chore`: Maintenance (deps, config, etc.)
- `perf`: Performance improvement

### Scopes

- `crawl`: Crawling workflow
- `api`: API endpoints
- `cache`: Caching logic
- `docs`: Documentation
- `deps`: Dependencies

### Examples

```bash
feat(crawl): add retry logic for failed requests
fix(cache): prevent memory leak in LRU eviction
docs: update API examples with error handling
refactor(workflow): simplify task composition
test(services): add CrawlService integration tests
chore(deps): update dependencies to latest
perf(crawl): optimize HTML parsing
```

## Testing Guidelines

### Writing Tests

- Write tests for all new features
- Test both success and error cases
- Use descriptive test names
- Keep tests focused and isolated

### Test Structure

```typescript
import { describe, it, expect } from 'bun:test';

describe('fetchHtml', () => {
  it('should fetch HTML from valid URL', async () => {
    // Arrange
    const ctx = { stage: 'initial' as const, url: 'https://example.com' };
    
    // Act
    const result = await fetchHtml(ctx);
    
    // Assert
    expect(result.stage).toBe('fetched');
    expect(result.html).toBeDefined();
  });

  it('should handle network errors', async () => {
    const ctx = { stage: 'initial' as const, url: 'https://invalid-url' };
    const result = await fetchHtml(ctx);
    expect(result.stage).toBe('error');
  });
});
```

## Documentation Guidelines

### When to Update Docs

- **README.md**: Major features, installation changes
- **API.md**: New endpoints, changed responses
- **ARCHITECTURE.md**: Architectural changes
- **DEVELOPMENT.md**: New tools, changed workflows
- **DECISIONS.md**: Significant technical decisions

### Documentation Style

- Use clear, concise language
- Include code examples
- Add links to related documentation
- Keep it up to date with code changes

## Pull Request Guidelines

### PR Title

Use the same format as commit messages:

```
feat(crawl): add retry logic for failed requests
```

### PR Description

Include:

1. **What**: Brief description of changes
2. **Why**: Motivation and context
3. **How**: Implementation approach (if complex)
4. **Testing**: How you tested the changes
5. **Screenshots**: For UI changes (if applicable)

### PR Checklist

Before submitting, ensure:

- [ ] Code follows style guidelines
- [ ] Tests added for new functionality
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Build succeeds (`bun run build`)
- [ ] Commit messages follow conventions
- [ ] No unnecessary files included

## Review Process

1. **Automated checks** run on PR submission
2. **Maintainer review** - May request changes
3. **Address feedback** - Make requested changes
4. **Approval** - PR is approved
5. **Merge** - Maintainer merges the PR

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## Questions?

- **General questions**: Open a GitHub Discussion
- **Bug reports**: Open a GitHub Issue
- **Feature requests**: Open a GitHub Issue
- **Security issues**: Email maintainers directly

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to QuickCrawl! 🎉
