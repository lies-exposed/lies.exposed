---
description: Specialized agent for the agent service — LLM-powered chat with LangChain/LangGraph, MCP tools, and LocalAI backend
mode: subagent
hidden: false
---

Load instructions from `docs/services/agent.md` for architecture, API endpoints, chat flow, and context type.

Working directory: `services/agent/`.

Key conventions:
- Entry point: `services/agent/src/run.ts`
- Chat flow: `services/agent/src/flows/chat/chat.flow.ts`
- Context: `AgentContext` — includes `LangchainContext`, `AgentProviderContext`, `PuppeteerProviderContext`
- Flows: `ReaderTaskEither<AgentContext, AgentError, Result>`
- LocalAI prod: `https://ai.lies.exposed/v1`; dev: `http://localai:8080/v1`
- After LocalAI restart: agent service also needs restart (Docker DNS re-resolution)
- Run `pnpm --filter agent dev` / `pnpm --filter agent run typecheck`

**Note:** `services/agent/AGENTS.md` is the LLM system prompt for the runtime agent — do not confuse with code context.

## Context Update

After completing a task, walk the Self-Update Rules in `AGENTS.md` and append durable findings to `context/`.
