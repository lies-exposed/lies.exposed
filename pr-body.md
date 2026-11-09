# HOM-1325: WS7 — Agent chat flow and LangChain typing

## Summary

Replace `any` casts with typed generics and runtime type guards across the agent service and backend AI providers.

## Changes

### Agent service (`services/agent`)
- **chat.flow.ts**: Added `isTextContentPart` and `isAIMessageLike` type guard functions. Replaced all `any` casts in `extractContentText`, `extractTokenUsage`, `processStreamEvent`, and `extractResult` with proper guards.
- **cli-executor.tool.ts**: Replaced `tool<any, any, any, any>` with `tool<CliInput, string, never, "liexp_cli">`.
- **events/list.ts**: Replaced `as any` with `as string[]` for `eventType` array.
- **run-command.ts**: Replaced `as any` with `as unknown as`, replaced `any` with `unknown` in Schema types.
- **context/load.ts**: Replaced `as any` with `as string | undefined` for baseURL, `as unknown as` for puppeteer provider.

### Backend AI providers (`packages/@liexp/backend`)
- **agent.factory.ts**: Replaced unsafe `(chat as unknown as { model?: string }).model` cast with `"model" in chat` guard.
- **searchWeb.tools.ts**: Replaced `tool<any, any, any, any>` with `tool<SearchWebInputSchema, string, never, "searchWeb">`.
- **skills.ts**: Replaced `tool<any, any, any, any>` with `tool<{ skill_name: string }, string, never, "load_skill">`.

## Verification

### Lint
```
pnpm --filter agent lint       → 0 errors, 20 warnings (all pre-existing)
pnpm --filter @liexp/backend lint → 0 errors, 94 warnings (all pre-existing)
```

### Tests
```
pnpm --filter agent test       → 5 passed (97 tests), 17 failed (pre-existing module resolution issues)
```

The 17 failing test files are all pre-existing `Cannot find module '#io/ENV.js'` errors unrelated to these changes. All 97 tests in the 5 passing files (including `chat.flow.spec.ts` with 52 tests, `cli-executor.tool.test.ts` with 14 tests) pass.

## Risk assessment
Low-risk: only TypeScript type changes, no runtime behavior changes.
