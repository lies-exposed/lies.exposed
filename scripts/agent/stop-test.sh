#!/bin/bash
# Stop a running agent service test and clean up
# Usage: ./scripts/agent/stop-test.sh <agent-name>

set -e

AGENT_NAME="${1:?Usage: stop-test.sh <agent-name>}"

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OVERRIDE_FILE="${REPO_ROOT}/.agents/${AGENT_NAME}.compose.override.yml"

echo "=== Stopping Agent Test ==="

# Stop with the override file if it exists
if [ -f "${OVERRIDE_FILE}" ]; then
    docker compose -f compose.yml -f "${OVERRIDE_FILE}" down
    rm -f "${OVERRIDE_FILE}"
    echo "Removed override file: ${OVERRIDE_FILE}"
else
    echo "No override file found, running normal docker compose down"
    docker compose down
fi

echo "=== Test Stopped ==="
