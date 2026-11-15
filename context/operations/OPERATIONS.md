<!-- purpose: Dev and prod commands, environment setup, K8s access, migrations, queue operations. Read before running any infrastructure commands. -->
# Operations

<!-- exodia:section:intro -->
Two environments: `liexp.dev` (local Docker Compose, dev DB) and `lies.exposed` (production Kubernetes). Never run destructive operations against production without explicit user confirmation.

## Environments

<!-- exodia:section:environments -->

| Env | Runtime | DB access | Notes |
|-----|---------|-----------|-------|
| `liexp.dev` | Docker Compose | `mcp__api-liexp-dev-db__query` MCP tool | Dev only — not production |
| `lies.exposed` | Kubernetes (Helm) | No direct MCP access | Use kubectl |

See `context/operations/variants.yaml` for env-specific differences.

## Development Commands

<!-- exodia:section:dev-commands -->

```bash
# Start all infrastructure (DB, Redis)
docker compose up -d db.liexp.dev

# Start a service in dev mode
pnpm --filter api dev
pnpm --filter agent dev

# Build a package with its dependencies
pnpm --filter @liexp/shared... build

# Build all packages
pnpm -r build

# Run migrations
pnpm --filter api migration:run

# Lint / typecheck / test
pnpm --filter api run lint
pnpm --filter api run typecheck
pnpm --filter api run test
```

## Quality Checks

<!-- exodia:section:quality -->

```bash
pnpm format       # Prettier
pnpm lint         # ESLint across workspace
pnpm typecheck    # tsc across workspace
pnpm vitest       # Vitest tests
pnpm build        # Full build
```

Always run all five before committing.

## Kubernetes Access

<!-- exodia:section:kubernetes -->

See `docs/development/kubernetes.md` for full cluster access guide.

```bash
# List pods in production namespace
kubectl -n liexp get pods

# Tail a service log
kubectl -n liexp logs -f deployment/api

# Port-forward for local access
kubectl -n liexp port-forward svc/api 3010:3010
```

## LocalAI

<!-- exodia:section:localai -->

- Endpoint: `https://ai.lies.exposed/v1`
- Update model configs via API (`POST /models/edit/<model-name>`) — files on server are root-owned, no SSH/scp.
- After container restart, agent service also needs restart (Docker DNS re-resolution).
- See `MEMORY.md` → LocalAI section for model config gotchas.

## Queue Operations

<!-- exodia:section:queues -->

Queue status flow: `pending → processing → done → completed` (or `→ failed`).

```bash
# Check pending queue jobs (via API)
curl http://localhost:3010/v1/queues?status=pending

# Re-queue a failed job — use Admin UI or API
POST /v1/queues/:id { status: "pending" }
```

## Releases & CI Approval

<!-- exodia:section:releases -->

Release PRs are opened by release-please authenticating with a **human-owned fine-grained PAT** (the Actions secret its `token:` input reads in `.github/workflows/release-please.yml` — fall back to `secrets.GITHUB_TOKEN` only if that secret is missing). Never make the PAT optional in the other direction: a PR authored by `github-actions[bot]` gets every `pull_request` CI run it triggers held at `action_required` (zero jobs) until approved, so the required checks named by the `no-push-force` ruleset never report and the release PR stays `BLOCKED` — which also stalls the Docker/Storybook jobs in that same workflow, since they gate on `releases_created`.

```bash
# Inspect the merge gate (required contexts + review rules) for the default branch
gh api repos/{owner}/{repo}/rulesets

# Unblock a bot-authored release PR that is already stuck: approve its held run
# from the Actions tab ("Review pending changes" -> "Approve and work"), then merge
# (an approving review may be needed for unattributed bot commits)
gh pr checks <n>                     # shows "no checks reported" when CI was held
```

- PAT setup: fine-grained, on the owning account, **Contents: Read & write** and **Pull requests: Read & write**; add *Issues: Read & write* only if release-please fails to apply its labels. Restrict repository access to this repo.
- Release PRs re-trigger CI on every force-push release-please makes, so an approved run is not enough for later pushes — the PAT avoids re-queued runs entirely.
- See `context/debugging/playbooks.jsonl` for the full diagnosis of a `BLOCKED` release PR.

## L3 Data

<!-- exodia:section:l3 -->

- `variants.yaml`: environment-specific differences and config gotchas.
