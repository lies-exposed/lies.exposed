#!/usr/bin/env bash

set -e -x

namespace=prod
kubeconfig=microk8s-local

# Loop through script arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        *)
            other_args+=("$1")
            shift
            ;;
    esac
done

kubectl --kubeconfig ~/.kube/$kubeconfig rollout restart deployments api ai-bot web admin worker storybook  --namespace $namespace
