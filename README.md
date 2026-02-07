```
npm install
npm run dev
```

```
open http://localhost:3000
```

## Type System

This project uses advanced TypeScript features for compile-time safety:

### Discriminated Unions

Each workflow stage is represented as a distinct type with guaranteed fields:

- `initial`: Only has `url`
- `fetched`: Has `url`, `html`, optional `title`
- `metadata_extracted`: Adds `metadata`
- `parsed`: Adds `document`
- `cleaned`: Adds `cleanedDocument`
- `completed`: Adds `markdown`
- `error`: Contains error information

### Type Guards

Use type guards to safely narrow context types:

```typescript
import { isFetched, isCompleted } from './workflows/crawl/guards';

if (isFetched(ctx)) {
  // TypeScript knows ctx.html exists
  console.log(ctx.html);
}

if (isCompleted(ctx)) {
  // TypeScript knows ctx.markdown exists
  return ctx.markdown;
}
```

### Result Type

API responses use a Result type for type-safe error handling:

```typescript
type Result<T, E> = Success<T> | Failure<E>;
```

Success responses include `success: true` and `data`; failure responses include `success: false` and `error`.
# quickcrawl
