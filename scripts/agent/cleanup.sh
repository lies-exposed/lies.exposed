#!/bin/bash
# Cleanup an agent environment
# Usage: ./scripts/agent/cleanup.sh <agent-name> [--force]
#
# Options:
#   --force    Remove even if there are uncommitted changes

set -e

AGENT_NAME="${1:?Usage: cleanup.sh <agent-name> [--force]}"
FORCE="${2:-}"

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AGENT_DIR="${REPO_ROOT}/.agents/${AGENT_NAME}"

if [ ! -d "${AGENT_DIR}" ]; then
    echo "Agent environment not found: ${AGENT_DIR}"
    exit 1
fi

# Check for uncommitted changes
cd "${AGENT_DIR}"
if [ -n "$(git status --porcelain)" ] && [ "${FORCE}" != "--force" ]; then
    echo "ERROR: Uncommitted changes in ${AGENT_DIR}"
    echo "Use --force to remove anyway, or commit/stash changes first"
    git status --short
    exit 1
fi

# Check for unpushed commits
UNPUSHED=$(git log --oneline @{u}..HEAD 2>/dev/null | wc -l || echo "0")
if [ "$UNPUSHED" -gt 0 ] && [ "${FORCE}" != "--force" ]; then
    echo "ERROR: ${UNPUSHED} unpushed commit(s) in ${AGENT_DIR}"
    echo "Use --force to remove anyway, or push changes first"
    git log --oneline @{u}..HEAD 2>/dev/null || true
    exit 1
fi

echo "=== Cleaning up Agent: ${AGENT_NAME} ==="

# Remove the cloned directory
cd "${REPO_ROOT}"
rm -rf "${AGENT_DIR}"
echo "Removed workspace: ${AGENT_DIR}"

# Clean up empty .agents directory if no agents left
if [ -d "${REPO_ROOT}/.agents" ] && [ -z "$(ls -A "${REPO_ROOT}/.agents")" ]; then
    rmdir "${REPO_ROOT}/.agents"
    echo "Removed empty .agents directory"
fi

echo "=== Cleanup Complete ==="
