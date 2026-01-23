# Bash completion for agent scripts
# Source this file in your .bashrc:
#   source /path/to/lies-exposed/scripts/agent/completions.bash

_agent_names() {
    local agents_dir="${LIES_EXPOSED_ROOT:-.}/.agents"
    if [ -d "$agents_dir" ]; then
        ls -1 "$agents_dir" 2>/dev/null
    fi
}

_git_branches() {
    local repo_root="${LIES_EXPOSED_ROOT:-.}"
    git -C "$repo_root" branch -a 2>/dev/null | sed 's/^[* ]*//' | sed 's|remotes/origin/||' | sort -u
}

_service_names() {
    echo "api web admin worker agent"
}

_agent_spawn_completions() {
    local cur="${COMP_WORDS[COMP_CWORD]}"
    local prev="${COMP_WORDS[COMP_CWORD-1]}"

    case $COMP_CWORD in
        1)
            # First arg: suggest nothing (user chooses agent name)
            COMPREPLY=()
            ;;
        2)
            # Second arg: branch names
            COMPREPLY=($(compgen -W "$(_git_branches)" -- "$cur"))
            ;;
        3)
            # Third arg: --run flag
            COMPREPLY=($(compgen -W "--run" -- "$cur"))
            ;;
    esac
}

_agent_run_completions() {
    local cur="${COMP_WORDS[COMP_CWORD]}"

    case $COMP_CWORD in
        1)
            # First arg: existing agent names or new name
            COMPREPLY=($(compgen -W "$(_agent_names)" -- "$cur"))
            ;;
        2)
            # Second arg: branch names (for new agents)
            COMPREPLY=($(compgen -W "$(_git_branches)" -- "$cur"))
            ;;
    esac
}

_agent_cleanup_completions() {
    local cur="${COMP_WORDS[COMP_CWORD]}"

    case $COMP_CWORD in
        1)
            # First arg: existing agent names
            COMPREPLY=($(compgen -W "$(_agent_names)" -- "$cur"))
            ;;
        2)
            # Second arg: --force flag
            COMPREPLY=($(compgen -W "--force" -- "$cur"))
            ;;
    esac
}

_agent_test_service_completions() {
    local cur="${COMP_WORDS[COMP_CWORD]}"

    case $COMP_CWORD in
        1)
            # First arg: existing agent names
            COMPREPLY=($(compgen -W "$(_agent_names)" -- "$cur"))
            ;;
        2)
            # Second arg: service names
            COMPREPLY=($(compgen -W "$(_service_names)" -- "$cur"))
            ;;
        3)
            # Third arg: --packages flag
            COMPREPLY=($(compgen -W "--packages" -- "$cur"))
            ;;
    esac
}

_agent_stop_test_completions() {
    local cur="${COMP_WORDS[COMP_CWORD]}"

    case $COMP_CWORD in
        1)
            # First arg: existing agent names
            COMPREPLY=($(compgen -W "$(_agent_names)" -- "$cur"))
            ;;
    esac
}

# Register completions
complete -F _agent_spawn_completions spawn.sh
complete -F _agent_run_completions run.sh
complete -F _agent_cleanup_completions cleanup.sh
complete -F _agent_test_service_completions test-service.sh
complete -F _agent_stop_test_completions stop-test.sh

# Also register for full paths (when called from repo root)
complete -F _agent_spawn_completions ./scripts/agent/spawn.sh
complete -F _agent_run_completions ./scripts/agent/run.sh
complete -F _agent_cleanup_completions ./scripts/agent/cleanup.sh
complete -F _agent_test_service_completions ./scripts/agent/test-service.sh
complete -F _agent_stop_test_completions ./scripts/agent/stop-test.sh
