# AI Agents Documentation

lies.exposed is a fact-checking and information analysis platform. Monorepo: 7 services + 6 shared packages, TypeScript throughout, pnpm workspace, deployed to Kubernetes.

---

## Context Router

<!-- exodia:router:start -->
Route by task type. Read the relevant L2 module first; load L3 data only when needed. **Max 2 hops.**

| Task type | Load |
|-----------|------|
| Architecture, services, packages, data flow, inter-service communication | `context/architecture/ARCHITECTURE.md` |
| Code conventions, fp-ts/Effect patterns, PR review, commit rules, import style | `context/design-patterns/DESIGN-PATTERNS.md` |
| Commands, dev/prod env, Docker, Helm, K8s, migrations, queue operations | `context/operations/OPERATIONS.md` |
| Domain terms, entities, abbreviations, naming | `context/glossary/glossary.yaml` |
| Debugging, footguns, pitfalls, TypeORM gotchas, Effect/fp-ts traps | `context/debugging/` |
<!-- exodia:router:end -->

---

## Behavioral Rules

1. **Route first.** Use the Context Router before loading any data file. Never guess; the router exists for that.
2. **Load lazily.** Never load all L3 files at once. Max 2 hops: router → L2 narrative → (optional) L3 data.
3. **Edit source only.** Never touch `lib/` or `build` directories.
4. **Read before edit.** Read the file first, follow existing patterns before introducing new ones.
5. **Delegate exploration.** For tasks touching 3+ files or 2+ directories, delegate to a sub-agent.
6. **fp-ts everywhere.** Use `pipe` + `TaskEither`/`ReaderTaskEither`. Never mix imperative style.
7. **pnpm workspace.** Use `pnpm --filter <service> <script>` from repo root.
8. **Context update as final task.** After completing work, check §Self-Update Rules and append any durable findings.
9. **Memory first (mem0, mandatory).** At the **start of every session**, call `memory_search` with `scope: "<agent ID>"` and a query matching the task. This recalls prior decisions, conventions, and context — never start cold. Before finishing, call `memory_add` for every durable conclusion (§Persistent Memory). Skipping either is a rule violation.
10. **CodeGraph first.** Before any grep/find/read/edit, call `codegraph_explore` with the symbol names, file names, or question. It returns verbatim source plus call paths in one call — replaces the grep+read loop. Pass `projectPath` for monorepo sub-projects.
11. **Graphify on demand.** Use `skill("graphify")` for any question about architecture, file relationships, or project content — especially when `graphify-out/` already exists.
12. **Paperclip tasks.** To create or manage Paperclip issues from this repo, use the user-scope skills `paperclip-issue` (create/comment/update), `paperclip-plan-to-issue` (plan doc → parent + sub-issues) and `paperclip-implement-issue`. They read creds from `~/.env` (`PAPERCLIP_*`).

---

## Self-Update Rules

| Signal during conversation | Target file | What to write |
|----------------------------|-------------|---------------|
| Codebase assumption corrected by user or evidence | L2 `.md` file for that area | Update the incorrect section |
| Architecture or design decision taken | `context/architecture/decisions.jsonl` | New ADR entry |
| PR review surfaces new check (prod break, near-miss) | `context/design-patterns/reviews.jsonl` | New review entry |
| Domain term clarified or new entity appears | `context/glossary/glossary.yaml` | New or updated term |
| Environment variant or infra difference confirmed | `context/operations/variants.yaml` | New entry under the relevant variant |
| Reproducible bug or footgun worth a future debugger's time | `context/debugging/playbooks.jsonl` | New playbook entry |

### How to update

1. Read the target file first — check for duplicates or stale entries to update instead.
2. **Branch-scoped dedup**: if an entry on the same topic was added on the current branch, replace it in-place instead of appending.
3. Use the existing schema: every `.jsonl` starts with a `_schema` line; read `_fields` before adding entries.
4. Generate ID: `{type}_{YYYYMMDD}_{HHMMSS}_{4hex}` using current date/time.
5. Append, don't rewrite `.jsonl`. For `.md` and `.yaml`, edit the relevant section.
6. Archive, don't delete: set `status: archived` on obsolete `.jsonl` entries.
7. One insight per entry. Be concise — write for a developer with no conversation context.
8. Never copy values that live in source files (ports, versions, env vars) — reference the file instead.

