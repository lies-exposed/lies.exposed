#!/bin/bash
# Run Claude Code in an existing agent workspace
# Usage: ./scripts/agent/run.sh <agent-name>
#
# If agent doesn't exist, spawns it first

AGENT_NAME="${1:?Usage: run.sh <agent-name> [base-branch]}"
BASE_BRANCH="${2:-main}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
AGENT_DIR="${REPO_ROOT}/.agents/${AGENT_NAME}"

# Spawn if doesn't exist
if [ ! -d "${AGENT_DIR}" ]; then
    "${SCRIPT_DIR}/spawn.sh" "${AGENT_NAME}" "${BASE_BRANCH}"
fi

# Run Claude Code in the agent workspace
cd "${AGENT_DIR}"
exec claude
