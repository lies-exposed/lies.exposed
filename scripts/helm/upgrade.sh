#!/usr/bin/env bash

set -e -x

dev=false
name=lies-exposed
namespace=prod
kubeconfig=microk8s-local

cp -f ./services/api/.env.prod ./helm/config/env/api.env
cp -f ./services/web/.env.prod ./helm/config/env/web.env
cp -f ./services/admin-web/.env.prod ./helm/config/env/admin-web.env
cp -f ./services/ai-bot/.env.prod ./helm/config/env/ai-bot.env
cp -f ./services/agent/.env.prod ./helm/config/env/agent.env
cp -f ./services/worker/.env.prod ./helm/config/env/worker.env


# Loop through script arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dev)
            dev=true
            name=lies-exposed
            namespace=liexp-dev
            shift
            ;;
        *)
            other_args+=("$1")
            shift
            ;;
    esac
done

cmd="upgrade $name ./helm \
    --take-ownership \
    --namespace $namespace"

if [ "$dev" = true ]; then
    cmd="$cmd -f ./helm/values.dev.yaml"
else
    cmd="$cmd -f ./helm/values.prod.yaml"
fi

helm $cmd --kubeconfig ~/.kube/$kubeconfig "${other_args[@]}"
