<!--
Guidance for AI coding assistants working on the lies.exposed monorepo.
Keep this file short, specific, and actionable. See AGENTS.md and services/ai-bot/AGENT.md
for deeper agent integration details.
-->

# Copilot instructions for lies.exposed

Purpose: give an AI coding agent the minimal, high-value facts to be immediately productive.

- Big picture: this is a pnpm monorepo with multiple deployable services under `services/` and
  shared packages under `packages/`. Key services: `api` (TypeORM + PostgreSQL + Redis queues),
  `ai-bot` (background AI flows in `services/ai-bot/`), `worker`, `web`, and `admin-web`.

- Primary workflows:
  - Local dev: prefer Docker Compose (`compose.yml`) for databases and dependent services.
    Use `pnpm install` then `docker compose up` to boot infra. See `README.md` and `AGENTS.md`.
  - Fast development: run `pnpm <service> watch` (e.g. `pnpm api watch`) in a separate shell
    while running containers so file changes trigger restarts.
  - Builds: `pnpm build` at repo root builds all packages; services also contain local build scripts.

- Code and patterns to follow (do not invent other styles):
  - Functional programming with fp-ts and Effect is pervasive. Prefer existing patterns in
    `packages/@liexp/*` and `services/*/src` (look for `pipe`, `Effect`, `fp.RTE`, `TaskEither`).
  - Use absolute imports from monorepo packages (e.g. `@liexp/core`, `@liexp/shared`).
  - Domain models and validation live in `packages/@liexp/shared` — consult it for types and
    API payload shapes before changing endpoints.

- AI/Agent-specific guidance:
  - Use the root `AGENTS.md` as the authoritative source for MCP tools and flows (tool names like
    `createEventFromURLFlow`, `embedAndQuestionFlow`). Do NOT use `services/ai-bot/AGENT.md` for
    authoritative agent rules or instruction wording — treat it as implementation notes only.
  - When augmenting AI flows, prefer adding small, well-typed helpers in `@liexp/backend` and
    wiring them into existing flows rather than large rewrites.

- Integration points and infra:
  - Database: PostgreSQL (TypeORM) — check `services/api/ormconfig.js` and migrations in the API.
  - Queueing: Redis-backed job queue used by `ai-bot`/`worker` — inspect service configs under `services/*/config`.
  - Docker: `compose.yml` and `compose.reverse-proxy.yml` control local service composition.

- Developer commands and quick examples:
  - Install deps: `pnpm install`
  - Start infra (DB + services): `docker compose up -d db` then `docker compose up api web admin-web data`
  - Watch API during development: `pnpm api watch` (run outside containers to trigger restarts)
  - Build all: `pnpm build`
  - Lint code: `pnpm lint` (individual packages have ESLint configs)
  - Type check: `pnpm typecheck`
  - Format code: `pnpm format` (uses Prettier)
  - Run tests: `pnpm vitest` or `pnpm --filter <package> test`

- When making changes:
  - Update or reuse types in `@liexp/shared`; prefer type-safe changes.
  - Add unit tests in the relevant package using vitest (see `vitest.config.*` files).
  - Run `pnpm typecheck` and fix errors before opening PRs.
  - Run `pnpm lint` to check code style and fix issues.
  - Commit messages follow conventional commits (enforced by commitlint).

- Common pitfalls to avoid:
  - Never edit files in `lib/` or `build/` directories (these are generated build outputs).
  - Always edit source files in `src/` directories.
  - Don't use optional properties in OpenAI structured output schemas (see `AGENT.md` for details).
  - Ensure pnpm workspace context: run commands from correct directory or use `--filter` flag.
  - For fp-ts/Effect patterns: don't mix imperative and functional styles; follow existing patterns.

- Security and best practices:
  - No hardcoded secrets or credentials in code.
  - Use environment variables for configuration (see `.env.example` if available).
  - Validate all external inputs using schemas from `@liexp/shared`.
  - Handle errors properly using fp-ts `Either`/`TaskEither` or Effect error channels.

- Files to consult first (in order):
  1. `AGENTS.md` (root) — platform and agent overview (primary source for agent/tool rules)
  2. `packages/@liexp/shared/` — domain models and API schemas
  3. `services/api/README.md` and `services/api/ormconfig.js` — API-specific wiring
  4. `compose.yml` and `compose.reverse-proxy.yml` — local infra composition
  
  Note: `services/ai-bot/AGENT.md` exists but must be ignored when deriving copilot instruction
  rules — it's implementation-level notes and may conflict with repository-wide agent policies.

If anything here is unclear or you need more detail (examples of flows, common FP idioms used, or CI nuances), ask and I will expand this file.
