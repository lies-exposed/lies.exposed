# Worker Service

The Worker service is a background processing service for the lies.exposed platform that handles automated data enrichment, social media management, and content processing tasks.

## Purpose

The Worker service provides:

- **Background Automation**: Processes long-running tasks asynchronously using Redis-based job queues
- **Social Media Integration**: Automated posting to Instagram and Telegram platforms
- **Data Enrichment**: Fetches and enriches actor, group, and area data from Wikipedia
- **Media Processing**: Generates thumbnails and processes multimedia content
- **NLP Processing**: Upserts Named Entity Recognition (NER) data for content analysis
- **Statistics Generation**: Creates analytics and reporting data
- **File Management**: Handles temporary file cleanup and media transfers

## Development

### Prerequisites

- Node.js v18 or higher
- pnpm v8 or higher
- PostgreSQL database
- Redis server
- Docker (for containerized development)

### Start Development

1. **Install dependencies** (from monorepo root):
   ```bash
   pnpm install
   ```

2. **Build the project**:
   ```bash
   pnpm worker build
   # or from services/worker directory:
   pnpm build
   ```

3. **Start in development mode**:
   ```bash
   pnpm worker dev
   # or from services/worker directory:
   pnpm dev
   ```

4. **Watch mode for live reloading**:
   ```bash
   pnpm worker watch
   # or from services/worker directory:
   pnpm watch
   ```

### Docker Development

```bash
# Start the worker service in Docker
docker compose up worker

# Development with hot reloading
docker compose up worker --build
```

## Build

### TypeScript Compilation

```bash
# Build from monorepo root
pnpm worker build

# Build from services/worker directory
pnpm build

# Watch mode (rebuild on changes)
pnpm watch
```

### Production Build

```bash
# Clean previous build
pnpm clean

# Build for production
pnpm build

# Start production server
pnpm start
```

### Package Binary (SEA - Single Executable Application)

```bash
# Create standalone executable
pnpm pkg
```

## CLI Commands

The Worker service provides several CLI commands for manual execution and debugging:

### Available Commands

```bash
# Run CLI with help
pnpm bin:run --help

# Generate missing thumbnails for media
pnpm bin:generate-thumbnails
# or with limit
node ./build/bin/cli.js generate-missing-thumbnails 50

# Upsert NLP entities
pnpm bin:upsert-nlp-entities
# or directly
node ./build/bin/cli.js upsert-nlp-entities
```

### Command Details

| Command | Description | Parameters |
|---------|-------------|------------|
| `generate-missing-thumbnails` | Generates thumbnails for media without thumbnails | `[limit]` - Optional number to process |
| `upsert-nlp-entities` | Updates Named Entity Recognition data | None |

### CLI Usage Examples

```bash
# Process all media without thumbnails
node ./build/bin/cli.js generate-missing-thumbnails

# Process only 10 media items
node ./build/bin/cli.js generate-missing-thumbnails 10

# Update NLP entities
node ./build/bin/cli.js upsert-nlp-entities
```

## Kubernetes Jobs

The Worker service can be deployed as Kubernetes Jobs and CronJobs for scheduled and manual execution.

### CronJobs (Scheduled)

- **`worker-generate-thumbnails`**: Daily thumbnail generation at 2 AM UTC
- **`worker-upsert-nlp-entities`**: Daily NLP entity processing at 1 AM UTC

### Manual Jobs (On-demand)

- **`worker-generate-thumbnails-manual`**: One-time thumbnail generation
- **`worker-upsert-nlp-entities-manual`**: One-time NLP entity processing

### Configuration

Configure jobs in Helm values:

```yaml
worker:
  generateThumbnails:
    enabled: true
    schedule: "0 2 * * *"
    limit: null
    resources:
      limits:
        memory: "1Gi"
        cpu: "500m"
      requests:
        memory: "512Mi"
        cpu: "200m"
    manualJob:
      enabled: false
      limit: null
      resources:
        limits:
          memory: "1Gi"
          cpu: "500m"
        requests:
          memory: "512Mi"
          cpu: "200m"

  upsertNLPEntities:
    enabled: true
    schedule: "0 1 * * *"
    manualJob:
      enabled: false
```

### Deployment

```bash
# Deploy CronJobs
helm upgrade --install lies-exposed ./helm --set worker.generateThumbnails.enabled=true

# Deploy manual Job
helm upgrade --install lies-exposed ./helm --set worker.generateThumbnails.manualJob.enabled=true

# Check job status
kubectl get cronjobs
kubectl get jobs
```

### Job Templates

Job templates are located in:
- `helm/templates/services/worker/generate-thumbnails.cronjob.yaml`
- `helm/templates/services/worker/generate-thumbnails.job.yaml`
- `helm/templates/services/worker/upsert-nlp-entities.cronjob.yaml`
- `helm/templates/services/worker/upsert-nlp-entities.job.yaml`

## Dependencies

### Monorepo Packages

The Worker service depends on the following packages within the lies.exposed monorepo:

- **[@liexp/backend](../../packages/@liexp/backend)**: Backend utilities and common server functionality
  - Database models and TypeORM entities
  - Service abstractions and middleware
  - Shared business logic

- **[@liexp/core](../../packages/@liexp/core)**: Core utilities and configurations
  - ESLint configurations and build tools
  - Shared constants and utilities
  - Environment configuration helpers

- **[@liexp/shared](../../packages/@liexp/shared)**: Domain models and API definitions
  - TypeScript interfaces and types
  - API endpoint definitions
  - Validation schemas and business rules

### External Dependencies

Key external dependencies include:

- **Effect & fp-ts**: Functional programming utilities
- **TypeORM**: Database ORM for PostgreSQL
- **IORedis**: Redis client for job queuing
- **Sharp**: Image processing for thumbnails
- **Puppeteer**: Web scraping and automation
- **Fluent-FFmpeg**: Video processing
- **Instagram Private API**: Instagram integration
- **Node Telegram Bot API**: Telegram integration
- **Wink NLP**: Natural Language Processing

## Related Services

- **[API Service](../api)**: Main REST API that orchestrates worker jobs
- **[AI Bot Service](../ai-bot)**: AI processing service that queues jobs for the worker
- **[Web Service](../web)**: Frontend that displays processed data
- **[Admin Web Service](../admin-web)**: Administrative interface for managing jobs

## Architecture

The Worker service follows a functional programming approach using:

- **Effect**: Modern functional effects system
- **fp-ts**: Core functional programming utilities
- **TypeScript**: Type-safe development
- **Node.js ES Modules**: Modern JavaScript module system

### Project Structure

```
services/worker/
├── src/
│   ├── bin/              # CLI commands
│   ├── context/          # Application context
│   ├── flows/            # Business logic flows
│   ├── jobs/             # Cron job definitions
│   ├── io/               # Input/output and environment
│   ├── providers/        # External service providers
│   ├── services/         # Core services
│   └── utils/            # Utility functions
├── build/                # Compiled JavaScript output
├── config/               # Configuration files
├── temp/                 # Temporary file storage
└── test/                 # Test files
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm build` | Compile TypeScript to JavaScript |
| `pnpm dev` | Start development server with hot reload |
| `pnpm start` | Start production server |
| `pnpm watch` | Build in watch mode |
| `pnpm typecheck` | Type checking without compilation |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests with Vitest |
| `pnpm clean` | Remove build directory |
| `pnpm pkg` | Create standalone executable |

For more information about the lies.exposed platform, see the [main repository documentation](../../README.md).