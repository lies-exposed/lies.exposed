---
name: agent-test
description: How to test agent responses when editing prompts or logic in services/agent. Covers the three test tiers (spec, e2e, eval), when to use each, and the full workflow for editing prompts, running tests, and recording eval fixtures.
---

# Agent Testing Guide

The agent service has **three test tiers** that serve different purposes. Use the right tier for the change you're making.

## Three Test Tiers

| Tier | Config | Pattern | When to use |
|------|--------|---------|-------------|
| **Spec** | `vitest.config.spec.ts` | Unit tests with MSW mocks | Testing pure functions, flow logic, error paths |
| **E2E** | `vitest.config.e2e.ts` | Integration tests with real context | Testing HTTP endpoints, auth, SSE streaming |
| **Eval** | `vitest.config.eval.ts` | LLM-backed tests with caching | Testing actual prompt behavior, tool calls, agent responses (hits the shared dev API/DB via `.env.local`) |

Run all three after editing prompts or logic that touches data persistence:

```bash
pnpm --filter agent test:spec      # Unit tests
pnpm --filter agent test:e2e       # Integration tests
pnpm --filter agent test:eval      # LLM eval tests (shared dev DB)
```

## When to Use Each Tier

### Spec tests — `*.spec.ts`
Use when testing **pure functions** or **flow logic** that doesn't require an LLM:
- `parseThinkContent`, `processStreamEvent`, `trailingPartialTag`, `isSupervisorEvent`
- `buildEnhancedMessage` (resource context injection)
- `sendChatMessage` / `sendChatMessageStream` with mocked agent factory

These run fast, use MSW for HTTP mocks, and mock the agent factory to return predetermined responses.

### E2E tests — `*.e2e.ts`
Use when testing **HTTP endpoints** or **SSE streaming** through the full Express app:
- Auth headers, JWT verification, 401 responses
- SSE event format and parsing from HTTP responses
- Conversation CRUD via REST endpoints

These use `GetAgentTest()` which loads a real context with mocked agent factory.

### Eval tests — `*.eval.ts`
Use when testing **actual LLM behavior** — what the agent does with real prompts:
- Does the agent call `liexp_cli` with the right command?
- Does it skip `liexp_cli` for web research requests?
- Does the stream shape match expectations?

These hit a real LLM (via `.env.local` credentials) but cache results so passing tests skip on re-run.
Note: the existing `agent-pipeline.eval.ts` tests write through `liexp_cli` to the **shared dev API/DB**
(`api.liexp.dev`) — fine for asserting tool-call shape, but not a place to add assertions that
depend on exact DB state, and cleanup after a failed test is on you.

## File Locations

```
services/agent/
  AGENTS.md                          ← Platform Manager system prompt
  RESEARCHER.md                      ← Researcher system prompt
  skills/*.md                        ← Skill files (appended to system prompt)
  src/flows/chat/__tests__/
    chat.flow.spec.ts                ← Spec tests for chat flow
    agent-pipeline.eval.ts           ← Eval tests for prompt behavior (shared dev DB)
    link-ingestion.eval.ts           ← Eval test: bare URL → skill-driven link create
    link-to-event.eval.ts            ← Eval test: 2-turn, skill-driven URL → link → event
  src/routes/chat/__tests__/
    chat.controller.e2e.ts           ← E2E tests for HTTP endpoints
  test/
    AppTest.ts                       ← Mock agent factory + test helpers
    evalCache.ts                     ← cachedTest() wrapper
    evalContext.ts                   ← loadEvalContext() for real LLM
    evalDebug.ts                     ← HTTP traffic recording/replay
    evalCacheReporter.ts             ← Vitest reporter for cache persistence
    evalSetup.ts                     ← Loads .env.local for eval tests
    evalDbGlobalSetup.ts             ← Once-per-run: throwaway liexp_test DB + api-test server
    evalDbSetup.ts                   ← Per-worker: injects API_BASE_URL/API_TOKEN/DB_* from runtime JSON
    specSetup.ts                     ← MSW lifecycle for spec tests
```

## Workflow: Editing Prompts

