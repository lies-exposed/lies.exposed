# Functional Programming Patterns

<!-- LLM Quick Reference - Action Block -->
<details open>
<summary><strong>Quick Reference (for LLMs)</strong></summary>

```typescript
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";

// Pattern: pipe + TaskEither
const result = pipe(
  input,
  fp.TE.chain(validate),
  fp.TE.map(transform),
  fp.TE.mapLeft(toError)
);

// In tests: use throwTE
const data = await pipe(myFunction(input)(ctx), throwTE);
```

**Aliases**: `fp.TE` (TaskEither), `fp.RTE` (ReaderTaskEither), `fp.O` (Option), `fp.E` (Either), `fp.A` (Array)

**Never**: Mix imperative and functional styles. Use `pipe` for all transformations.

</details>

---

The codebase follows functional programming principles using two main libraries: **fp-ts** and **Effect**.

## fp-ts

### Purpose

Core functional programming utilities for TypeScript used throughout the codebase for:
- Data transformation pipelines (`pipe`, `flow`)
- Error handling with `Either` and `Option` types
- Asynchronous operations with `TaskEither` and `ReaderTaskEither`
- Array and object manipulations with type safety

### Basic Pattern

```typescript
import { fp, pipe } from "@liexp/core/lib/fp/index.js";

const processData = pipe(
  fp.RTE.Do,
  fp.RTE.bind("users", () => fetchUsers()),
  fp.RTE.bind("events", ({ users }) => fetchEventsForUsers(users)),
  fp.RTE.map(({ users, events }) => mergeData(users, events)),
  fp.RTE.mapLeft(toAPIError)
);
```

### ReaderTaskEither Pattern

All packages follow fp-ts patterns with ReaderTaskEither for dependency injection:

```typescript
import { fp, pipe } from "@liexp/core/lib/fp/index.js";

type Dependencies = {
  api: API;
  logger: Logger;
};

const fetchAndProcess = (id: string): fp.RTE.ReaderTaskEither<Dependencies, Error, Result> =>
  pipe(
    fp.RTE.ask<Dependencies>(),
    fp.RTE.chainTaskEitherK(({ api }) => api.Actor.Get({ Params: { id } })),
    fp.RTE.chainFirst(({ logger }) =>
      fp.RTE.fromIO(() => logger.info.log("Actor fetched"))
    ),
    fp.RTE.map(processActor)
  );
```

### Available fp-ts Modules

| Alias | Module | Purpose |
|-------|--------|---------|
| `fp.A` | `ReadonlyArray` | Immutable array operations |
| `fp.E` | `Either` | Error handling with left/right values |
| `fp.O` | `Option` | Optional value handling |
| `fp.TE` | `TaskEither` | Async operations with error handling |
| `fp.RTE` | `ReaderTaskEither` | Dependency injection with async error handling |
| `fp.NEA` | `NonEmptyArray` | Non-empty array operations |
| `fp.Ord` | `Ord` | Ordering and comparison |
| `fp.Eq` | `Eq` | Equality comparison |

## Effect

### Purpose

Modern functional effects system for TypeScript, gradually replacing fp-ts in new code for:
- More ergonomic error handling
- Better composition of effects
- Enhanced type inference
- Schema validation and transformation

### Effect Schema Pattern

Domain types use Effect schemas for validation:

```typescript
import { Schema } from "effect";

const MySchema = Schema.Struct({
  id: UUID,
  name: Schema.String,
  optional: Schema.Union(Schema.String, Schema.Null),
}).annotations({
  title: "MySchema",
  description: "Description for documentation",
});

type MyType = typeof MySchema.Type;

// Validation
const result = Schema.decodeUnknownEither(MySchema)(data);
```

### State Management Pattern

```typescript
// State update pattern
const updateState = pipe(
  Effect.Do,
  Effect.bind("current", () => getCurrentState),
  Effect.bind("new", ({ current }) => validateAndTransform(current)),
  Effect.tap(({ new }) => persistState(new))
)

// Async state management
const fetchAndProcess = pipe(
  fetchData,
  Effect.flatMap(processData),
  Effect.catchAll(handleError),
  Effect.provideService(LoggerLive)
)
```

## Key Principles

1. **Prefer immutable data structures**
2. **Use pure functions with explicit side effects**
3. **Leverage type-level programming for better safety**
4. **Compose operations using function composition**

## Common Anti-Patterns

### Bad: Imperative Style

```typescript
// Don't do this
let result;
try {
  const validated = validateData(input);
  result = processData(validated);
} catch (error) {
  result = toControllerError(error);
}
```

### Good: Functional Style

```typescript
// Do this instead
const result = pipe(
  input,
  validateData,
  fp.TE.chain(processData),
  fp.TE.mapLeft(toControllerError)
);
```

## Testing with TaskEither

In tests, use `throwTE` to convert TaskEither to Promise:

```typescript
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";

it("should process data", async () => {
  const result = await pipe(
    functionUnderTest(testData)(mockCtx),
    throwTE // Converts TaskEither to Promise
  );

  expect(result).toMatchObject(expectedResult);
});
```
