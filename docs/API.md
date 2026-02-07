# API Reference

## Base URL

```
http://localhost:3000
```

## Endpoints

### Health Check

**GET /**

Simple health check endpoint.

**Response:**

```
Hello Hono!
```

---

### Crawl URL

**POST /crawl**

Fetches a web page, extracts metadata, and converts it to Markdown.

#### Request

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "url": "string"  // Required: Valid HTTP/HTTPS URL
}
```

**Validation:**

- `url` must be a valid URL string
- `url` must start with `http://` or `https://`

#### Response

##### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "markdown": "string",     // Converted Markdown content
    "title": "string",        // Page title (optional)
    "metadata": {             // Extracted metadata (optional)
      "description": "string",
      "keywords": "string",
      "author": "string",
      "ogTitle": "string",
      "ogDescription": "string",
      "ogImage": "string",
      "ogUrl": "string",
      "twitterCard": "string",
      "twitterTitle": "string",
      "twitterDescription": "string",
      "twitterImage": "string"
    }
  }
}
```

**Metadata Fields:**

All metadata fields are optional and depend on what's available on the target page:

| Field | Description |
|-------|-------------|
| `description` | Meta description tag |
| `keywords` | Meta keywords tag |
| `author` | Meta author tag |
| `ogTitle` | Open Graph title |
| `ogDescription` | Open Graph description |
| `ogImage` | Open Graph image URL |
| `ogUrl` | Open Graph canonical URL |
| `twitterCard` | Twitter card type |
| `twitterTitle` | Twitter card title |
| `twitterDescription` | Twitter card description |
| `twitterImage` | Twitter card image URL |

##### Validation Error (422 Unprocessable Entity)

```json
{
  "error": "Invalid input",
  "issues": [
    {
      "code": "string",
      "path": ["string"],
      "message": "string"
    }
  ]
}
```

##### Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "error": {
    "type": "fetch_error" | "parse_error" | "timeout_error" | "unknown",
    "message": "string",
    "cause": {}  // Optional: Original error object
  }
}
```

**Error Types:**

| Type | Description |
|------|-------------|
| `fetch_error` | Failed to fetch the URL (network error, DNS failure, etc.) |
| `parse_error` | Failed to parse HTML or convert to Markdown |
| `timeout_error` | Request exceeded timeout limit (30 seconds) |
| `unknown` | Unexpected error occurred |

##### Rate Limit Exceeded (429 Too Many Requests)

```json
{
  "error": "Rate limit exceeded"
}
```

**Headers:**

```
Retry-After: 60  // Seconds until rate limit resets
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default Limit**: 10 requests per minute per IP
- **Window**: 60 seconds (sliding window)
- **Response**: 429 status code with `Retry-After` header
- **Configuration**: Configurable via environment variables

**Environment Variables:**

```env
RATE_LIMIT_MAX_REQUESTS=10      # Max requests per window
RATE_LIMIT_WINDOW_MS=60000      # Window duration in milliseconds
```

## Caching

The API uses an LRU cache to improve performance:

- **Cache Key**: URL (exact match)
- **Default TTL**: 5 minutes
- **Max Size**: 100 entries
- **Behavior**: Cached responses are returned immediately without re-fetching

**Environment Variables:**

```env
CACHE_TTL_MS=300000    # Cache TTL in milliseconds (5 minutes)
CACHE_MAX_SIZE=100     # Maximum number of cached entries
```

**Cache Behavior:**

- Cache hit: Returns cached result immediately
- Cache miss: Fetches URL, caches result, returns result
- Cache full: Evicts least recently used entry
- Cache expired: Re-fetches URL and updates cache

## Examples

### cURL

**Basic Request:**

```bash
curl -X POST http://localhost:3000/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**With Pretty Output:**

```bash
curl -X POST http://localhost:3000/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' | jq '.'
```

### JavaScript/TypeScript

**Using Fetch:**

```typescript
const response = await fetch('http://localhost:3000/crawl', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com'
  })
});

const result = await response.json();

if (result.success) {
  console.log('Title:', result.data.title);
  console.log('Markdown:', result.data.markdown);
  console.log('Metadata:', result.data.metadata);
} else {
  console.error('Error:', result.error.message);
}
```

**With Error Handling:**

```typescript
async function crawlUrl(url: string) {
  try {
    const response = await fetch('http://localhost:3000/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  } catch (error) {
    console.error('Failed to crawl URL:', error);
    throw error;
  }
}
```

### Python

**Using requests:**

```python
import requests

url = "http://localhost:3000/crawl"
payload = {"url": "https://example.com"}

response = requests.post(url, json=payload)
result = response.json()

if result.get("success"):
    print("Title:", result["data"].get("title"))
    print("Markdown:", result["data"]["markdown"])
    print("Metadata:", result["data"].get("metadata"))
else:
    print("Error:", result["error"]["message"])
```

### Node.js (with axios)

```javascript
const axios = require('axios');

async function crawlUrl(url) {
  try {
    const response = await axios.post('http://localhost:3000/crawl', {
      url: url
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error.message);
    }
  } catch (error) {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.error(`Rate limited. Retry after ${retryAfter} seconds`);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Usage
crawlUrl('https://example.com')
  .then(data => {
    console.log('Title:', data.title);
    console.log('Markdown length:', data.markdown.length);
  })
  .catch(err => console.error(err));
```

## Response Times

Typical response times (without cache):

- **Simple pages**: 500ms - 2s
- **Complex pages**: 2s - 5s
- **Very large pages**: 5s - 10s
- **Timeout**: 30s (configurable)

Cached responses typically return in < 10ms.

## Best Practices

### 1. Handle Rate Limits

Always check for 429 responses and respect the `Retry-After` header:

```typescript
if (response.status === 429) {
  const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
  await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
  // Retry request
}
```

### 2. Implement Retries

Network requests can fail. Implement exponential backoff:

```typescript
async function crawlWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await crawlUrl(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### 3. Validate URLs

Validate URLs before sending requests:

```typescript
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
```

### 4. Handle Large Responses

Markdown output can be large. Consider streaming or pagination:

```typescript
const result = await crawlUrl(url);
if (result.markdown.length > 1_000_000) {
  console.warn('Large response:', result.markdown.length, 'characters');
  // Consider chunking or summarizing
}
```

### 5. Cache on Client Side

Implement client-side caching to reduce API calls:

```typescript
const cache = new Map<string, { data: any; expires: number }>();

async function cachedCrawl(url: string, ttl = 300_000) {
  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const data = await crawlUrl(url);
  cache.set(url, { data, expires: Date.now() + ttl });
  return data;
}
```

## Troubleshooting

### Common Issues

**422 Validation Error:**
- Ensure URL is properly formatted with `http://` or `https://`
- Check that URL is a valid string

**429 Rate Limit:**
- Wait for the duration specified in `Retry-After` header
- Consider implementing request queuing
- Increase rate limits via environment variables (for self-hosted)

**500 Server Error:**
- Check if target URL is accessible
- Verify target site doesn't block crawlers
- Check server logs for detailed error information

**Timeout:**
- Target site may be slow or unresponsive
- Consider increasing timeout via environment variables
- Implement client-side timeout handling

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
```

This will output detailed logs including:
- Request/response details
- Cache hits/misses
- Rate limit tracking
- Workflow stage transitions
- Error stack traces
