#!/bin/bash
# Spawn an isolated Claude Code agent environment
# Usage: ./scripts/agent/spawn.sh <agent-name> [base-branch] [--run]
#
# Examples:
#   ./scripts/agent/spawn.sh task1                    # Create env only
#   ./scripts/agent/spawn.sh task1 main --run         # Create and run Claude Code
#   ./scripts/agent/spawn.sh task1 fix/some-branch    # Clone from specific branch

set -e

AGENT_NAME="${1:?Usage: spawn.sh <agent-name> [base-branch] [--run]}"
BASE_BRANCH="${2:-main}"
RUN_CLAUDE="${3:-}"

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AGENTS_DIR="${REPO_ROOT}/.agents"
AGENT_DIR="${AGENTS_DIR}/${AGENT_NAME}"
BRANCH_NAME="agent/${AGENT_NAME}"

# Get the remote URL
REMOTE_URL=$(git -C "${REPO_ROOT}" remote get-url origin)

echo "=== Spawning Agent: ${AGENT_NAME} ==="
echo "Base branch: ${BASE_BRANCH}"
echo "Remote: ${REMOTE_URL}"

# 1. Create .agents directory if needed
mkdir -p "${AGENTS_DIR}"

# 2. Clone the repo (shallow)
if [ -d "${AGENT_DIR}" ]; then
    echo "Agent workspace already exists at ${AGENT_DIR}"
else
    echo "Creating shallow clone..."
    git clone --depth=1 --branch "${BASE_BRANCH}" "${REMOTE_URL}" "${AGENT_DIR}"

    # Create and checkout agent branch
    cd "${AGENT_DIR}"
    git checkout -b "${BRANCH_NAME}"
    echo "Created branch: ${BRANCH_NAME}"
fi

# 3. Copy environment files from main repo
cp -n "${REPO_ROOT}/.env" "${AGENT_DIR}/.env" 2>/dev/null || true
for env_file in "${REPO_ROOT}/services/"*/.env; do
    if [ -f "$env_file" ]; then
        service_dir=$(dirname "$env_file")
        service_name=$(basename "$service_dir")
        target_dir="${AGENT_DIR}/services/${service_name}"
        if [ -d "$target_dir" ]; then
            cp -n "$env_file" "${target_dir}/.env" 2>/dev/null || true
        fi
    fi
done

# 4. Install dependencies in agent workspace
echo "Installing dependencies..."
cd "${AGENT_DIR}"
pnpm install

echo ""
echo "=== Agent Environment Ready ==="
echo "Workspace: ${AGENT_DIR}"
echo "Branch:    ${BRANCH_NAME}"
echo ""
echo "To start Claude Code in this workspace:"
echo "  cd ${AGENT_DIR} && claude"
echo ""
echo "Or use the run script:"
echo "  ./scripts/agent/run.sh ${AGENT_NAME}"
echo ""

# 5. Optionally run Claude Code immediately
if [ "${RUN_CLAUDE}" = "--run" ]; then
    cd "${AGENT_DIR}"
    exec claude
fi
