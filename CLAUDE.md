# lies.exposed — Agent Instructions

> Project-specific instructions for Claude Code working in this repo.

## What this repo is

lies.exposed is a fact-checking and information analysis platform. Monorepo: 7 services + 6 shared packages, TypeScript, pnpm workspace, deployed to Kubernetes.

## Two facts that change how you work here

1. **You have memory tools available** via GrayMatter (five MCP tools that persist facts and checkpoints across sessions). See [`AGENTS.md`](AGENTS.md) for the full operator brief.
2. **Use `pnpm --filter <service> <script>`** from the repo root for all monorepo commands.

## MCP Servers

This project has four MCP servers wired in `.mcp.json`:

| Server | Purpose |
|--------|---------|
| `api-liexp-dev-db` | PostgreSQL database access |
| `basic-memory` | Basic memory indexing |
| `context7` | Library documentation lookup |
| `playwright` | Browser automation |
| `graymatter` | Persistent agent memory |

## Agent Identity

Use `agent_id` of the form `lies-exposed-<role>` (e.g. `lies-exposed-api`, `lies-exposed-frontend`).

## Shared facts (`__shared__`)

Project-wide conventions go in the reserved namespace `__shared__`:

```jsonc
{ "tool": "memory_add", "args": {
    "agent_id": "__shared__",
    "text":     "Project convention: all timestamps stored as UTC ISO-8601"
}}
```

## When to call which

- **Before answering** any question that depends on prior context → `memory_search` first
- **After learning** a user preference, project convention, or making a non-obvious decision → `memory_add`
- **When the user corrects you** or a fact becomes stale → `memory_reflect` with `action="update"`
- **At the start of a session** that may resume a long task → `checkpoint_resume`. **Before stopping** mid-task → `checkpoint_save`

## Don't store

- Conversation logs — store the *conclusion*, not the dialogue
- Transient state (current file, line numbers) — use `checkpoint_save` instead
- Secrets, credentials, API keys — never
- Things already in code, README, or this file
@AGENTS.md

<!-- graymatter:instructions:begin — managed by `graymatter init`; edits inside this block are overwritten -->
## Memory (GrayMatter)

This project has persistent agent memory via the `graymatter` MCP tools:

- `memory_search` (`agent_id`, `query`) — call at the **start of a task** when prior context might matter.
- `memory_add` (`agent_id`, `text`) — call whenever you learn something **durable**: user preferences, decisions, conventions, gotchas.
- `memory_reflect` (`action`, `agent`, `text`/`target`) — update or forget stale facts. ⚠ takes `agent`, not `agent_id`.
- `checkpoint_save` / `checkpoint_resume` (`agent_id`) — snapshot/restore session state before major refactors or across restarts.

Use a stable `agent_id` of the form `<project>-<role>` (e.g. `myapp-backend`). Store conclusions, not conversation logs. Err on the side of remembering.
<!-- graymatter:instructions:end -->
