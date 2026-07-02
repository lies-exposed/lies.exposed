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

## L3 Data

<!-- exodia:section:l3 -->

- `variants.yaml`: environment-specific differences and config gotchas.
