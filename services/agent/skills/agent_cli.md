---
name: agent-cli
description: How to use the agent CLI to interact with the AI agent for testing prompts and logic changes. Covers the interactive chat mode, CLI resource commands, and using the CLI to validate agent behavior.
---

# Agent CLI

The agent service exposes a CLI at `services/agent` with two modes:

```bash
# Interactive AI chat — uses full agent with MCP + LangChain
pnpm --filter agent cli agent [question]

# Database CRUD — lightweight, no MCP/LangChain
pnpm --filter agent cli <group> <subcommand> [options]
```

## Interactive Agent Chat

Run the AI agent interactively via the `agent` command group:

```bash
# Interactive mode — prompts for input (uses prompts library)
pnpm --filter agent cli agent

# Single question mode — passes question as argument (non-interactive)
pnpm --filter agent cli agent "list the most recent actors"
```

**Important:** The CLI uses the `prompts` library for interactive input. Pass the question as an argument for non-interactive use: `pnpm --filter agent cli agent "question"`. Without an argument, the CLI enters interactive mode and waits for input via the prompts library.

### What happens under the hood

1. Loads `.env.local` + `.env` from the service root
2. Creates `AgentContext` with all providers (JWT, LangChain, Puppeteer, Brave Search, MCP client, FSClient)
3. Loads skills from `skills/*.md` (logged as `[agent-cli] Loaded X skills`)
4. Loads MCP tools from API (logged as `[agent-cli] Loaded X MCP tools`)
5. Creates a new conversation UUID
6. Streams the response via `sendChatMessageStream`
7. Tool calls logged to stderr: `[tool] liexp_cli {"input":"{\"command\":\"actor list --sort=createdAt --order=DESC --end=10\"}"}`
8. Tool results logged to debug: `[tool result] liexp_cli: {...}`
9. Enters interactive loop until you type `exit`

**Observed log format:**
```
2026-06-26T18:53:47.423Z @liexp:agent-cli:info Loaded 3 skills
2026-06-26T18:53:47.425Z @liexp:agent-cli:info Loaded 1 MCP tools
2026-06-26T18:53:47.426Z @liexp:agent-cli:info Creating auto agent with provider config: { provider: 'openai' }
```

## Database CRUD Commands

The CLI also provides lightweight database commands (no LLM, no MCP):

```bash
# List all command groups
pnpm --filter agent cli

# Get help for a group
pnpm --filter agent cli actor --help

# Get help for a subcommand
pnpm --filter agent cli actor get --help

# Query actors
pnpm --filter agent cli actor list --_start 0 --_limit 10
pnpm --filter agent cli actor get --id=<uuid>
pnpm --filter agent cli actor find --fullName=Obama
pnpm --filter agent cli actor find-avatar --fullName=Obama

# Create/edit actors
pnpm --filter agent cli actor create --fullName="Test" --bio='["Test bio"]'
pnpm --filter agent cli actor edit --id=<uuid> --bio='["Updated bio"]'

# Same pattern for: group, area, link, media, nation, event, story
```

## Using the CLI to Test Agent Changes

When you edit prompts (`AGENTS.md`, `RESEARCHER.md`) or agent logic, use the CLI to validate behavior:

### 1. Quick smoke test
```bash
# Should respond with a tool call to liexp_cli
pnpm --filter agent cli agent "list the most recent actors"

# Should NOT call liexp_cli (web research)
pnpm --filter agent cli agent "search the web for recent climate news"

# Should respond naturally without tools
pnpm --filter agent cli agent "hello"
```

### 2. Test specific tool calls
```bash
# Verify the agent uses the correct CLI commands
pnpm --filter agent cli agent "get the actor with ID 00000000-0000-0000-0000-000000000001"
# Look for: [tool] liexp_cli {"command":"actor get --id=..."}

# Verify the agent searches before creating
pnpm --filter agent cli agent "create a new actor named Test Person"
# Should see liexp_cli find/search first, then create only if no match
```

### 3. Test prompt changes
After editing `AGENTS.md`:
```bash
# Test that the agent follows new rules
pnpm --filter agent cli agent "list actors"

# Check stderr for tool calls (tool calls go to stderr, response to stdout)
pnpm --filter agent cli agent "list actors" 2>stderr.log
# stderr.log will contain [tool] and [tool result] lines
```

### 4. Test skill changes
After editing files in `skills/`:
```bash
# Test that skills are loaded and followed
pnpm --filter agent cli agent "here is a link https://example.com/article"
# Should trigger link_handling skill workflow
```

## CLI Output Format

| Stream | Content |
|--------|---------|
| `stdout` | Agent's text response (streamed) |
| `stderr` | Tool calls: `[tool] liexp_cli {"input":"{\"command\":\"actor list --sort=createdAt --order=DESC --end=10\"}"}` |
| `stderr` (debug) | Tool results: `[tool result] liexp_cli: {...}` |
| `stderr` (dimmed) | Thinking content: `\x1b[2m<thinking>...\x1b[0m` |

## Common Test Scenarios

### Verify tool priority
```bash
# Should use liexp_cli, NOT searchWeb, for platform data
pnpm --filter agent cli agent "find all actors named Obama"

# Should use searchWeb for external information
pnpm --filter agent cli agent "what happened at the 2024 olympics"
```

### Verify "search before create" rule
```bash
# Should search first, only create if no match exists
pnpm --filter agent cli agent "create an actor named Unique Test Person 12345"
# Look for search attempt, then create only if no match
```

### Verify data integrity rules
```bash
# Should not fabricate data
pnpm --filter agent cli agent "tell me about actor 00000000-0000-0000-0000-000000000001"
# Should call liexp_cli, not make up information
```

### Verify multi-step workflows
```bash
# Should follow link_handling skill
pnpm --filter agent cli agent "extract entities from https://example.com/article"

# Should search for variations before creating
pnpm --filter agent cli agent "add actor Obama to database"
```

## Environment

The CLI loads `.env.local` from `services/agent/` (via `loadENV` in `context/load.ts`). Ensure this file has:

```bash
OPENAI_API_KEY=...
OPENAI_BASE_URL=http://your-localai:8080
LOCALAI_MODEL=qwen3.6-35b-a3b
JWT_SECRET=...
API_BASE_URL=http://api.liexp.test/v1
API_TOKEN=...
MCP_URL=http://api.liexp.test/mcp
BRAVE_API_KEY=...
```

## Debugging

- Tool calls appear on stderr — redirect to capture them: `pnpm --filter agent cli agent "question" 2>&1`
- Thinking content appears dimmed on stderr (ANSI escape codes)
- Errors exit with code 1 and print to stderr
- Use `DEBUG=@liexp:*` for verbose logging: `DEBUG=@liexp:* pnpm --filter agent cli agent "question"`

## CLI Command Reference

```bash
# Top-level help
pnpm --filter agent cli

# Resource groups
pnpm --filter agent cli actor <subcommand>
pnpm --filter agent cli group <subcommand>
pnpm --filter agent cli event <subcommand>
pnpm --filter agent cli link <subcommand>
pnpm --filter agent cli area <subcommand>
pnpm --filter agent cli media <subcommand>
pnpm --filter agent cli nation <subcommand>
pnpm --filter agent cli story <subcommand>

# Interactive agent
pnpm --filter agent cli agent [question]
```
