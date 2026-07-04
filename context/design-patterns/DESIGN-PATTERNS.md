<!-- purpose: Code conventions, fp-ts/Effect patterns, review rules, and idioms. Read before introducing new patterns or reviewing code. -->
# Design Patterns

<!-- exodia:section:intro -->
> **Progressive disclosure:** this file holds guardrails only (do/don't, 2-3 lines each). Detailed explanations in `docs/development/`.

<!-- exodia:section:body -->

## fp-ts Patterns

- Always use `pipe` for transformations. Never chain methods imperatively.
- Main types: `fp.TE` (TaskEither), `fp.RTE` (ReaderTaskEither), `fp.O` (Option), `fp.E` (Either), `fp.A` (Array).
- Import: `import { fp, pipe } from "@liexp/core/lib/fp/index.js"`.
- Backend flows are `ReaderTaskEither<Context, ServerError, Result>` — dependency-inject context, never import it directly.
- In tests: `await pipe(myFunction(input)(ctx), throwTE)` — use `throwTE` from `@liexp/shared/lib/utils/fp.utils.js`.

## Effect/Schema

- Use only for HTTP schema definitions. Never use Effect runtime in business logic pipelines.
- All structured output schemas: every property required. `Schema.NullOr(T)` not `Schema.optional(T)`.
- Date fields in schemas: `Schema.DateFromString`. No manual `new Date()` in commands.

## Import Rules

- Always `.js` extension on all imports (even `.ts` source files).
- Import order: external → `@liexp/*` packages → internal.
- Use `type` for type-only imports.
- Import from `lib/` paths (build output): `@liexp/core/lib/fp/index.js` — never `src/`.
- ESLint enforces this; violations are caught at lint time.

## Error Handling

- All internal errors extend `IOError` from `@ts-endpoint/core`.
- Express middleware: `errorHandler(ctx)` from `@liexp/backend`.
- Frontend: `toAPIError(error).message` — never raw `error.message`.
- React: `<ErrorBox error={error} />` or `<ErrorBoundary FallbackComponent={ErrorBox} />`.
- Only validate at boundaries: user input and external API responses.

## Code Quality

- No `console.log` — use the context logger: `ctx.logger.info.log(...)`.
- No comments unless the WHY is non-obvious. No docstrings.
- No `any` without explicit justification.
- No abstractions for < 3 use cases. Duplicate 2 times; abstract on the 3rd.
- Prefix unused variables with underscore: `_unused`.

## Endpoint / Route Pattern

- Custom endpoints: define in `packages/@liexp/shared/src/endpoints/api/`.
- Register with: `AddEndpoint(r)(Endpoints.Resource.Custom.EndpointName, handler)`.
- Flows (backend): `ReaderTaskEither<Context, ServerError, Result>` in `packages/@liexp/backend/src/flows/`.
- Frontend queries: `Queries.Resource.Custom.Name.useQuery(...)` via `useEndpointQueries()` hook.

## Commit Conventions

Format: `<type>(<scope>): <description>`.
Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `revert`, `release`.
Scopes: `workspace`, `deps`, `deps-dev`, `core`, `shared`, `test`, `api`, `web`, `admin`, `worker`, `agent`, `ui`, `backend`.

## Pre-Commit Checklist

1. `pnpm format` (Prettier)
2. `pnpm lint` (ESLint)
3. `pnpm typecheck` (tsc)
4. `pnpm vitest` (tests)
5. `pnpm build` (compilation)

## L3 Data

<!-- exodia:section:l3 -->

- `reviews.jsonl`: findings from PR reviews that revealed bugs or near-misses.
