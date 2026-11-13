---
name: deploy-service
description: Deploy one or more lies.exposed services to the production Kubernetes cluster from the local machine — build Docker image(s), push to GHCR, then helm upgrade + rollout restart. Use when a fix must ship before the release-please PR is merged (CI only pushes images on release). Also documents the scripts/docker/* scripts. Trigger keywords: deploy service, deploy to prod, deploy from local, push and release, docker build push release, ship ai-bot/api/agent/web/admin/worker, hotfix before release-please.
---

# deploy-service Skill

Local build → push → rollout pipeline for lies.exposed. Run from the **main checkout** repo root (see Prerequisites).

```
./scripts/docker/build.sh --<service> ...
./scripts/docker/push.sh <ghcr-username> --<service> ...
./scripts/release.sh <service> ...
```

## Why this exists

CI (`.github/workflows/release-please.yml`) builds every service image on each push to `main`, but **pushes to GHCR only when the release-please PR is merged** (`push: releases_created == 'true'`). Until then `ghcr.io/lies-exposed/liexp-<svc>:latest` is stale, so to get a merged-to-`main` change into prod early, build/push/rollout from the local machine with the three steps below. When the release PR is later merged, CI overwrites `:latest` — no cleanup needed.

Local builds do **not** pass `VITE_VERSION` / `VITE_COMMIT_HASH` / `VERSION` / `COMMIT_HASH` build args (CI does), so the version shown in the app/health output will be stale until the real release.

## Prerequisites

- Run from the main checkout (`~/Workspace/lies-exposed`), **not** a `.worktrees/*` checkout: the pipeline needs git-ignored files that only exist there — `deploy/gh-token.txt` (GHCR PAT), `helm/values.prod.yaml`, and `services/*/.env.prod` (+ `services/admin/.env.server.prod`) which `helm/upgrade.sh` copies into `helm/config/env/`.
- Check out the commit to ship first (usually up-to-date `main`); the image is built from the working tree.
- Docker daemon running; kubectl context `home-server` available.
- Services using puppeteer/ffmpeg (`agent`, `ai-bot`, `worker`) build `FROM liexp-base:<NODE_VERSION>-latest`; rebuild/push `--base` only when node/pnpm versions or system deps change.

## scripts/docker/ reference

| Script | Purpose |
|--------|---------|
| `build.sh --<flag> ... [docker build args]` | `docker build` selected images (target `production`), tagged `liexp-<svc>:latest` and `ghcr.io/lies-exposed/liexp-<svc>:latest`. Unknown args are passed to `docker build`. |
| `push.sh <ghcr-username> --<flag> ...` | Logs in via `login.sh "$1"`, then pushes `ghcr.io/lies-exposed/liexp-<svc>:latest`. Username must be the **first** arg. |
| `login.sh <username>` | `docker login ghcr.io` with password from `./deploy/gh-token.txt`. |
| `up.sh [compose services]` | Local dev compose up (`compose.yml`, + telegram-bot-api via `compose.reverse-proxy.yml`). |
| `compose.sh` | Ensure `reverseproxy` network, bring up reverse proxy, then compose services. |
| `test.sh` | Build + start `api` + `db` in compose, curl `localhost:4010/v1/healthcheck`. |
| `test-deploy.sh` | Local production-like compose test using `deploy/compose.yml` (not a real deploy). |

All scripts use paths relative to repo root (`./scripts/docker/...`), so run them from root.

Build/push flags:

| Flag | Image |
|------|-------|
| `--base` | `liexp-base` (`api-base` target: node + pnpm + chromium/ffmpeg) |
| `--pnpm` | `liexp-base` `pnpm` target (node + pnpm only) — build only, `push.sh` pushes it with `--base` |
| `--api` | `liexp-api` |
| `--be-worker` | `liexp-worker` |
| `--admin` | `liexp-admin` |
| `--ai-bot` | `liexp-ai-bot` |
| `--agent` | `liexp-agent` |
| `--web` | `liexp-web` — accepted, but `build.sh` has **no web block** yet (nothing is built); push works for an image built elsewhere |

## Step 3 — Release

```bash
./scripts/release.sh api ai-bot     # bare names, no `--`
```

Bare names = Kubernetes deployment names: `api`, `ai-bot`, `agent`, `web`, `admin`, `worker`, `storybook`. Runs:
1. `scripts/helm/upgrade.sh` — copy `.env.prod` files into `helm/config/env/`, then `helm upgrade lies-exposed ./helm --take-ownership --namespace prod -f ./helm/values.prod.yaml --kube-context home-server`.
2. `scripts/kubectl/rollout-restart.sh <names>` — `kubectl --context home-server rollout restart deployments <names> -n prod`. No args = restart all default deployments (**avoid** — name the services you actually changed).

Naming differs per step: `--be-worker` (build/push) ↔ `worker` (release); other names map 1:1.

## Safety

- Targets **production** (`home-server`, ns `prod`) directly, no CI in between. Confirm the service list and the commit being shipped with the user before pushing/releasing; never run unprompted.
- `docker push` overwrites `:latest` in GHCR for everyone — including anything pulling it on restart.
- After release verify: `kubectl --context home-server -n prod get pods` (or the `check-services` skill). Rollout restart doesn't fail loudly if the new image crash-loops.
