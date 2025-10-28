#!/usr/bin/env bash

set -e -x

namespace=prod
kubeconfig=microk8s-local

# default deployments
default_deployments=(api ai-bot agent web admin-web worker storybook)

# collect deployments from script arguments (allow overriding namespace and kubeconfig if needed)
deployments=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -n|--namespace)
            namespace="$2"
            shift 2
            ;;
        -k|--kubeconfig)
            kubeconfig="$2"
            shift 2
            ;;
        *)
            deployments+=("$1")
            shift
            ;;
    esac
done

# if no deployments provided, use defaults
if [[ ${#deployments[@]} -eq 0 ]]; then
    deployments=("${default_deployments[@]}")
fi

kubectl --kubeconfig "$HOME/.kube/$kubeconfig" rollout restart deployments "${deployments[@]}" --namespace "$namespace"