---

## Quick Navigation (detailed docs)

| Topic | Documentation |
|-------|--------------|
| Setup & first-time install | [docs/getting-started/README.md](docs/getting-started/README.md) |
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
| Agent CLI (actor commands) | [docs/services/agent.md](docs/services/agent.md) |
| Testing guide | [docs/testing/README.md](docs/testing/README.md) |
| E2E tests (AppTest pattern) | [docs/testing/e2e-tests.md](docs/testing/e2e-tests.md) |
| Deployment (Docker, Helm, K8s) | [docs/deployment/README.md](docs/deployment/README.md) |
| Playwright MCP browser automation | [docs/playwright-mcp-agent-guide.md](docs/playwright-mcp-agent-guide.md) |

---

## Critical Rules

1. **Edit source files only** — never `lib/` or `build/` directories
2. **OpenAI structured output** — ALL schema properties must be required; use `Schema.NullOr()` not `Schema.optional()` → [details](docs/ai/openai-schemas.md)
3. **fp-ts patterns** — use `pipe` + `TaskEither`/`ReaderTaskEither` throughout → [details](docs/development/functional-programming.md)
4. **pnpm workspace** — use `pnpm --filter <service> <script>` from repo root → [details](docs/getting-started/README.md)

## Monorepo Commands

```bash
pnpm --filter api run lint          # Run script in specific package
pnpm --filter @liexp/shared... build  # Build with dependencies
pnpm -r build                       # All packages
```

Always use absolute paths when changing directories in scripts.

---

## Context Structure

```text
context/
  architecture/
    ARCHITECTURE.md       ← L2: system shape, services, packages, data flow
    decisions.jsonl       ← L3: ADRs
  design-patterns/
    DESIGN-PATTERNS.md    ← L2: fp-ts, code conventions, review rules
    reviews.jsonl         ← L3: PR review findings
  glossary/
    glossary.yaml         ← L3: domain terms, entities
  operations/
    OPERATIONS.md         ← L2: dev/prod commands, K8s, migrations
    variants.yaml         ← L3: env-specific differences
  debugging/
    playbooks.jsonl       ← L3: reproducible bugs, footguns
```

## Persistent Memory (mem0)

mem0 is the **only** persistent agent memory. Use it via three MCP tools. Memory use is mandatory, not optional.

| Tool | Required params | Notes |
|------|----------------|-------|
| `memory_search` | `scope`, `query` | Search before answering and before adding |
| `memory_add` | `scope`, `text` | `infer=True` distills facts; `infer=False` stores verbatim (logs, traces) |
| `memory_forget` | `memory_id` (from a search result) | Remove stale or wrong memories |

Pass `scope: "<agent ID>"` on **every** call.

### Agent IDs

Form `lies-exposed-<role>`: `lies-exposed-api`, `lies-exposed-frontend`, `lies-exposed-agent`, `lies-exposed-worker`, `lies-exposed-infra`. Project-wide conventions go in `__shared__`.

### Enforced workflow

1. **Session start / before any task** → `memory_search` (task-matching query). No exceptions, even for "small" tasks.
2. **Before answering** a question that depends on prior context → `memory_search` first.
3. **On tool or build failure** → `memory_search` for the error before debugging.
4. **After learning** a preference, convention, decision (with its *why*) or gotcha → `memory_add` immediately, not at the end.
5. **User corrects you / fact is stale** → `memory_forget` the old entry, then `memory_add` the fixed fact.
6. **Dedup:** search before adding; consolidate — never add a third entry on the same topic.
7. **Task switch / session end** → broad `memory_search`, forget duplicates and stale entries.
8. Structured reference → `context/` files; conclusions → mem0.

### Don't store

- Conversation logs — store the *conclusion*, not the dialogue
- Transient state (current file, line numbers)
- Secrets, credentials, API keys — never
- Things already in code, README, or this file

*For technical implementation details see the source code in `services/` and `packages/`.*

