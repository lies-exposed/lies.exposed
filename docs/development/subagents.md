# Spawning Subagents

This document covers patterns for spawning subagents (via the `Task` tool) in the lies.exposed codebase.

## Key Constraint

Subagents launched via the `Task` tool do **not** inherit `AGENTS.md` context. Always include a basic-memory instruction so the subagent can discover project conventions autonomously.

## Required Pattern

```
Task(prompt: "Before starting work, query the basic-memory MCP server:
  - build_context('memory://getting-started/agent-quickstart') for project conventions and key patterns
  - search_notes('<relevant-topic>') for topic-specific guidance (e.g. 'mcp', 'e2e-tests', 'fp-ts')

Then proceed with: <actual task description>")
```

Include this in **any subagent that will read or write code** in this repository.

## What basic-memory provides to subagents

- Architecture patterns (route handlers, flows, endpoint definitions)
- Critical gotchas (Effect vs fp-ts Option, build order, OpenAI schema rules)
- Test bootstrap patterns (`GetAppTest()`, `saveUser`, `loginUser`)
- File location conventions (`src/` vs `lib/` vs `build/`)
- Service-specific documentation (API, admin, web, worker, agent)

## Subagents Using Playwright MCP

When spawning subagents that need to perform UI testing or browser automation, include the Playwright MCP setup in the subagent prompt. The agent will automatically use internal Docker service URLs (e.g., `http://admin.liexp.dev`) rather than localhost.

For full details on available tools, workflows, and troubleshooting, subagents should reference `docs/playwright-mcp-agent-guide.md`.

## Context7 Library Documentation

Before starting any implementation work, subagents should use Context7 to retrieve up-to-date library docs. Key libraries to configure:

| Library | Purpose |
|---------|---------|
| `/fp-ts/fp-ts` | Core functional programming utilities |
| `/effect-ts/effect` | Modern functional effects system (source code) |
| `effect-ts.github.io/effect` | Effect system docs |
| `/facebook/react` | UI framework |
| `/marmelab/react-admin` | Admin interface framework |
| `/mui/material-ui` | UI component library (source code) |
| `mui.com/docs` | UI component library (docs) |

Use VS Code's MCP commands to query these libraries before implementing.
