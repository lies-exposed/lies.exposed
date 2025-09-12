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

intel_plugin_version=v0.34.0
kubectl --kubeconfig ~/.kube/$kubeconfig apply -k "https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/nfd?ref=$intel_plugin_version"

# Create NodeFeatureRules for detecting GPUs on nodes
kubectl --kubeconfig ~/.kube/$kubeconfig apply -k "https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/nfd/overlays/node-feature-rules?ref=$intel_plugin_version"

# Create GPU plugin daemonset
kubectl --kubeconfig ~/.kube/$kubeconfig apply -n $namespace -k "https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/gpu_plugin/overlays/nfd_labeled_nodes?ref=$intel_plugin_version"
kubectl --kubeconfig ~/.kube/$kubeconfig apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.18.2/cert-manager.yaml
kubectl --kubeconfig ~/.kube/$kubeconfig apply -k "https://github.com/intel/intel-device-plugins-for-kubernetes/deployments/operator/default?ref=$intel_plugin_version"

# check GPU plugin 
kubectl --kubeconfig ~/.kube/$kubeconfig get nodes -o=jsonpath="{range .items[*]}{.metadata.name}{'\n'}{' i915: '}{.status.allocatable.gpu\.intel\.com/i915}{'\n'}"
kubectl --kubeconfig ~/.kube/$kubeconfig get no -n $namespace -o json | jq .status.capacity
helm repo add stakater https://stakater.github.io/stakater-charts
helm repo update
helm install reloader stakater/reloader \
    --create-namespace --namespace $namespace \
     --kubeconfig ~/.kube/$kubeconfig

helm install $name ./helm \
    --create-namespace --namespace $namespace \
    --kubeconfig ~/.kube/$kubeconfig \
    -f ./helm/values.prod.yaml "${other_args[@]}"
