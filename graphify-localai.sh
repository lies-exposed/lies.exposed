#!/bin/bash
# graphify-localai — wrapper that loads LocalAI env vars before calling graphify
# Usage: ./graphify-localai <command> [args...]
#        source graphify-localai.sh  (exports vars for the current shell)

_SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
_ENV_FILE="$_SCRIPT_DIR/graphify-out/.env.localai"

# Load env vars if present
if [ -f "$_ENV_FILE" ]; then
    while IFS='=' read -r key value; do
        [ -n "$key" ] && export "$key=$value"
    done < "$_ENV_FILE"
fi

# If first arg is "source", just export and exit (for sourcing the script)
if [ "$1" = "source" ]; then
    echo "[graphify-localai] env vars loaded: OPENAI_BASE_URL=$OPENAI_BASE_URL OPENAI_MODEL=$OPENAI_MODEL"
    exit 0
fi

# LocalAI is reached via the always-on kubectl port-forward container
# (~/Workspace/compose.yml, service graphify-localai-forward). Warn if it's down
# instead of spawning anything here.
if ! curl -s -o /dev/null "$OPENAI_BASE_URL/models" 2>/dev/null; then
    echo "[graphify-localai] WARNING: $OPENAI_BASE_URL unreachable." >&2
    echo "[graphify-localai] Run: cd ~/Workspace && docker compose up -d graphify-localai-forward" >&2
fi

# Default token-budget lower than graphify's 60000 default: qwen3.6-35b-a3b's
# thinking-mode reasoning eats most of the budget before output starts, so
# large chunks blow context and get bisected/retried repeatedly. Override by
# passing --token-budget yourself.
_EXTRA_ARGS=()
case " $* " in
    *" --token-budget "*) ;;
    *) _EXTRA_ARGS+=(--token-budget 20000) ;;
esac

# Otherwise exec graphify with remaining args
exec graphify "$@" "${_EXTRA_ARGS[@]}" --backend localai
