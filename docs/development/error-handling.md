# Error Handling

<!-- LLM Quick Reference - Action Block -->
<details open>
<summary><strong>Quick Reference (for LLMs)</strong></summary>

```typescript
// Backend: normalize any unknown → IOError → APIError response
import { toControllerError, errorHandler } from "@liexp/backend/lib/express/middleware/error.middleware.js";
import { fromIOError } from "@liexp/shared/lib/utils/APIError.utils.js";

// In an Express error middleware:
app.use(errorHandler(ctx));

// In a flow when you need to convert explicitly:
fp.TE.mapLeft(toControllerError)

// Frontend: normalize any unknown → APIError for display
import { toAPIError } from "@liexp/shared/lib/utils/APIError.utils.js";

catch (error: unknown) {
  notify(toAPIError(error).message, { type: "error" });
}

// In a React component with a query error:
if (isError) return <ErrorBox error={error} resetErrorBoundary={() => {}} />;
```

**Never**: `catch (error: any)` or raw `error.message` — always go through `toAPIError`.

</details>

---

## Error Types

### `IOError` (`@ts-endpoint/core`)

The base class for all internal errors. Constructor: `new IOError(message, details)`.

`details` is a discriminated union:

| `kind` | Extra fields | Numeric `status` |
|--------|-------------|-----------------|
| `"DecodingError"` | `errors: unknown[]` | `600` (internal) |
| `"ClientError"` | `meta?: unknown`, `status: string` | parsed from `status` |
| `"ServerError"` | `meta?: unknown`, `status: string` | parsed from `status` |
| `"NetworkError"` | `meta?: unknown`, `status: string` | parsed from `status` |

The constructor sets `IOError.status: number` from `details.status` automatically.

### Concrete subclasses (all in `@liexp/backend`)

| Class | `kind` | HTTP status |
|-------|--------|-------------|
| `ServerError` | `"ServerError"` | 500 |
| `BadRequestError` | `"ClientError"` | 400 |
| `NotAuthorizedError` | `"ClientError"` | 401 |
| `NotFoundError` | `"ClientError"` | 404 |
| `DBError` | `"ServerError"` | 500 |
| `JWTError` | `"ClientError"` | 401 |
| `RedisError` | `"ServerError"` | 500 |
| `SpaceError` | `"ServerError"` | 500 |
| `FSError` | `"ServerError"` | 500 |
| `DecodeError` | `"DecodingError"` | 400 (after mapping) |

All subclasses live in `packages/@liexp/backend/src/errors/` and `packages/@liexp/backend/src/providers/*/`.

### `APIError` (`@liexp/io`)

The wire format sent to clients. A plain schema-validated object (not a class):

```typescript
{ name: "APIError", message: string, status: 200|201|400|401|403|404|500, details?: string[] }
```

Produced by `fromIOError(ioError)`. Never construct directly — let the pipeline do it.

---

## Backend Pipeline

```
unknown thrown value
  → toControllerError()   — normalises to IOError
  → fromIOError()         — serialises to APIError
  → res.status(status).send(apiError)
```

### `toControllerError(e: unknown): IOError`

Location: `@liexp/backend/lib/express/middleware/error.middleware.js`

Priority order:
1. `instanceof IOError` → return as-is
2. `Schema.is(IOErrorSchema)` → reconstruct `IOError` (cross-module-boundary fallback)
3. `instanceof UnauthorizedError` (express-jwt) → `NotAuthorizedError` (401)
4. `instanceof Error` → wrap as 500 `ServerError`
5. Unknown → wrap as 500 with JSON-serialised payload

### `errorHandler(ctx: LoggerContext)` — Express middleware

Location: `@liexp/backend/lib/express/middleware/error.middleware.js`

Logs the error then calls `fromIOError(toControllerError(err))`.
Register it as the last middleware: `app.use(errorHandler(ctx))`.

All three backend services (api, agent, ai-bot) share this implementation.

### `fromIOError(e: IOError): APIError`

Location: `@liexp/shared/lib/utils/APIError.utils.js`

Maps `IOError.status` + `IOError.details.kind` to a valid `APIStatusCode` and
converts `details` to `string[]` via `detailsToStrings`:

- `"DecodingError"` → `errors.map(String)` (preserves Effect `ParseError.toString()`)
- All other kinds → `meta.map(JSON.stringify-for-non-strings)`
- Returns `undefined` when there is nothing meaningful to surface

### `toAPIError(e: unknown): APIError`

Location: `@liexp/shared/lib/utils/APIError.utils.js`

General-purpose converter for contexts where you don't control the error type
(AI flows, HTTP client callbacks, etc.). Handles `APIError`, `IOError`,
schema-shaped IOError, `Error`, and unknown values.

**Use `fromIOError(toControllerError(e))` in Express middleware** — it's more
direct. Reserve `toAPIError` for places where the input is genuinely `unknown`.

---

## Frontend Patterns

### Displaying errors from queries

```tsx
// QueriesRenderer handles this automatically for TanStack Query results.
// For manual query usage:
const { data, isError, error } = useSomeQuery(...);

if (isError) {
  return <ErrorBox error={error} resetErrorBoundary={() => {}} />;
}
```

`QueriesRenderer` collects errors from multiple queries and renders an `ErrorBox`
per error automatically.

### `ErrorBox` component

Location: `packages/@liexp/ui/src/components/Common/ErrorBox.tsx`

Accepts any value. Internally calls `toAPIError` to normalise it, then renders:
- Error name + HTTP status (when `APIError`)
- Message
- Expandable `details[]` accordion

Implements `FallbackProps` so it works directly as an `<ErrorBoundary FallbackComponent={ErrorBox}>`.

```tsx
// As a React error boundary fallback:
<ErrorBoundary FallbackComponent={ErrorBox}>
  <MyFeature />
</ErrorBoundary>

// Resettable variant:
<ResettableErrorBox error={error} resetErrorBoundary={reset} />
```

### Error boundaries

The web service wraps all routes in a top-level boundary. Add one for any subtree
that can fail independently:

```tsx
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBox } from "@liexp/ui/lib/components/Common/ErrorBox.js";

<ErrorBoundary FallbackComponent={ErrorBox}>
  <MyFeature />
</ErrorBoundary>
```

### Button / mutation error handlers

Always use `toAPIError` — never access `.message` on an untyped error:

```tsx
// ✅ Correct
catch (error: unknown) {
  notify(toAPIError(error).message, { type: "error" });
}

// ❌ Wrong — error.message is the Axios transport message, not the server message
catch (error: any) {
  notify(error.message, { type: "error" });
}
```

### Auth provider (401 detection)

`GetAuthProvider` in `packages/@liexp/ui/src/client/api.ts` uses
`Schema.is(APIError)(error)` before accessing `.status` — this is the correct
pattern for type-safe error shape inspection.

---

## Utilities

| Function | Package | Returns | Use when |
|----------|---------|---------|----------|
| `toControllerError` | `@liexp/backend` | `IOError` | Express middleware / flow error channel |
| `fromIOError` | `@liexp/shared` | `APIError` | You already have an `IOError` |
| `toAPIError` | `@liexp/shared` | `APIError` | Input is genuinely `unknown` |
| `reportIOErrorDetails` | `@liexp/shared` | `string` | Logging / debug output |
| `decodeIOErrorDetails` | `@liexp/shared` | `string[]` | When you need the array form |
| `errorHandler` | `@liexp/backend` | Express handler | Register as last middleware |
