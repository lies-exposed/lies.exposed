# Helm Deployment

The platform deploys to Kubernetes using Helm charts located in `helm/`.

## Chart Structure

```
helm/
├── Chart.yaml              # Chart metadata
├── values.yaml            # Default configuration
├── templates/
│   ├── services/          # Service deployments
│   ├── network/           # Ingress and networking
│   ├── secrets/           # Secret management
│   └── policies/          # Security policies
```

## Deployment Process

### Development to Production

1. **Development**: Local testing with `compose.yml`
2. **Staging**: Helm deployment to staging cluster
3. **Production**: Helm deployment with production values

### Install/Upgrade

```bash
# Install chart
helm install lies-exposed ./helm -n prod

# Upgrade existing deployment
helm upgrade lies-exposed ./helm -n prod -f values.prod.yaml

# Dry run to preview changes
helm upgrade lies-exposed ./helm -n prod --dry-run
```

## Key Features

### Service Mesh

- Network policies for inter-service communication
- Service discovery
- Traffic routing

### Secrets Management

- Secure handling of API keys and credentials
- Secret injection from Kubernetes secrets
- ConfigMap for non-sensitive configuration

### Ingress

- Nginx-based routing
- SSL termination
- Host-based routing

### Scaling

- Horizontal pod autoscaling for API and worker services
- Resource requests and limits
- Pod disruption budgets

### Health Checks

- Readiness probes for all services
- Liveness probes for crash recovery
- Startup probes for slow-starting services

## Configuration Management

### Values Files

```bash
# Default values
values.yaml

# Environment-specific
values.dev.yaml
values.staging.yaml
values.prod.yaml
```

### Common Overrides

```yaml
# values.prod.yaml
api:
  replicas: 3
  resources:
    limits:
      cpu: "1000m"
      memory: "1Gi"

worker:
  replicas: 2

ingress:
  enabled: true
  hosts:
    - host: api.lies.exposed
      paths:
        - path: /
          service: api
```

## Secret Configuration

Create secrets before deployment:

```bash
# Create database secret
kubectl create secret generic db-credentials \
  --from-literal=DB_USERNAME=user \
  --from-literal=DB_PASSWORD=password \
  -n prod

# Create API keys secret
kubectl create secret generic api-keys \
  --from-literal=OPENAI_API_KEY=sk-xxx \
  --from-literal=JWT_SECRET=xxx \
  -n prod
```

## Troubleshooting

### Check Deployment Status

```bash
kubectl get pods -n prod
kubectl get deployments -n prod
kubectl describe deployment api -n prod
```

### View Logs

```bash
kubectl logs -l app=api -n prod --tail=100
kubectl logs -l app=worker -n prod --tail=100
```

### Rollback

```bash
# List releases
helm history lies-exposed -n prod

# Rollback to previous
helm rollback lies-exposed -n prod

# Rollback to specific revision
helm rollback lies-exposed 3 -n prod
```

## Related Documentation

- [Kubernetes Access](../development/kubernetes.md) - Remote cluster access
- [Services Overview](../services/README.md) - Service architecture
