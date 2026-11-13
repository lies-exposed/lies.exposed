#!/usr/bin/env bash
#
# Deploy services to the production cluster from the local machine:
#   build image -> push to GHCR -> (helm upgrade) -> rollout restart -> wait.
#
# Use it to ship a change before the release-please PR is merged
# (CI only pushes images when a release is created).

set -euo pipefail

CONTEXT=home-server
NAMESPACE=prod
ROLLOUT_TIMEOUT=300s

usage() {
    cat <<EOF
Usage: scripts/docker/deploy.sh [options] <service>...

Services (kubernetes deployment names): api ai-bot agent web admin worker

Options:
  -u, --user <name>   GHCR username (default: \$GHCR_USER, else \`gh api user\`)
      --helm          run helm upgrade before restarting (config/env changes)
      --no-build      skip docker build (reuse local images)
      --no-push       build only: skip push, helm and rollout
  -n, --dry-run       print the plan and exit
  -y, --yes           don't ask for confirmation
  -h, --help          show this help

Examples:
  scripts/docker/deploy.sh api ai-bot
  scripts/docker/deploy.sh --helm -y worker
  scripts/docker/deploy.sh -n web admin
EOF
}

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." >/dev/null 2>&1 && pwd)"
cd "$DIR"

user="${GHCR_USER:-}"
helm=false
build=true
push=true
dry_run=false
yes=false
services=()

while [[ $# -gt 0 ]]; do
    case "$1" in
        -u|--user) user="${2:?--user needs a value}"; shift 2 ;;
        --helm) helm=true; shift ;;
        --no-build) build=false; shift ;;
        --no-push) push=false; shift ;;
        -n|--dry-run) dry_run=true; shift ;;
        -y|--yes) yes=true; shift ;;
        -h|--help) usage; exit 0 ;;
        -*) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
        *) services+=("$1"); shift ;;
    esac
done

if [[ ${#services[@]} -eq 0 ]]; then
    echo "No services given (refusing to deploy everything implicitly)." >&2
    usage >&2
    exit 1
fi

# deployment name -> build/push flag
flag_for() {
    case "$1" in
        api) echo --api ;;
        ai-bot) echo --ai-bot ;;
        agent) echo --agent ;;
        web) echo --web ;;
        admin) echo --admin ;;
        worker) echo --be-worker ;;
        *) return 1 ;;
    esac
}

flags=()
for s in "${services[@]}"; do
    if ! f="$(flag_for "$s")"; then
        echo "Unknown service: $s (expected: api ai-bot agent web admin worker)" >&2
        exit 1
    fi
    flags+=("$f")
done

# --- preflight ---------------------------------------------------------------

if [[ "$(git rev-parse --git-dir)" != "$(git rev-parse --git-common-dir)" ]]; then
    echo "Running from a git worktree: git-ignored files (deploy/gh-token.txt," >&2
    echo "helm/values.prod.yaml, services/*/.env.prod) live in the main checkout." >&2
    echo "Run this from the main checkout instead." >&2
    [[ "$dry_run" = true ]] || exit 1
fi

if [[ "$push" = true && -z "$user" ]]; then
    user="$(gh api user --jq .login 2>/dev/null || true)"
fi

missing=()
if [[ "$push" = true ]]; then
    [[ -n "$user" ]] || missing+=("GHCR user (use --user or \$GHCR_USER)")
    [[ -f deploy/gh-token.txt ]] || missing+=("deploy/gh-token.txt")
fi
if [[ "$helm" = true ]]; then
    [[ -f helm/values.prod.yaml ]] || missing+=("helm/values.prod.yaml")
fi
if [[ ${#missing[@]} -gt 0 ]]; then
    printf 'Missing: %s\n' "${missing[@]}" >&2
    [[ "$dry_run" = true ]] || exit 1
fi

commit="$(git rev-parse --short HEAD)"
branch="$(git rev-parse --abbrev-ref HEAD)"
dirty=""
[[ -z "$(git status --porcelain)" ]] || dirty=" (DIRTY working tree)"

# --- plan --------------------------------------------------------------------

echo "Deploy plan"
echo "  services : ${services[*]}"
echo "  source   : ${branch} @ ${commit}${dirty}"
echo "  target   : ${CONTEXT} / ${NAMESPACE}"
echo "  steps    : $([[ $build = true ]] && echo -n 'build ')$([[ $push = true ]] && echo -n "push($user) ")$([[ $push = true && $helm = true ]] && echo -n 'helm ')$([[ $push = true ]] && echo -n 'restart wait')"

if [[ "$dry_run" = true ]]; then
    exit 0
fi

if [[ "$yes" != true ]]; then
    read -r -p "Proceed? [y/N] " answer
    [[ "$answer" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }
fi

# --- run ---------------------------------------------------------------------

if [[ "$build" = true ]]; then
    ./scripts/docker/build.sh "${flags[@]}"
fi

if [[ "$push" != true ]]; then
    exit 0
fi

./scripts/docker/push.sh --user "$user" "${flags[@]}"

if [[ "$helm" = true ]]; then
    ./scripts/helm/upgrade.sh
fi

./scripts/kubectl/rollout-restart.sh "${services[@]}"

for s in "${services[@]}"; do
    kubectl --context "$CONTEXT" -n "$NAMESPACE" rollout status "deployment/$s" --timeout="$ROLLOUT_TIMEOUT"
done

kubectl --context "$CONTEXT" -n "$NAMESPACE" get pods
