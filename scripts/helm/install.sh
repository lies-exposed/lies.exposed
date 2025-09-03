#!/usr/bin/env bash

set -e -x

name=lies-exposed
namespace=prod
kubeconfig=microk8s-local

cp -f ./services/api/.env.prod ./helm/config/env/api.env
cp -f ./services/web/.env.prod ./helm/config/env/web.env
cp -f ./services/admin-web/.env.prod ./helm/config/env/admin-web.env
cp -f ./services/ai-bot/.env.prod ./helm/config/env/ai-bot.env
cp -f ./services/worker/.env.prod ./helm/config/env/worker.env

# Loop through script arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dev)
            name=liexp-dev
            namespace=dev
            kubeconfig=config
            shift
            ;;
        *)
            other_args+=("$1")
            shift
            ;;
    esac
done

helm repo add stakater https://stakater.github.io/stakater-charts
helm repo update
helm install reloader stakater/reloader \
    --create-namespace --namespace $namespace \
     --kubeconfig ~/.kube/$kubeconfig

helm install $name ./helm \
    --create-namespace --namespace $namespace \
    --kubeconfig ~/.kube/$kubeconfig \
    -f ./helm/values.prod.yaml "${other_args[@]}"