### 1. Edit the prompt file
Edit `AGENTS.md` (Platform Manager) or `RESEARCHER.md` (Researcher) in the service root.

### 2. Run spec tests first
```bash
pnpm --filter agent test:spec
```
These are fast and catch logic errors without needing an LLM.

### 3. Run e2e tests
```bash
pnpm --filter agent test:e2e
```
These verify the HTTP layer still works correctly.

### 4. Run eval tests (record new fixtures)
```bash
pnpm --filter agent test:eval:record
```
This runs with `DEBUG_EVAL=1`, which records HTTP request/response pairs to `.eval-debug/http/`. It also writes processed events to `.eval-debug/<test-name>.json`.

### 5. Replay with cached fixtures
```bash
pnpm --filter agent test:eval:replay
```
This replays the recorded fixtures instead of hitting the real LLM. Use this to verify tests pass without LLM cost.

### 6. Commit the fixtures
The recorded fixtures in `.eval-debug/http/` and `.eval-cache.json` should be committed so other developers can replay without an LLM.

## Writing New Tests

### Spec tests
```typescript
import { describe, expect, test, vi, beforeEach } from "vitest";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type AgentContext } from "../../../context/context.type.js";
import { yourFunction } from "../yourModule.js";

const createMockContext = (overrides?: Partial<AgentContext>): AgentContext => ({
  env: { NODE_ENV: "test", JWT_SECRET: "test-secret" } as any,
  logger: GetLogger("test"),
  agentFactory: vi.fn().mockReturnValue(TE.right({
    invoke: vi.fn().mockResolvedValue({ messages: [] }),
    streamEvents: vi.fn().mockImplementation(() => []),
  })),
  fs: { getObject: vi.fn().mockReturnValue(TE.right("# Mock")) } as any,
  ...overrides,
});

describe("yourFunction", () => {
  let ctx: AgentContext;
  beforeEach(() => { ctx = createMockContext(); vi.clearAllMocks(); });

  test("should do X", async () => {
    const result = await pipe(yourFunction(args)(ctx))();
    expect(result._tag).toBe("Right");
  });
});
```

### Eval tests
```typescript
import { describe, expect, beforeAll } from "vitest";
import { cachedTest } from "../../../../test/evalCache.js";
import { loadEvalContext } from "../../../../test/evalContext.js";
import { debugEvents, debugRawEvents } from "../../../../test/evalDebug.js";
import { type AgentContext } from "../../../context/context.type.js";
import { sendChatMessageStream } from "../chat.flow.js";

let ctx: AgentContext;
beforeAll(async () => { ctx = await loadEvalContext(); });

describe("agent behavior", () => {
  cachedTest("agent calls liexp_cli for actor queries", async () => {
    const events = await collectEvents(ctx, "list actors");
    const cliCalls = events.filter(e => 
      e.type === "tool_call_start" && e.tool_call?.name === "liexp_cli"
    );
    expect(cliCalls.length).toBeGreaterThan(0);
  });
});

const collectEvents = async (ctx: AgentContext, message: string) => {
  const events = [];
  for await (const e of sendChatMessageStream({ message, conversation_id: null })(ctx)) {
    events.push(e);
  }
  return events;
};
```

## Key Patterns

### Mocking the agent factory (spec/e2e)
The agent factory is the main injection point. Mock it to control what the agent returns:

```typescript
agentFactory: vi.fn().mockReturnValue(TE.right({
  invoke: vi.fn().mockResolvedValue({
    messages: [{ id: "test", content: "Expected response" }],
  }),
  streamEvents: vi.fn().mockImplementation(function* () {
    yield { event: "on_chat_model_stream", data: { chunk: { content: "stream" } } };
  }),
}))
```

### Testing tool calls in eval tests
```typescript
const toolCallStarts = (events: ChatStreamEvent[]) =>
  events.filter((e): e is ChatStreamEvent & { type: "tool_call_start" } =>
    e.type === "tool_call_start" && e.tool_call !== undefined
  );

const toolArgs = (event: ChatStreamEvent & { type: "tool_call_start" }) =>
  event.tool_call.arguments ?? "{}";
```

