---
name: liexp-fp-ts
description: lies.exposed conventions for fp-ts code — the `fp` barrel import, lib/ vs src/ imports, throwTE/throwRTE test helpers, per-service error mappers, and repo-specific traps (effect Option, OpenAI schemas). Use together with the generic `fp-ts` skill when writing or reviewing flows in this monorepo.
---

# fp-ts in lies.exposed

Generic fp-ts usage (Do notation, `bindW`, traverse, bracket, ...) lives in the user-scope `fp-ts` skill. This file only covers what is specific to this repo.

## The `fp` barrel

Import everything from one place (`packages/@liexp/core/src/fp/index.ts`):

```typescript
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import type { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import type { TaskEither } from "fp-ts/lib/TaskEither.js";
```

`fp.X` is the fp-ts module `X`, so the generic skill's `RTE.bind` is `fp.RTE.bind` here:

`fp.A` (ReadonlyArray), `E`, `O`, `TE`, `T`, `RTE`, `R`, `IO`, `IOE`, `NEA`, `Rec`, `Map`, `Ord`, `Eq`, `Json`, `S`, `N`, `Void`, `Date`, `sequenceS`, `sequenceT`, `Utils` (`Utils.A`, `Utils.O`, `Utils.NEA`: repo helpers). `pipe` and `flow` are separate exports.

- `fp` is a runtime object, **not a type namespace**: write `ReaderTaskEither<C, E, A>` (imported from fp-ts), never `fp.RTE.ReaderTaskEither<...>`.
- Cross-package imports use `lib/` (build output), never `src/`, and always the `.js` extension. Service-internal aliases (`#flows/...`, `#types/*`) also take `.js` where they resolve to files.
- Backend flows are `ReaderTaskEither<Context, ServerError, Result>` under `packages/@liexp/backend/src/flows/`.

## Tests

```typescript
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";

const a = await pipe(taskEitherFlow(), throwTE);
const b = await pipe(rteFlow("1"), throwRTE(ctx));   // applies the context, rejects with the Left
```

For API e2e tests see `docs/testing/e2e-tests.md` (`GetAppTest()` pattern).

## Error mappers

Each service owns its mapper; import the one for the service you are in:
`toAPIError` (`@liexp/shared/lib/utils/APIError.utils.js`), `toControllerError` (backend express middleware), `toAIBotError` (`services/ai-bot/src/common/error`), `toWorkerError` (`services/worker/src/io/worker.error`).

## Repo-specific traps

- `OptionFromNullishToNull(...)` returns `effect/Option`, not `fp-ts/Option`. Use `O.getOrNull` from `effect/Option`; fp-ts `O.toNullable` on it makes TypeORM serialize the wrapper object.
- OpenAI structured-output schemas: every property required, use `Schema.NullOr()`, never `Schema.optional()` (`docs/ai/openai-schemas.md`).

## See also

`docs/development/functional-programming.md` for the project-level rules (fp-ts and Effect Schema).
