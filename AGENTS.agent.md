# AGENTS (coder runs)

Lean instructions for automated coder runs on lies.exposed. Human/interactive agents: see `AGENTS.md`.

Monorepo: 7 services (`admin agent ai-bot api data storybook web worker`) + shared packages under `packages/@liexp/`, TypeScript, pnpm workspace, deployed to Kubernetes.

## Context Router

Route by task type; max 2 hops (router → L2 → optional L3). Never load all L3 files at once.

| Task type | Load |
|-----------|------|
| Architecture, services, data flow | `context/architecture/ARCHITECTURE.md` |
| Code conventions, fp-ts/Effect patterns, commit rules | `context/design-patterns/DESIGN-PATTERNS.md` |
| Commands, env, Docker/Helm/K8s, migrations | `context/operations/OPERATIONS.md` |
| Domain terms, entities, naming | `context/glossary/glossary.yaml` |
| Debugging, footguns, TypeORM/Effect traps | `context/debugging/` |

## Critical rules

1. **Read before edit.** Follow existing patterns; smallest focused diff.
2. **Edit source only** — never `lib/` or `build/` directories.
3. **fp-ts / Effect style.** Match neighbours: `pipe` + `TaskEither`/`ReaderTaskEither`, functional flows; no imperative mixing in existing fp-ts code.
4. **pnpm workspace.** Run scripts via `pnpm --filter <pkg> run <script>` from repo root (or `pnpm -C <worktree> --filter ...`). In a fresh worktree, build shared packages first: `pnpm -r --filter './packages/**' build`.
5. **OpenAI structured output** — ALL schema properties required; use `Schema.NullOr()` not `Schema.optional()` → [docs/ai/openai-schemas.md](docs/ai/openai-schemas.md).
6. **CodeGraph first** for "where is X / who calls X" (`codegraph_explore`, pass the worktree as `projectPath`). Grep/read for configs and docs.
7. **Commit conventions** — Conventional Commits (`feat|fix|chore(scope): summary`); the repo enforces commitlint. Stage files by path, never `git add -A`.
8. Never commit scratch files (PR bodies, commit-msg drafts), `.codegraph/`, or secrets.

## Build / lint / test

```bash
pnpm install --frozen-lockfile            # fresh worktree
pnpm -r --filter './packages/**' build     # shared packages before service checks
pnpm --filter api run lint                 # lint one package
pnpm --filter api run test                 # unit tests (vitest) for one package
pnpm -r run lint                           # all packages
pnpm vitest run <path/to/file.spec.ts>    # a single spec
```

Never run `test:e2e` from an automated run. Type-check: `pnpm -r run typecheck` or per-package `run build`. Do not add `as any`/`@ts-ignore` to satisfy tsc — fix the types.

## PR flow

- Branch off freshly fetched `origin/main`; rebase onto `origin/main` before every push; force-push only with `--force-with-lease`.
- One PR per branch; keep title/body matched to the real diff. Verify lint+test green before pushing; paste result tails in the PR body under `## Verification`.
- Fix failures caused by your change; for unrelated pre-existing failures, quote the exact error in the PR body.
