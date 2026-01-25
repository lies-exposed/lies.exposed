# Getting Started

This guide covers everything you need to start developing on the lies.exposed platform.

## Prerequisites

- **Node.js** v18 or higher
- **pnpm** v8 or higher
- **Docker** and Docker Compose
- **PostgreSQL** 14+ (via Docker or local)
- **Redis** 6+ (via Docker or local)
- **Git**

## First-Time Setup

### 1. Clone the Repository

```bash
git clone https://github.com/lies-exposed/lies.exposed.git
cd lies.exposed
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Infrastructure

```bash
# Start database and Redis
docker compose up -d db.liexp.dev
```

### 5. Build All Packages

```bash
pnpm build
```

### 6. Run Database Migrations

```bash
pnpm --filter api migration:run
```

### 7. Start Development Services

```bash
# Terminal 1 - API
pnpm --filter api dev

# Terminal 2 - Worker (optional)
pnpm --filter worker dev

# Terminal 3 - Agent (optional)
pnpm --filter agent dev

# Terminal 4 - Web
pnpm --filter web dev

# Terminal 5 - Admin
pnpm --filter admin dev
```

## Docker Compose Development

The project uses Docker Compose for local development to ensure consistency across environments.

### Basic Commands

```bash
# Build base images
docker compose build

# Start database in background
docker compose up -d db.liexp.dev

# Start main services
docker compose up api web.liexp.dev admin.liexp.dev
```

### Development Workflow

1. **Hot Reload**: Services support hot reload for rapid development
2. **Watch Mode**: Run `pnpm api watch` in a separate shell for API changes
3. **Container Development**: Each service runs in its own container with mounted volumes

### Service Configuration

| Service | Port | Description |
|---------|------|-------------|
| API | 3001 | REST API with TypeORM migrations |
| Web | 3000 | Frontend with Vite dev server |
| Admin | 3002 | Admin interface |
| AI-Bot | - | Background processing service |
| Worker | - | Automation and social media tasks |

## Development URLs

| Service | URL |
|---------|-----|
| Web | http://liexp.dev |
| Admin | http://admin.liexp.dev |
| API | http://api.liexp.dev/v1 |
| Agent | http://agent.liexp.dev/v1 |
| Storybook | http://storybook.liexp.dev:6006 |

> **Note**: You may need to add these domains to your `/etc/hosts` file:
> ```
> 127.0.0.1 liexp.dev admin.liexp.dev api.liexp.dev agent.liexp.dev storybook.liexp.dev
> ```

## pnpm Workspace Notes

This repository is a pnpm workspace (monorepo). You can run package scripts from the repository root using the filter syntax:

```bash
# Run lint in the api service from repo root
pnpm --filter api run lint

# Or use the shorthand
pnpm api lint
```

When inside a package folder, you can run scripts directly:

```bash
cd services/api
pnpm run lint
```

For scripts that change directories, prefer absolute paths:

```bash
cd /home/user/lies.exposed/services/api && pnpm run migration:run
```

## VS Code Setup

The repository includes VS Code settings in `.vscode/`. These provide:

- Recommended extensions
- Editor settings (formatting, linting)
- Debug configurations
- Task definitions

## Next Steps

- [Services Overview](../services/README.md) - Learn about the platform architecture
- [Development Guide](../development/README.md) - Best practices and workflows
- [Testing Guide](../testing/README.md) - Writing and running tests
