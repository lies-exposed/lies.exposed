#!/bin/bash

# Service Token Generator Script
# Convenience script for generating service client tokens with different permission sets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Change to API directory (script is in scripts/, API is in services/api)
cd "$(dirname "$0")/../services/api"

echo -e "${BLUE}Service Token Generator${NC}"
echo "=========================="

# Check if JWT_SECRET exists
if ! grep -q "JWT_SECRET" .env 2>/dev/null; then
    echo -e "${RED}Error: JWT_SECRET not found in .env file${NC}"
    exit 1
fi

show_help() {
    echo -e "${YELLOW}Usage:${NC} $0 [preset|custom]"
    echo ""
    echo -e "${YELLOW}Presets:${NC}"
    echo "  agent     - Generate token for agent service (mcp:tools, admin:read)"
    echo "  ai-bot    - Generate token for ai-bot service (mcp:tools, admin:read, admin:create, admin:edit)"
    echo "  admin     - Generate token with full admin permissions"
    echo "  readonly  - Generate token with read-only permissions"
    echo ""
    echo -e "${YELLOW}Custom:${NC}"
    echo "  custom    - Interactive permission selection"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 agent"
    echo "  $0 ai-bot"
    echo "  $0 custom"
    echo ""
}

generate_token() {
    local service_name="$1"
    shift
    local permissions=("$@")
    echo -e "${BLUE}Generating token for service:${NC} ${service_name}"
    echo -e "${BLUE}Permissions:${NC} ${permissions[*]}"
    
    local cmd="pnpm tsx src/bin/generate-service-token.ts"
    for perm in "${permissions[@]}"; do
        cmd="$cmd --permission $perm"
    done
    
    echo ""
    eval "$cmd"
}

if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

case "$1" in
    "agent")
        echo -e "${GREEN}Generating Agent Service Token${NC}"
        generate_token "agent" "mcp:tools" "admin:read"
        ;;
    
    "ai-bot")
        echo -e "${GREEN}Generating AI-Bot Service Token${NC}"
        generate_token "ai-bot" "mcp:tools" "admin:read" "admin:create" "admin:edit"
        ;;
    
    "admin")
        echo -e "${GREEN}Generating Admin Token (Full Permissions)${NC}"
        generate_token "admin" "mcp:tools" "admin:read" "admin:create" "admin:edit" "admin:delete"
        ;;
    
    "readonly")
        echo -e "${GREEN}Generating Read-Only Token${NC}"
        generate_token "readonly" "admin:read" "event-suggestion:read"
        ;;
    
    "custom")
        echo -e "${GREEN}Custom Token Generation${NC}"
        echo ""
        echo "Enter service name (e.g., agent, ai-bot, worker):"
        read -r service_name
        
        if [ -z "$service_name" ]; then
            echo -e "${RED}Service name is required${NC}"
            exit 1
        fi
        
        echo ""
        echo "Available permissions:"
        echo "  1) mcp:tools"
        echo "  2) admin:read"
        echo "  3) admin:create"
        echo "  4) admin:edit"
        echo "  5) admin:delete"
        echo "  6) event-suggestion:read"
        echo "  7) event-suggestion:create"
        echo "  8) event-suggestion:edit"
        echo ""
        echo "Enter permission numbers separated by spaces (e.g., 1 2 3):"
        read -r selection
        
        permissions=()
        for num in $selection; do
            case $num in
                1) permissions+=("mcp:tools") ;;
                2) permissions+=("admin:read") ;;
                3) permissions+=("admin:create") ;;
                4) permissions+=("admin:edit") ;;
                5) permissions+=("admin:delete") ;;
                6) permissions+=("event-suggestion:read") ;;
                7) permissions+=("event-suggestion:create") ;;
                8) permissions+=("event-suggestion:edit") ;;
                *) echo -e "${RED}Invalid selection: $num${NC}" ;;
            esac
        done
        
        if [ ${#permissions[@]} -eq 0 ]; then
            echo -e "${RED}No valid permissions selected${NC}"
            exit 1
        fi
        
        generate_token "$service_name" "${permissions[@]}"
        ;;
    
    "help"|"--help"|"-h")
        show_help
        ;;
    
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}Remember to:${NC}"
echo "1. Copy the API_TOKEN to your service's .env.local file"
echo "2. Restart the service container to pick up the new token"
echo "3. Test the service to ensure authentication works"