# AI Agents Documentation

This document outlines the AI agents, models, and automated systems used in the lies.exposed platform - a fact-checking and information analysis system.

## Overview

The lies.exposed platform employs multiple AI agents and models to automatically process, analyze, and fact-check information from various sources. The system is designed to detect misinformation, create structured event data, and provide intelligent content analysis.

## AI Services Architecture

### 1. AI Bot Service (`services/ai-bot/`)

The primary AI processing service that handles intelligent content analysis and event creation.

**Key Capabilities:**
- **Text Summarization**: Automatically summarizes long-form content
- **Event Extraction**: Creates structured event data from unstructured text and URLs
- **Entity Recognition**: Identifies and processes actors, groups, and links
- **Content Embedding**: Generates semantic embeddings for content analysis
- **Question Answering**: Provides intelligent responses based on content analysis

**Core Flows:**
- `summarizeTextFlow`: Summarizes text content using AI models
- `embedAndQuestionFlow`: Creates embeddings and answers questions about content
- `createEventFromURLFlow`: Extracts structured events from web URLs
- `createEventFromTextFlow`: Extracts structured events from raw text
- `updateEventFlow`: Intelligently updates existing event data

**Supported Resource Types:**
- **Actors**: People and entities involved in events
- **Groups**: Organizations and collective entities
- **Links**: Web resources and references
- **Media**: Images, videos, and multimedia content
- **Events**: Structured fact-based events

### 2. Worker Service (`services/worker/`)

Background automation service for data enrichment and social media management.

**Key Capabilities:**
- **Wikipedia Integration**: Fetches and creates entities from Wikipedia
- **Social Media Automation**: Posts content to multiple platforms
- **Media Processing**: Handles multimedia content transfer and processing
- **Statistics Generation**: Creates analytics and reporting data
- **File System Management**: Manages temporary files and cleanup

**Automation Flows:**
- `fetchAndCreateActorFromWikipedia`: Enriches actor data from Wikipedia
- `fetchAndCreateAreaFromWikipedia`: Enriches geographical area data
- `fetchGroupFromWikipedia`: Enriches group/organization data
- `postToIG`: Instagram posting automation
- `postToTG`: Telegram posting automation
- `postToPlatforms`: Multi-platform social media posting
- `transferFromExternalProvider`: Media transfer and processing
- `createStats`: Analytics generation

### 3. API Service (`services/api/`)

The core REST API backend that serves all data and orchestrates AI operations.

**Key Capabilities:**
- **RESTful API**: Comprehensive endpoints for all platform resources
- **Authentication & Authorization**: JWT-based security with role-based access
- **Database Management**: TypeORM-based data persistence with PostgreSQL
- **Queue Management**: Redis-based job queuing for AI operations
- **File Upload**: Multimedia content handling and processing
- **Integration Layer**: Bridges frontend applications with AI services

**Core Features:**
- Actor, Group, Link, Event, and Media management
- User authentication and profile management
- Database migrations and schema management
- Social media integration
- Real-time notifications

### 4. Web Service (`services/web/`)

The public-facing frontend application built with React and Server-Side Rendering.

**Key Capabilities:**
- **Public Interface**: Main website for fact-checking content
- **Server-Side Rendering**: Optimized performance with Vite SSR
- **Content Display**: Interactive event timelines and fact-checking reports
- **Search & Discovery**: Advanced content search and filtering
- **Responsive Design**: Mobile-optimized user experience

### 5. Admin Web Service (`services/admin-web/`)

Administrative interface for content management and system configuration.

**Key Capabilities:**
- **Content Management**: CRUD operations for all platform resources
- **AI Integration**: Direct access to AI processing workflows
- **User Management**: Admin tools for user accounts and permissions
- **Analytics Dashboard**: System metrics and content statistics
- **Moderation Tools**: Content review and approval workflows

## Project Architecture

### Core Packages

The platform is built using a monorepo architecture with shared packages:

#### `@liexp/core`
- **Purpose**: Core utilities, configurations, and common functionality
- **Features**: ESLint configurations, build tools, shared constants
- **Usage**: Foundation layer used by all services

#### `@liexp/shared`
- **Purpose**: Domain models, API definitions, and business logic
- **Features**: TypeScript interfaces, API endpoints, validation schemas
- **Integration**: Shared between frontend and backend for type safety

#### `@liexp/ui` 
- **Purpose**: Reusable React components and design system
- **Features**: UI components, themes, styling utilities
- **Usage**: Used by web and admin-web services for consistent UX

#### `@liexp/backend`
- **Purpose**: Backend utilities and common server functionality
- **Features**: Database models, service abstractions, middleware
- **Usage**: Shared by API and AI services

#### `@liexp/test`
- **Purpose**: Testing utilities and shared test configurations
- **Features**: Mock factories, test helpers, common assertions
- **Usage**: Testing infrastructure for all packages and services

### Supporting Services

#### Storybook Service (`services/storybook/`)
- **Purpose**: Component documentation and design system showcase
- **Features**: Interactive component library, design tokens, usage examples

## Development Guidelines

### Functional Programming with fp-ts and Effect

