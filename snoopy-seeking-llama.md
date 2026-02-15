# Plan: Reduce Agent LLM Token Usage (~21K → ~6-8K)

## Context

The agent sends ~21K tokens per LLM request to LocalAI (qwen3-4b on Intel Iris Xe iGPU). Even with SYCL GPU acceleration, processing takes ~5-7 minutes, causing the ChatUI SSE stream to timeout. The bloat comes from 3 sources:

1. **38 tool definitions** with verbose descriptions, examples, and duplicated instructions (~15K tokens)
2. **System prompt** (AGENTS.md) at ~4K tokens repeating the same "search before creating" patterns already in tool descriptions
3. **9 deprecated tools** still registered (createBookEvent, createQuoteEvent, createPatentEvent, createScientificStudyEvent, createDeathEvent, createDocumentaryEvent, createTransactionEvent, createUncategorizedEvent, uploadMediaFromURL)

## Approach: Three-Part Token Reduction

### Part 1: Remove 9 deprecated tools (~40% reduction)

The deprecated tools are fully replaced by `createEvent` (unified). Remove their registrations from the MCP server.

**File: `services/api/src/routes/mcp/tools/events/event.tools.ts`**
- Remove `server.registerTool()` calls for: `CREATE_UNCATEGORIZED_EVENT`, `CREATE_BOOK_EVENT`, `CREATE_QUOTE_EVENT`, `CREATE_PATENT_EVENT`, `CREATE_SCIENTIFIC_STUDY_EVENT`, `CREATE_DEATH_EVENT`, `CREATE_DOCUMENTARY_EVENT`, `CREATE_TRANSACTION_EVENT`

**File: `services/api/src/routes/mcp/tools/media/media.tools.ts`**
- Remove `server.registerTool()` for `uploadMediaFromURL` (deprecated in favor of `createMedia`)

This alone eliminates ~8K tokens (9 tools × ~900 tokens average).

### Part 2: Shorten tool descriptions (~30% reduction)

Current descriptions embed search strategies, workflows, JSON examples, and behavioral notes inline. Most of this is duplicated from the system prompt. Trim to essentials:

**Principle:** Tool descriptions should say WHAT the tool does + parameters. HOW to use tools (search-first workflow, examples, patterns) belongs in the system prompt only.

**Before (~700 chars):**
```
Search for persons in the database by name or group membership. ALWAYS search before creating.

SEARCH STRATEGY - Always try multiple name variations...
For "Donald Trump": Search: "Donald Trump" (full name), "Trump" (last name)...
SEARCH CRITERIA: fullName, memberIn, withDeleted, sort, order
CRITICAL TIPS: ALWAYS search multiple times...
```

**After (~120 chars):**
```
Search for persons by name or group membership. Use fullName for partial match, memberIn to filter by group UUIDs.
```

Apply same pattern to all 29 remaining tools. Move examples and strategies to system prompt.

**Files to modify:**
- `services/api/src/routes/mcp/tools/actors/actor.tools.ts` — 4 tools
- `services/api/src/routes/mcp/tools/groups/group.tools.ts` — 4 tools
- `services/api/src/routes/mcp/tools/events/event.tools.ts` — 3 tools (find, get, create unified, edit)
- `services/api/src/routes/mcp/tools/areas/area.tools.ts` — 4 tools
- `services/api/src/routes/mcp/tools/links/link.tools.ts` — 4 tools
- `services/api/src/routes/mcp/tools/media/media.tools.ts` — 4 tools (after removing deprecated)
- `services/api/src/routes/mcp/tools/nations/nations.tools.ts` — 2 tools
- `services/api/src/routes/mcp/tools/blockNoteToText.tool.ts` — 1 tool

### Part 3: Trim system prompt (AGENTS.md)

The system prompt has redundancy (search-first instructions repeated 5+ times). Consolidate to a concise version:

**File: `services/agent/AGENTS.md`**

Keep:
- Identity/purpose (2 lines)
- Search-before-create rule (once, with compact examples)
- Edit tool behavior (omit/null semantics)
- Recursion limit (25)

Remove:
- Verbose search strategy examples (moved from tool descriptions, no need to duplicate)
- 4 "Common Tool Patterns" (the tool descriptions + schemas make these self-evident)
- Detailed fact-checking/ethics guidelines (not relevant for token budget)
- Redundant "Data Access" section listing tools (LLM already sees tool list)

Target: ~1.5K tokens (down from ~4K)

## Expected Results

| Component | Before | After | Savings |
|---|---|---|---|
| Deprecated tools (9) | ~8K tokens | 0 | -8K |
| Tool descriptions (29) | ~7K tokens | ~3K tokens | -4K |
| System prompt | ~4K tokens | ~1.5K tokens | -2.5K |
| Input schemas (unchanged) | ~2K tokens | ~2K tokens | 0 |
| **Total** | **~21K** | **~6.5K** | **~14.5K** |

Processing time should drop from ~5-7 min to ~1-2 min on Intel Iris Xe.

## Files to Modify

1. `services/api/src/routes/mcp/tools/events/event.tools.ts` — remove 8 deprecated tools, shorten 4 remaining
2. `services/api/src/routes/mcp/tools/media/media.tools.ts` — remove 1 deprecated tool, shorten remaining
3. `services/api/src/routes/mcp/tools/actors/actor.tools.ts` — shorten 4 descriptions
4. `services/api/src/routes/mcp/tools/groups/group.tools.ts` — shorten 4 descriptions
5. `services/api/src/routes/mcp/tools/areas/area.tools.ts` — shorten 4 descriptions
6. `services/api/src/routes/mcp/tools/links/link.tools.ts` — shorten 4 descriptions
7. `services/api/src/routes/mcp/tools/nations/nations.tools.ts` — shorten 2 descriptions
8. `services/api/src/routes/mcp/tools/blockNoteToText.tool.ts` — already short, minor trim
9. `services/agent/AGENTS.md` — consolidate system prompt

## Verification

1. Rebuild API: `pnpm --filter api run build`
2. Restart API and agent containers
3. Send a chat message and check LocalAI logs for token count (look for `task.n_tokens`)
4. Verify the agent still correctly uses tools (search, create, edit) by testing in ChatUI
