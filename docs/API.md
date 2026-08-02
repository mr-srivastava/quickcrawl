# API reference

QuickCrawl exposes a JSON crawl endpoint, a health endpoint, and three browser
pages. This reference describes the HTTP contract implemented by
`src/index.ts` and `src/routes/ui.tsx`.

Local examples use `http://localhost:3000`. Replace that origin with your
deployed QuickCrawl URL in production.

## Browser pages

QuickCrawl serves its marketing home page, playground, and browser documentation
from the same Hono application as the API.

### `GET /`

The root route returns the marketing home page with a short introduction and a
call to action into the playground.

### `GET /playground`

The playground route returns the interactive crawl workspace. Open it in a
browser to submit a URL and inspect Markdown and JSON output. Optional
`?url=` prefills the command bar.

### `GET /docs`

The docs route returns a condensed HTML API reference for browser users.

### `GET /styles.css`

The stylesheet route returns the generated UI stylesheet. It returns `503` with
a CSS comment when `public/styles.css` hasn't been built.

### `GET /assets/:filename`

The browser asset routes return generated JavaScript and source maps from
`public/assets/`. The entry bundle is `app.js`; Vite may emit additional chunk
files that the entry bundle imports at runtime.

`GET /assets/app.js` returns `503` with a JavaScript comment when
`pnpm run build:client` hasn't generated the bundle. Missing chunk files return
`404`. Both browser asset URLs include the application version so deployments
can revalidate changed output.

## Health endpoint

Use the health endpoint for local checks and deployment probes.

### `GET /health`

The endpoint returns `200 OK` with application metadata from `src/config.ts`.

```json
{
  "status": "ok",
  "service": "quickcrawl",
  "version": "1.0.0"
}
```

## Crawl endpoint

The crawl endpoint validates a public HTTP or HTTPS URL, fetches its HTML,
extracts metadata, cleans the document, and converts the content to Markdown.

### `POST /crawl`

Send a JSON body with one `url` field.

```http
Content-Type: application/json
```

```json
{
  "url": "https://example.com"
}
```

The URL must meet these requirements:

- It must be a valid absolute URL.
- It must use HTTP or HTTPS.
- It must not contain a username or password.
- Its hostname must resolve to public IP addresses.
- Every followed redirect must also resolve to public IP addresses.

QuickCrawl rejects localhost, private, link-local, reserved, multicast, and
other non-public destinations. It follows at most five redirects.

### Successful response

A successful crawl returns `200 OK`. `title` and `metadata` are optional.

```json
{
  "success": true,
  "data": {
    "markdown": "# Example Domain",
    "title": "Example Domain",
    "metadata": {
      "description": "An example page",
      "ogTitle": "Example Domain"
    }
  }
}
```

Metadata can include known fields and additional string-valued HTML metadata.
Known fields include:

- `title`
- `description`
- `author`
- `keywords`
- `ogTitle`
- `ogDescription`
- `ogImage`
- `ogUrl`
- `ogType`
- `twitterCard`
- `twitterSite`
- `twitterCreator`
- `favicon`

### Validation response

An invalid request body returns `422 Unprocessable Entity`. This includes
malformed JSON and JSON that doesn't match the request schema. The `details`
array contains Valibot validation issues when schema validation runs and is empty
when the JSON itself can't be parsed.

```json
{
  "success": false,
  "error": {
    "type": "validation_error",
    "message": "Invalid input",
    "details": []
  }
}
```

### Crawl error response

A crawl failure returns a structured error. The HTTP status depends on the
error type.

```json
{
  "success": false,
  "error": {
    "type": "invalid_url",
    "message": "Private or reserved network addresses are not allowed"
  }
}
```

| Error type      | HTTP status | Meaning                                                         |
| --------------- | ----------: | --------------------------------------------------------------- |
| `invalid_url`   |       `422` | The URL violates protocol, credential, or network-safety rules. |
| `invalid_html`  |       `422` | The response doesn't contain usable HTML.                       |
| `parse_failed`  |       `422` | QuickCrawl couldn't parse or transform the response.            |
| `fetch_failed`  |       `502` | The destination returned a non-successful HTTP response.        |
| `network_error` |       `503` | DNS, transport, redirect, or network processing failed.         |
| `timeout`       |       `504` | The crawl exceeded its server-side timeout.                     |
| `unknown`       |       `500` | An unexpected failure occurred.                                 |

The API returns stable, general messages for network and unexpected failures.
It records the underlying error in server logs without exposing internal
details in the response.

### Rate-limit response

When the request ceiling is exhausted, the endpoint returns `429 Too Many
Requests` and a `Retry-After` header measured in seconds.

```json
{
  "success": false,
  "error": {
    "type": "rate_limit",
    "message": "Rate limit exceeded"
  }
}
```

## Rate limiting

QuickCrawl limits crawl requests before it starts workflow processing. The
defaults permit 10 requests in each 60-second window.

When `TRUST_PROXY=false`, all requests in one application instance share the
same rate-limit identity. When `TRUST_PROXY=true`, QuickCrawl uses the first
`X-Forwarded-For` value as the client identity.

<!-- prettier-ignore -->
> [!WARNING]
> Enable `TRUST_PROXY` only behind a proxy that removes incoming forwarded
> headers and writes the correct client address. Otherwise, clients can forge
> their identity and bypass per-client limits.

Configure the behavior with these environment variables:

```env
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
TRUST_PROXY=false
```

## Caching

QuickCrawl caches successful crawl results in memory by exact URL. Failed
results aren't cached.

The cache expires entries after five minutes by default and stores at most 100
entries. When it reaches capacity, it removes the least recently stored or
updated entry.

```env
CACHE_TTL_MS=300000
CACHE_MAX_SIZE=100
```

The cache and rate limiter are local to each application instance. They aren't
shared across horizontally scaled deployments.

## Client examples

These examples call the local server and handle both HTTP-level and structured
API failures.

### curl

Use curl to inspect a response from the command line.

```bash
curl --request POST http://localhost:3000/crawl \
  --header 'Content-Type: application/json' \
  --data '{"url":"https://example.com"}'
```

### JavaScript and TypeScript

Use the standard Fetch API from a browser or supported Node.js runtime.

```typescript
type CrawlResponse =
  | {
      success: true;
      data: {
        markdown: string;
        title?: string;
        metadata?: Record<string, string>;
      };
    }
  | {
      success: false;
      error: { type: string; message: string };
    };

async function crawlUrl(url: string): Promise<string> {
  const response = await fetch('http://localhost:3000/crawl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const result = (await response.json()) as CrawlResponse;
  if (!response.ok || !result.success) {
    const message = result.success
      ? `Request failed with status ${response.status}`
      : result.error.message;
    throw new Error(message);
  }

  return result.data.markdown;
}
```

### Python

Use the third-party `requests` package when it is available in your Python
environment.

```python
import requests

response = requests.post(
    "http://localhost:3000/crawl",
    json={"url": "https://example.com"},
    timeout=35,
)
response.raise_for_status()
result = response.json()
print(result["data"]["markdown"])
```

## Next steps

Use the [development guide](DEVELOPMENT.md) to run and debug QuickCrawl. Read
the [architecture guide](ARCHITECTURE.md) before changing endpoint behavior,
URL safety, caching, or rate limiting.
