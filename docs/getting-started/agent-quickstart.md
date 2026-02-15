---
title: Agent Quickstart
type: note
permalink: getting-started/agent-quickstart
tags:
- agent
- quickstart
- onboarding
- basic-memory
---

# Agent Quickstart - Using Basic Memory

## How to Use This Knowledge Base

When starting work on this repository, **always query basic-memory first** before reading source code. This follows the project's "documentation first" principle.

## Step 1: Orient Yourself

```
build_context("memory://README") → project overview & architecture diagram
build_context("memory://services/*") → all service documentation
build_context("memory://packages/*") → all package documentation
```

## Step 2: Find Relevant Context for Your Task

### Working on a specific service?
- `search_notes("api")` → API service docs, endpoints, MCP integration
- `search_notes("admin")` → Admin UI, react-admin patterns
- `search_notes("web")` → Web frontend, SSR, Vite
- `search_notes("worker")` → Background jobs, social media automation
- `search_notes("agent")` → AI agent service, LangChain/LangGraph

### Working on a package?
- `read_note("backend")` → @liexp/backend flows, TypeORM, ServerContext
- `read_note("shared")` → @liexp/shared endpoints, domain models
- `read_note("ui")` → @liexp/ui React components
- `read_note("core")` → @liexp/core utilities
- `read_note("test")` → @liexp/test arbitraries, helpers

### Writing tests?
- `read_note("e2e-tests")` → E2E test patterns, AppTest bootstrap
- `read_note("unit-tests")` → Unit test patterns, vitest
- `read_note("test-utils")` → Shared test utilities

### Working on MCP tools?
- `read_note("mcp-tool-workflows")` → Tool usage patterns for AI agents
- `read_note("mcp-tools-complexity-analysis")` → Tool parameter analysis
- `read_note("mcp-validation-errors")` → Common validation issues

### Working on AI/OpenAI integration?
- `read_note("openai-schemas")` → Structured output requirements (CRITICAL: no optional props)

### Working on deployment?
- `read_note("helm")` → Helm chart structure
- `read_note("kubernetes")` → Remote cluster access via kubectl

### Working on functional programming patterns?
- `read_note("functional-programming")` → fp-ts and Effect patterns

## Step 3: Key Patterns to Remember

### Architecture Quick Reference

| Pattern | Location | Notes |
|---------|----------|-------|
| Route handlers | `services/api/src/routes/` | Use `AddEndpoint(r)(Endpoint, handler)` |
| Business logic | `packages/@liexp/backend/src/flows/` | `ReaderTaskEither<Context, ServerError, Result>` |
| Endpoint definitions | `packages/@liexp/shared/src/endpoints/api/` | Shared between FE/BE |
| Domain models | `packages/@liexp/shared/src/io/http/` | Effect Schema types |
| React components | `packages/@liexp/ui/src/components/` | Build to `lib/` before use |
| E2E tests | `services/api/src/routes/<resource>/__tests__/` | Use `GetAppTest()` |

### Critical Gotchas

1. **Effect vs fp-ts Option**: `OptionFromNullishToNull()` returns `effect/Option` — use `O.getOrNull()`, NOT `O.toNullable()`
2. **Build before typecheck**: Storybook imports from `@liexp/ui/lib/` — run `pnpm --filter @liexp/ui run build` first
3. **OpenAI schemas**: ALL properties must be required — use `Schema.NullOr()` not `Schema.optional()`
4. **Source files only**: Edit `src/` directories, never `lib/` or `build/`

## Step 4: Record What You Learn

After completing work, write notes for future agents:

```
write_note({
  title: "descriptive-title",
  folder: "appropriate-folder",  // services/, packages/, development/, testing/, ai/
  tags: ["relevant", "tags"],
  content: "What you learned..."
})
```

### Good candidates for new notes:
- Bug fixes with non-obvious root causes
- New patterns or conventions discovered
- Integration gotchas between services
- Performance findings
