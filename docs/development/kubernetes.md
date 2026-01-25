# Kubernetes Access

This guide covers accessing the remote Kubernetes cluster from development machines.

## Remote Cluster Access

The production cluster runs on a remote microk8s instance. To access it from your development machine:

```bash
# Use the microk8s kubeconfig file stored locally
kubectl --kubeconfig ~/.kube/microk8s-local <command>
```

**Important Notes:**
- The `--kubeconfig ~/.kube/microk8s-local` flag is required because the cluster is remote (not a local microk8s instance)
- The `microk8s` CLI is NOT available on development machines - only `kubectl` with the kubeconfig
- Main services are deployed in the `prod` namespace

## Common Commands

### Listing Resources

```bash
# List all pods across all namespaces
kubectl --kubeconfig ~/.kube/microk8s-local get pods -A

# Get pods in prod namespace
kubectl --kubeconfig ~/.kube/microk8s-local -n prod get pods

# Check pod status and restarts
kubectl --kubeconfig ~/.kube/microk8s-local -n prod get pods -o wide

# Watch for pod changes in real-time
kubectl --kubeconfig ~/.kube/microk8s-local -n prod get pods -w
```

### Viewing Logs

```bash
# View agent logs
kubectl --kubeconfig ~/.kube/microk8s-local -n prod logs -l app=agent --tail=100

# View API logs
kubectl --kubeconfig ~/.kube/microk8s-local -n prod logs -l app=api --tail=100

# Get logs with timestamps
kubectl --kubeconfig ~/.kube/microk8s-local -n prod logs <pod-name> --timestamps

# Follow logs in real-time
kubectl --kubeconfig ~/.kube/microk8s-local -n prod logs -f <pod-name>

# Get logs from a specific container in multi-container pod
kubectl --kubeconfig ~/.kube/microk8s-local -n prod logs <pod-name> -c <container-name>

# Search logs for errors
kubectl --kubeconfig ~/.kube/microk8s-local -n prod logs <pod-name> | grep -i error
```

### Debugging

```bash
# Describe a pod for debugging
kubectl --kubeconfig ~/.kube/microk8s-local -n prod describe pod <pod-name>

# Execute command in a pod
kubectl --kubeconfig ~/.kube/microk8s-local -n prod exec -it <pod-name> -- /bin/sh
```

### Deployments

```bash
# Restart a deployment
kubectl --kubeconfig ~/.kube/microk8s-local -n prod rollout restart deployment/<deployment-name>

# Check deployment status
kubectl --kubeconfig ~/.kube/microk8s-local -n prod rollout status deployment/<deployment-name>
```

## Service Labels

| Service | Label Selector |
|---------|----------------|
| API | `app=api` |
| Agent | `app=agent` |
| Worker | `app=worker` |
| AI-Bot | `app=ai-bot` |
| Web | `app=web` |
| Admin | `app=admin` |

## Troubleshooting Guide

1. **Check pod status** - Look for CrashLoopBackOff, ImagePullBackOff
2. **View recent logs** - Check for startup errors or exceptions
3. **Describe pod** - Get detailed status and events
4. **Check resources** - Ensure sufficient CPU/memory
5. **Verify config** - Check ConfigMaps and Secrets
