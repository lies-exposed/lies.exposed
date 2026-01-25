---
applyTo: "**/*.ts,**/*.tsx"
---

# Functional Programming Instructions

> **Full documentation**: [docs/development/functional-programming.md](../../docs/development/functional-programming.md)

## Quick Reference (LLM Action Block)

### Essential Imports
```typescript
import { fp, pipe, flow } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
```

### Core fp-ts Aliases
| Alias | Module | Use For |
|-------|--------|---------|
| `fp.TE` | TaskEither | Async with errors |
| `fp.RTE` | ReaderTaskEither | Async + dependency injection |
| `fp.E` | Either | Sync errors |
| `fp.O` | Option | Nullable values |
| `fp.A` | ReadonlyArray | Array operations |

### Basic Pattern
```typescript
const processData = pipe(
  input,
  fp.TE.chain(validate),
  fp.TE.map(transform),
  fp.TE.mapLeft(toError)
);
```

### ReaderTaskEither (Dependency Injection)
```typescript
type Deps = { db: Database; logger: Logger };

const fetchUser = (id: string): fp.RTE.ReaderTaskEither<Deps, Error, User> =>
  pipe(
    fp.RTE.ask<Deps>(),
    fp.RTE.chainTaskEitherK(({ db }) => db.findUser(id)),
    fp.RTE.chainFirst(({ logger }) =>
      fp.RTE.fromIO(() => logger.info.log("User fetched"))
    )
  );
```

### Effect Schema Pattern
```typescript
import { Schema } from "effect";

const MySchema = Schema.Struct({
  id: UUID,
  name: Schema.String,
  optional: Schema.NullOr(Schema.String),
}).annotations({ title: "MySchema" });

type MyType = typeof MySchema.Type;
const result = Schema.decodeUnknownEither(MySchema)(data);
```

### Testing with throwTE
```typescript
// In tests, convert TaskEither to Promise
const result = await pipe(
  myFunction(input)(ctx),
  throwTE  // Throws Left, returns Right
);
```

### Critical Rules

**ALWAYS**:
- Use `pipe` for transformations
- Use `fp.TE` for async operations
- Use `fp.O` for nullable values
- Return explicit error types

**NEVER**:
```typescript
// ❌ Imperative style
let result;
try {
  result = await asyncOp();
} catch (e) {
  result = handleError(e);
}

// ✅ Functional style
const result = pipe(
  asyncOp(),
  fp.TE.mapLeft(handleError)
);
```