The codebase follows functional programming principles using two main libraries:

#### fp-ts
- **Purpose**: Core functional programming utilities for TypeScript
- **Usage**: Used throughout the codebase for:
  - Data transformation pipelines (`pipe`, `flow`)
  - Error handling with `Either` and `Option` types
  - Asynchronous operations with `TaskEither` and `ReaderTaskEither`
  - Array and object manipulations with type safety

**Example Pattern:**
```typescript
pipe(
  fp.RTE.Do,
  fp.RTE.bind("data", () => loadData()),
  fp.RTE.chainEitherK(validateData),
  fp.RTE.map(processData)
)
```

#### Effect
- **Purpose**: Modern functional effects system for TypeScript
- **Usage**: Gradually replacing fp-ts in new code for:
  - More ergonomic error handling
  - Better composition of effects
  - Enhanced type inference
  - Schema validation and transformation

**Key Principles:**
- Prefer immutable data structures
- Use pure functions with explicit side effects
- Leverage type-level programming for better safety
- Compose operations using function composition

### Local Development with Docker

#### Docker Compose Setup
The project uses Docker Compose for local development to ensure consistency across environments:

```bash
# Build base images
docker compose build

# Start database in background
docker compose up -d db.liexp.dev

# Start main services
docker compose up api web.liexp.dev admin.liexp.dev
```

#### Development Workflow
1. **Hot Reload**: Services support hot reload for rapid development
2. **Watch Mode**: Run `pnpm api watch` in a separate shell for API changes
3. **Container Development**: Each service runs in its own container with mounted volumes
4. **Database**: PostgreSQL and Redis services are containerized

#### Service Configuration
- **API**: Exposed on port 3001 with TypeORM migrations
- **Web**: Frontend on port 3000 with Vite dev server
- **Admin Web**: Admin interface on port 3002
- **AI Bot**: Background processing service
- **Worker**: Automation and social media tasks

### Deployment with Helm

#### Kubernetes Deployment
The platform deploys to Kubernetes using Helm charts located in `helm/`:

#### Chart Structure
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

#### Deployment Process
1. **Development**: Local testing with `compose.yml`
2. **Staging**: Helm deployment to staging cluster
3. **Production**: Helm deployment with production values

#### Key Features
- **Service Mesh**: Network policies for inter-service communication
- **Secrets Management**: Secure handling of API keys and credentials
- **Ingress**: Nginx-based routing and SSL termination
- **Scaling**: Horizontal pod autoscaling for API and worker services
- **Monitoring**: Integrated logging and metrics collection

#### Configuration Management
- Environment-specific values files
- Secret injection from Kubernetes secrets
- ConfigMap management for non-sensitive configuration
- Health checks and readiness probes for all services

## AI Processing Workflows

### Content Analysis Pipeline
1. **Content Ingestion**: URLs, PDFs, and text are loaded using specialized loaders
2. **Document Processing**: Content is chunked and processed using LangChain
3. **Entity Extraction**: AI models identify actors, groups, locations, and events
4. **Fact Verification**: Content is analyzed for factual accuracy
5. **Structured Output**: Results are formatted as JSON following predefined schemas

### Event Creation Workflow
1. **Source Analysis**: URLs or text are analyzed for event content
2. **Entity Recognition**: Relevant entities (people, organizations, places) are identified
3. **Temporal Analysis**: Dates and timelines are extracted
4. **Relationship Mapping**: Connections between entities are established
5. **Fact Scoring**: Claims are evaluated for veracity
6. **Publication**: Structured events are created in the system

### Quality Assurance
- **Multi-Model Validation**: Critical analyses use multiple AI models for verification
- **Human Review**: Automated outputs are flagged for human review when confidence is low
- **Continuous Learning**: Models are fine-tuned based on human feedback

## Integration Points

### External APIs
- **OpenAI**: Backup processing for complex tasks
- **LocalAI**: Primary inference engine for local model deployment
- **Wikipedia**: Entity enrichment and fact-checking
- **Social Media APIs**: Content distribution

### Data Sources
- **Web Scraping**: Automated content collection using Puppeteer
- **PDF Processing**: Document analysis using PDF.js
- **Media Analysis**: Image and video content processing
- **Social Monitoring**: Real-time social media analysis

## Deployment

The AI services are containerized and deployed using:
- **Docker Compose**: Local development (`compose.yml`)
- **Kubernetes**: Production deployment via Helm charts (`helm/`)
- **Model Storage**: Large models stored locally in `models/` directory

## Monitoring and Observability

- **Logging**: Structured logging for all AI operations
- **Error Handling**: Comprehensive error tracking and recovery
- **Performance Metrics**: Model inference timing and accuracy tracking
- **Queue Management**: Job processing with Redis-based queuing

## Security and Privacy

- **Local Processing**: Sensitive content processed on local infrastructure
- **API Key Management**: Secure storage of external API credentials
- **Data Retention**: Configurable retention policies for processed content
- **Access Control**: Role-based access to AI capabilities

---

*This documentation is maintained alongside the codebase. For technical implementation details, refer to the source code in `services/ai-bot/` and `services/worker/`.*
