# AI Agents Documentation

lies.exposed is a fact-checking and information analysis platform. This file is intentionally brief — detailed documentation lives in `docs/`.

## Quick Navigation

| Topic | Documentation |
|-------|--------------|
| Setup & first-time install | [docs/getting-started/README.md](docs/getting-started/README.md) |
| Agent orientation (basic-memory) | [docs/getting-started/agent-quickstart.md](docs/getting-started/agent-quickstart.md) |
| Services overview | [docs/services/README.md](docs/services/README.md) |
| Packages overview | [docs/packages/README.md](docs/packages/README.md) |
| Development guide & best practices | [docs/development/README.md](docs/development/README.md) |
| Functional programming (fp-ts/Effect) | [docs/development/functional-programming.md](docs/development/functional-programming.md) |
| Code quality & commit conventions | [docs/development/code-quality.md](docs/development/code-quality.md) |
| Spawning subagents (Task tool) | [docs/development/subagents.md](docs/development/subagents.md) |
| Kubernetes cluster access | [docs/development/kubernetes.md](docs/development/kubernetes.md) |
| AI workflows & processing | [docs/ai/README.md](docs/ai/README.md) |
| OpenAI structured output schemas | [docs/ai/openai-schemas.md](docs/ai/openai-schemas.md) |
| MCP tool workflows | [docs/mcp-tool-workflows.md](docs/mcp-tool-workflows.md) |
| Actor/group avatar workflows | [docs/mcp-tool-workflows.md](docs/mcp-tool-workflows.md) (Workflows 9 & 10) |
| Agent CLI (actor commands) | [docs/services/agent.md](docs/services/agent.md) |
| Testing guide | [docs/testing/README.md](docs/testing/README.md) |
| E2E tests (AppTest pattern) | [docs/testing/e2e-tests.md](docs/testing/e2e-tests.md) |
| Deployment (Docker, Helm, K8s) | [docs/deployment/README.md](docs/deployment/README.md) |
| Playwright MCP browser automation | [docs/playwright-mcp-agent-guide.md](docs/playwright-mcp-agent-guide.md) |

## Critical Rules (load docs for details)

1. **Edit source files only** — never `lib/` or `build/` directories
2. **OpenAI structured output** — ALL schema properties must be required; use `Schema.NullOr()` not `Schema.optional()` → [details](docs/ai/openai-schemas.md)
3. **Subagents need basic-memory** — always include the basic-memory query pattern when spawning Task subagents → [details](docs/development/subagents.md)
4. **fp-ts patterns** — use `pipe` + `TaskEither`/`ReaderTaskEither` throughout → [details](docs/development/functional-programming.md)
5. **pnpm workspace** — use `pnpm --filter <service> <script>` from repo root → [details](docs/getting-started/README.md)

## Monorepo Notes

```bash
pnpm --filter api run lint        # Run script in specific package
pnpm --filter @liexp/shared... build  # Build with dependencies
pnpm -r build                     # All packages
```

Always use absolute paths when changing directories in scripts to avoid ambiguity.

---

*For technical implementation details see the source code in `services/` and `packages/`.*
