#!/bin/bash
# List all active agent environments
# Usage: ./scripts/agent/list.sh

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AGENTS_DIR="${REPO_ROOT}/.agents"

echo "=== Active Agent Environments ==="
echo ""

if [ ! -d "${AGENTS_DIR}" ] || [ -z "$(ls -A "${AGENTS_DIR}" 2>/dev/null)" ]; then
    echo "No active agents found."
    echo ""
    echo "Create one with: ./scripts/agent/spawn.sh <agent-name>"
    exit 0
fi

# List agent directories
for agent_path in "${AGENTS_DIR}"/*/; do
    if [ -d "$agent_path" ]; then
        agent_name=$(basename "$agent_path")

        # Get current branch
        branch=$(git -C "$agent_path" branch --show-current 2>/dev/null || echo "unknown")

        # Check for uncommitted changes
        changes=""
        if [ -n "$(git -C "$agent_path" status --porcelain 2>/dev/null)" ]; then
            changes=" [uncommitted]"
        fi

        # Check for unpushed commits
        unpushed=""
        unpushed_count=$(git -C "$agent_path" log --oneline @{u}..HEAD 2>/dev/null | wc -l || echo "0")
        if [ "$unpushed_count" -gt 0 ]; then
            unpushed=" [${unpushed_count} unpushed]"
        fi

        # Get disk usage
        disk_usage=$(du -sh "$agent_path" 2>/dev/null | cut -f1 || echo "?")

        echo "Agent: ${agent_name}"
        echo "  Path:   ${agent_path}"
        echo "  Branch: ${branch}${changes}${unpushed}"
        echo "  Disk:   ${disk_usage}"
        echo "  Run:    ./scripts/agent/run.sh ${agent_name}"
        echo ""
    fi
done
