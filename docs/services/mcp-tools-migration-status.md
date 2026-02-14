---
title: MCP Tools Migration Status
type: note
permalink: services/mcp-tools-migration-status
tags:
- mcp
- tools
- migration
- in-progress
---

# MCP Tools Migration Status

## Branch: fix/mcp-tools

Active work on improving MCP tool usability for AI agents.

## Completed Phases

### Phase 1: Quick Wins (commit 89893755e)
- Tool parameter simplification
- Better descriptions and defaults

### Phase 2: Unified Event Creation (commit 032261fc4)
- Created unified event creation tool with e2e tests
- Fixed linting and type errors

## Files Being Modified

### Actor Tools
- `services/api/src/routes/mcp/tools/actors/actor.tools.ts`
- `services/api/src/routes/mcp/tools/actors/createActor.tool.ts`

### Event Tools
- `services/api/src/routes/mcp/tools/events/createUnifiedEvent.tool.ts`
- `services/api/src/routes/mcp/tools/events/event.tools.ts`

### Group Tools
- `services/api/src/routes/mcp/tools/groups/createGroup.tool.ts`
- `services/api/src/routes/mcp/tools/groups/group.tools.ts`

### Media Tools
- `services/api/src/routes/mcp/tools/media/createMedia.tool.ts`
- `services/api/src/routes/mcp/tools/media/media.tools.ts`
- `services/api/src/routes/mcp/tools/media/uploadMediaFromURL.tool.ts`

## Related Documentation
- See `docs/IMPLEMENTATION-PLAN-CONSOLIDATED.md` for full plan
- See `docs/MCP-TOOLS-MIGRATION-GUIDE.md` for migration details
- See `docs/PHASE2-COMPLETION-SUMMARY.md` and `docs/PHASE4-COMPLETION-SUMMARY.md` for phase reports