### Think tag parsing
The agent handles `<thinking>` tags incrementally during streaming. Test with:
- Complete tags in single chunk: `"before<thinking>thought</thinking>after"`
- Partial tags spanning chunks: chunk 1 ends with `<thinki`, chunk 2 continues `ng>thought</thinking>end`
- Verify `thinking: true` flag on content_delta events inside think blocks

### SSE streaming shape
Every response should follow this event sequence:
```
message_start → content_delta* → tool_call_start → tool_call_end* → message_end
```

## Environment Variables

| Variable | Purpose | Used by |
|----------|---------|---------|
| `DEBUG_EVAL=1` | Record HTTP traffic to `.eval-debug/http/` | Eval tests |
| `REPLAY_EVAL=1` | Replay recorded fixtures, skip real LLM | Eval tests |
| `AI_PROVIDER` | `openai` / `anthropic` / `xai` | Eval context |
| `LOCALAI_MODEL` | Model name for eval | Eval context |
| `.env.local` | API keys and endpoints | Eval tests |

## Common Pitfalls

1. **Forget to re-record fixtures** — After changing prompts, run `test:eval:record` to update `.eval-debug/http/` fixtures. Old fixtures cause replay failures.

2. **Cache skips failed tests** — `.eval-cache.json` only stores passing tests. Failed tests are removed from cache so they re-run. This is intentional.

3. **MSW breaks eval tests** — MSW intercepts Node.js fetch and breaks LLM streaming. Eval tests intentionally do NOT use MSW. Spec tests use MSW.

4. **fs path resolution** — The eval context overrides `fs.getObject` to resolve prompt files from the service root, not the monorepo root. Don't rely on `process.cwd()` in prompt files.

5. **Tool results in eval tests** — LangGraph's `createReactAgent` may not emit `on_tool_end` events in all configurations. The `agent-pipeline.eval.ts` has a documented bug about this.

6. **"No response generated" — reasoning mode mismatch** — Some models (e.g. `qwen3.6-35b-a3b`) stream all tokens into `delta.reasoning` (thinking mode) and leave `delta.content` null. LangChain's `delta.content` reader sees empty content → agent returns "No response generated". This is a model/server-side issue, not a code bug. Fix: disable reasoning mode on the model config, or pick a non-reasoning model. Eval tests can catch this — check that `content_delta` events have non-null `content`.

 7. **Port 4010 already in use** — `evalDbGlobalSetup.ts` starts `api-test` on port 4010, same port `services/api/.env.test` uses for its own e2e tests. Don't run `pnpm --filter agent test:eval` at the same time as `pnpm --filter api test:e2e` locally.

 8. **`liexp_test` DB drop hangs** — `recreateTestDatabase()` terminates other backends on `liexp_test` before dropping it, but if a previous eval run was killed (not stopped cleanly) its `api-test` process may still hold connections. Check `ps aux | grep 'tsx src/run.ts'` and kill any orphaned process, then rerun.

 9. **Eval test hangs waiting for healthcheck** — Usually means `services/api` failed to boot against `liexp_test` (bad env, port conflict, or the local Postgres at `127.0.0.1:8432` isn't running — the `db.liexp.dev` compose service must be up). Rerun with `DEBUG_EVAL=1` to inherit the api-test process's stdout instead of swallowing it (`evalDbGlobalSetup.ts` sets `stdio: "inherit"` only in that mode).

## Running All Tests

```bash
pnpm --filter agent test          # Runs all three projects (spec + e2e + eval)
pnpm --filter agent test:spec     # Spec only
pnpm --filter agent test:e2e      # E2E only
pnpm --filter agent test:eval     # Eval only (requires API keys)
pnpm --filter agent test:coverage # Coverage for spec tests
```

## Debugging

- `DEBUG_EVAL=1` — Records HTTP traffic and event logs for inspection
- `REPLAY_EVAL=1` — Replay without LLM to isolate test logic from LLM behavior
- Check `.eval-debug/<test-name>.json` for processed event sequences
- Check `.eval-debug/<test-name>-raw.json` for raw LangGraph stream events
- Check `.eval-debug/http/` for HTTP request/response pairs
