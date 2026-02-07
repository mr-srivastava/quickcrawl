# TODO & Roadmap

## In Progress

- [ ] Documentation improvements

## Next Up (High Priority)

### Features
- [ ] Add retry logic with exponential backoff for failed requests
- [ ] Implement robots.txt respect
- [ ] Add sitemap.xml parsing and crawling
- [ ] Support for custom user agents

### Testing
- [ ] Add unit tests for all workflow tasks
- [ ] Add integration tests for CrawlService
- [ ] Add E2E tests for API endpoints
- [ ] Set up test coverage reporting

### DevOps
- [ ] Add Docker support
- [ ] Create docker-compose for local development
- [ ] Add CI/CD pipeline (GitHub Actions)
- [ ] Set up automated testing

## Planned Features

### Crawling Enhancements
- [ ] Batch crawling endpoint (multiple URLs at once)
- [ ] Recursive crawling with depth limit
- [ ] Custom CSS selectors for targeted extraction
- [ ] Support for pagination detection
- [ ] Handle JavaScript-rendered content (Playwright integration)

### API Improvements
- [ ] Webhook notifications for completed crawls
- [ ] Streaming response for large pages
- [ ] GraphQL API option
- [ ] WebSocket support for real-time updates

### Output Formats
- [ ] PDF export option
- [ ] HTML export (cleaned)
- [ ] JSON structured data export
- [ ] Plain text export

### Performance
- [ ] Distributed caching with Redis
- [ ] Queue system for background processing
- [ ] Horizontal scaling support
- [ ] Connection pooling optimization

### Security & Auth
- [ ] API key authentication
- [ ] Rate limiting per API key
- [ ] IP whitelist/blacklist
- [ ] Request signing

### Monitoring & Observability
- [ ] Prometheus metrics endpoint
- [ ] OpenTelemetry integration
- [ ] Health check endpoint with detailed status
- [ ] Performance monitoring dashboard

## Ideas (Future Consideration)

- [ ] Browser extension for easy crawling
- [ ] CLI tool for command-line usage
- [ ] Plugin system for custom extractors
- [ ] AI-powered content summarization
- [ ] Screenshot capture option
- [ ] Archive.org integration
- [ ] RSS feed generation from crawled content
- [ ] Scheduled crawling (cron-like)
- [ ] Diff detection (notify on content changes)
- [ ] Language detection and translation

## Completed ✓

- [x] Basic crawl workflow
- [x] Markdown conversion with Turndown
- [x] Metadata extraction (Open Graph, Twitter Cards)
- [x] Rate limiting middleware
- [x] LRU caching
- [x] Structured logging with Pino
- [x] Type-safe workflow architecture
- [x] API documentation
- [x] Development guide
- [x] Architecture documentation

## Known Issues

- None currently

## Technical Debt

- Consider adding database for crawl history
- Evaluate need for distributed rate limiting
- Review error handling consistency across tasks
- Consider adding request/response validation middleware

---

## Notes

- Priority order may change based on user feedback
- Features marked with ⚠️ require significant architectural changes
- Check GitHub Issues for community-requested features
