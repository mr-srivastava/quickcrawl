# QuickCrawl

A fast, type-safe web crawler API built with TypeScript, Hono, and Bun. Fetches web pages, extracts metadata, and converts HTML to clean Markdown with built-in caching and rate limiting.

## Features

- 🚀 **Fast & Lightweight** - Built on Bun runtime and Hono framework
- 📝 **Markdown Conversion** - Converts HTML to clean, readable Markdown
- 🔍 **Metadata Extraction** - Automatically extracts page metadata (title, description, Open Graph, etc.)
- 💾 **Built-in Caching** - Configurable LRU cache to reduce redundant requests
- 🛡️ **Rate Limiting** - Protects your API from abuse
- 🔒 **Type-Safe** - Advanced TypeScript with discriminated unions and type guards
- 📊 **Structured Logging** - Pino logger with request tracking
- 🔄 **Workflow-Based** - Modular pipeline architecture for easy extension

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher
- Node.js v20+ (for development)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd quickcrawl

# Install dependencies
bun install

# Configure environment
cp .env.example .env
```

### Running the Server

```bash
# Development mode (with auto-reload)
bun run dev

# Build for production
bun run build

# Start production server
bun start
```

The server will start at `http://localhost:3000`

## Usage

### Basic Example

```bash
curl -X POST http://localhost:3000/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "markdown": "# Page Title\n\nPage content...",
    "title": "Page Title",
    "metadata": {
      "description": "Page description",
      "ogTitle": "Open Graph Title",
      "ogImage": "https://example.com/image.jpg"
    }
  }
}
```

### JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:3000/crawl', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const result = await response.json();

if (result.success) {
  console.log('Markdown:', result.data.markdown);
  console.log('Title:', result.data.title);
  console.log('Metadata:', result.data.metadata);
}
```

## Documentation

📚 **[Documentation Index](docs/INDEX.md)** - Complete guide to all documentation

**Quick Links:**
- **[API Reference](docs/API.md)** - Complete API documentation with examples
- **[Architecture](docs/ARCHITECTURE.md)** - Technical architecture and design patterns
- **[Development Guide](docs/DEVELOPMENT.md)** - Setup, workflows, and contribution guidelines
- **[Decisions](docs/DECISIONS.md)** - Architectural decision records (ADRs)
- **[TODO](TODO.md)** - Roadmap and planned features
- **[Changelog](CHANGELOG.md)** - Version history and changes

## Configuration

Environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | Logging level (debug/info/warn/error) |
| `PORT` | `3000` | Server port |
| `RATE_LIMIT_MAX_REQUESTS` | `10` | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |
| `CACHE_TTL_MS` | `300000` | Cache TTL (5 minutes) |
| `CACHE_MAX_SIZE` | `100` | Max cache entries |

## Project Structure

```
quickcrawl/
├── src/
│   ├── index.ts                 # Server entry point
│   ├── lib/                     # Shared utilities
│   ├── middleware/              # Hono middleware
│   ├── services/                # Business logic
│   ├── workflow/                # Generic workflow engine
│   └── workflows/               # Specific workflows
│       └── crawl/               # Web crawling workflow
├── docs/                        # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT.md
├── .env.example                 # Environment template
└── README.md
```

## How It Works

QuickCrawl uses a **workflow-based pipeline** that processes web pages through five stages:

```
URL → Fetch HTML → Extract Metadata → Parse Document → Clean Document → Convert to Markdown
```

Each stage is:
- **Type-safe** - TypeScript knows exactly what data exists at each stage
- **Composable** - Stages can be added, removed, or reordered
- **Testable** - Each stage can be tested in isolation

See [Architecture](docs/ARCHITECTURE.md) for detailed technical information.

## Performance

- **Fast**: Built on Bun runtime for optimal performance
- **Cached**: LRU cache reduces redundant requests
- **Protected**: Rate limiting prevents abuse
- **Efficient**: Streaming and optimized HTML parsing

Typical response times (without cache):
- Simple pages: 500ms - 2s
- Complex pages: 2s - 5s
- Cached responses: < 10ms

## Quick Reference

### Common Commands

```bash
bun run dev              # Start dev server with auto-reload
bun run build            # Build TypeScript to dist/
bun start                # Run production build
bun test                 # Run tests (when implemented)
```

### Key Files

- `src/index.ts` - Server entry point
- `src/workflows/crawl/` - Crawl pipeline implementation
- `src/services/` - Business logic (CrawlService, CachedCrawlService)
- `src/lib/` - Shared utilities (cache, logger, rate limiter)
- `.env` - Configuration (copy from `.env.example`)

### Troubleshooting

**Port already in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Module not found errors:**
- Verify `tsconfig.json` has `"moduleResolution": "bundler"`
- Run `bun install` to ensure dependencies are installed

**Slow crawl performance:**
- Check target site response time
- Verify cache is enabled (check logs for cache hits)
- Consider increasing timeout in CrawlService

See [Development Guide](docs/DEVELOPMENT.md) for detailed instructions on:
- Adding new tasks to the workflow
- Creating custom workflows
- Testing strategies
- Debugging tips

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for:
- How to report bugs and suggest features
- Development workflow and setup
- Code style guidelines and commit conventions
- Testing requirements and PR process

See also: [Development Guide](docs/DEVELOPMENT.md) for detailed technical information.

## License

MIT

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/quickcrawl/issues)
- **Documentation**: See `docs/` directory
- **Examples**: See [API Reference](docs/API.md)
