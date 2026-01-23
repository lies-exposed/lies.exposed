#!/bin/bash
# Test an agent's service using the main repo's Docker infrastructure
# Usage: ./scripts/agent/test-service.sh <agent-name> <service-name> [--packages]
#
# Examples:
#   ./scripts/agent/test-service.sh my-task api           # Test api service
#   ./scripts/agent/test-service.sh my-task api --packages # Also use agent's packages
#   ./scripts/agent/test-service.sh my-task web           # Test web service
#
# This generates a compose override file and runs the service

set -e

AGENT_NAME="${1:?Usage: test-service.sh <agent-name> <service-name> [--packages]}"
SERVICE_NAME="${2:?Usage: test-service.sh <agent-name> <service-name> [--packages]}"
USE_PACKAGES="${3:-}"

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AGENT_DIR="${REPO_ROOT}/.agents/${AGENT_NAME}"
OVERRIDE_FILE="${REPO_ROOT}/.agents/${AGENT_NAME}.compose.override.yml"

# Validate agent exists
if [ ! -d "${AGENT_DIR}" ]; then
    echo "ERROR: Agent '${AGENT_NAME}' not found at ${AGENT_DIR}"
    echo "Create it first with: ./scripts/agent/spawn.sh ${AGENT_NAME}"
    exit 1
fi

# Map service name to compose service name
declare -A SERVICE_MAP=(
    ["api"]="api.liexp.dev"
    ["web"]="liexp.dev"
    ["admin"]="admin.liexp.dev"
    ["worker"]="worker.liexp.dev"
    ["agent"]="agent.liexp.dev"
)

COMPOSE_SERVICE="${SERVICE_MAP[$SERVICE_NAME]:-$SERVICE_NAME}"

# Validate service exists in agent workspace
if [ ! -d "${AGENT_DIR}/services/${SERVICE_NAME}" ]; then
    echo "ERROR: Service '${SERVICE_NAME}' not found in agent workspace"
    echo "Available services:"
    ls -1 "${AGENT_DIR}/services/" 2>/dev/null || echo "  (none)"
    exit 1
fi

echo "=== Testing Agent Service ==="
echo "Agent:   ${AGENT_NAME}"
echo "Service: ${SERVICE_NAME} (${COMPOSE_SERVICE})"
echo ""

# Generate compose override file
cat > "${OVERRIDE_FILE}" << EOF
# Auto-generated override for testing agent '${AGENT_NAME}' service '${SERVICE_NAME}'
# Generated at: $(date -Iseconds)
# Delete this file after testing

services:
  ${COMPOSE_SERVICE}:
    volumes:
      # Override service source to agent workspace
      - ./.agents/${AGENT_NAME}/services/${SERVICE_NAME}:/usr/src/app/services/${SERVICE_NAME}:cached
EOF

# Optionally also override packages
if [ "${USE_PACKAGES}" = "--packages" ]; then
    cat >> "${OVERRIDE_FILE}" << EOF
      # Override packages to agent workspace
      - ./.agents/${AGENT_NAME}/packages/@liexp:/usr/src/app/packages/@liexp:ro
EOF
    echo "Using agent's packages/@liexp"
fi

echo "Generated override: ${OVERRIDE_FILE}"
echo ""
echo "Starting service..."
echo ""

# Run docker compose with the override
docker compose -f compose.yml -f "${OVERRIDE_FILE}" up --build "${COMPOSE_SERVICE}"
