# Deployment Guide

This guide covers deployment options for the lies.exposed platform.

## Contents

- [Helm Charts](./helm.md) - Kubernetes deployment with Helm

## Deployment Options

### Local Development (Docker Compose)

For local development, use Docker Compose:

```bash
# Start database
docker compose up -d db.liexp.dev

# Start all services
docker compose up
```

See [Getting Started](../getting-started/README.md) for details.

### Production (Kubernetes)

For production, deploy to Kubernetes using Helm charts:

```bash
# Install/upgrade chart
helm upgrade --install lies-exposed ./helm -f values.prod.yaml
```

## Service Ports

| Service | Default Port | Description |
|---------|-------------|-------------|
| API | 3001 | REST API |
| Web | 3000 | Public frontend |
| Admin | 3002 | Admin interface |
| Agent | 3003 | AI chat service |
| Storybook | 6006 | Component docs |

## Environment Configuration

Each service requires environment configuration:

- `.env` - Main environment variables
- `.env.server` - Server-specific (for services with proxy)

Key configuration categories:
- Database connection
- Redis connection
- S3/Spaces storage
- API keys (OpenAI, etc.)
- JWT secrets
- Service URLs

## Docker Images

Images are built for each service:

```bash
# Build all images
docker compose build

# Build specific service
docker compose build api
```

## Health Checks

All services expose health endpoints:

| Service | Endpoint |
|---------|----------|
| API | `GET /healthcheck` |
| Agent | `GET /healthcheck` |
| Web | `GET /` (200 OK) |
| Admin | `GET /` (200 OK) |

## Monitoring

For production deployments:

- Configure logging aggregation
- Set up metrics collection
- Enable distributed tracing
- Create alerting rules

See [Kubernetes Access](../development/kubernetes.md) for debugging production clusters.
