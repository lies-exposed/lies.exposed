---
name: deploy-service
description: Deploy one or more lies.exposed services to the production Kubernetes cluster from the local machine — build Docker image(s), push to GHCR, then helm upgrade + rollout restart. Trigger keywords: deploy service, deploy to prod, push and release, docker-build docker-push release, ship ai-bot/api/agent/web/admin/worker.
---

# deploy-service Skill

Three-step local deploy pipeline for lies.exposed, run from repo root. Each step is a separate script; run them in order.

```
./scripts/docker-build.sh --<service1> --<service2> ...
./scripts/docker-push.sh --<service1> --<service2> ...
./scripts/release.sh <service1> <service2> ...
```

## Step 1 — Build

```bash
./scripts/docker-build.sh --api --ai-bot   # example: two services
```

Flags (build + push use the same `--flag` names):

| Flag | Image |
|------|-------|
| `--base` | `liexp-base` (Node/pnpm base layer) |
| `--pnpm` | pnpm layer |
| `--api` | `liexp-api` |
| `--be-worker` | `liexp-worker` |
| `--web` | `liexp-web` |
| `--admin` | `liexp-admin` |
| `--ai-bot` | `liexp-ai-bot` |
| `--agent` | `liexp-agent` |

## Step 2 — Push

```bash
./scripts/docker-push.sh <ghcr-username> --api --ai-bot
```

First positional arg is the GHCR username, passed through to `docker-login.sh` (`login $1` — reads `./deploy/gh-token.txt` as the password). Then the same `--flag` names as Step 1 push each selected image as `ghcr.io/lies-exposed/liexp-<service>:latest`.

## Step 3 — Release

```bash
./scripts/release.sh api ai-bot
```

Bare service names here (no `--`), matching Kubernetes deployment names: `api`, `ai-bot`, `agent`, `web`, `admin`, `worker`, `storybook`. This runs:
1. `helm/upgrade.sh` — copies `.env.prod` files into `helm/config/env/`, then `helm upgrade lies-exposed ./helm --take-ownership --namespace prod -f ./helm/values.prod.yaml --kube-context home-server`.
2. `kubectl/rollout-restart.sh` — `kubectl --context home-server rollout restart deployments <names> --namespace prod`. With no args it restarts all default deployments.

## Notes

- Service name differs by step: build/push want the `--flag` form, release wants the bare name. Map 1:1 (`--ai-bot` ↔ `ai-bot`, `--be-worker` ↔ `worker`, `--admin` ↔ `admin`, etc.).
- This targets the **production** cluster (`--context home-server -n prod`) directly from the local machine — no CI in between. Confirm the service list with the user before running Step 3, and don't run the pipeline unprompted.
- After release, verify with `kubectl --context home-server -n prod get pods` (or the `check-services` skill) — rollout restart doesn't fail loudly if the new image crash-loops.
