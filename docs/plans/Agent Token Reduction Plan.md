---
title: Agent Token Reduction Plan
type: note
permalink: plans/agent-token-reduction-plan
tags:
- agent
- localai
- optimization
- mcp-tools
---

# Plan: Reduce Agent LLM Token Usage (~21K → ~6-8K)

## Context

The agent sends ~21K tokens per LLM request to LocalAI (qwen3-4b on Intel Iris Xe iGPU). Even with SYCL GPU acceleration, processing takes ~5-7 minutes, causing the ChatUI SSE stream to timeout. The bloat comes from 3 sources:

1. **38 tool definitions** with verbose descriptions, examples, and duplicated instructions (~15K tokens)
2. **System prompt** (AGENTS.md) at ~4K tokens repeating the same "search before creating" patterns already in tool descriptions
3. **9 deprecated tools** still registered (createBookEvent, createQuoteEvent, createPatentEvent, createScientificStudyEvent, createDeathEvent, createDocumentaryEvent, createTransactionEvent, createUncategorizedEvent, uploadMediaFromURL)

## Approach: Three-Part Token Reduction

### Part 1: Remove 9 deprecated tools (~40% reduction)

The deprecated tools are fully replaced by `createEvent` (unified). Remove their registrations from the MCP server.

- [event.tools.ts](services/api/src/routes/mcp/tools/events/event.tools.ts) - Remove 8 deprecated event creation tools
- [media.tools.ts](services/api/src/routes/mcp/tools/media/media.tools.ts) - Remove uploadMediaFromURL

This alone eliminates ~8K tokens (9 tools × ~900 tokens average).

**Result: 38 tools → 29 tools**

### Part 2: Shorten tool descriptions (~30% reduction)

Current descriptions embed search strategies, workflows, JSON examples, and behavioral notes inline. Most of this is duplicated from the system prompt.

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

### Part 3: Trim system prompt (AGENTS.md)

- [AGENTS.md](services/agent/AGENTS.md) - is the system prompt

Keep:
- Identity/purpose (2 lines)
- Search-before-create rule (once, compact)
- Edit tool behavior (omit/null semantics)
- Recursion limit (25)

Remove:
- Verbose search strategy examples (redundant with tool descriptions)
- 4 "Common Tool Patterns" (self-evident from tool schemas)
- Detailed fact-checking/ethics guidelines (not relevant for token budget)
- Redundant "Data Access" section listing tools

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