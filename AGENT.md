# AI Agents Documentation

This document outlines the AI agents, models, and automated systems used in the lies.exposed platform - a fact-checking and information analysis system.

## Getting Started

### Prerequisites
- Node.js v18 or higher
- pnpm v8 or higher
- Docker and Docker Compose
- Git

### First-Time Setup
1. **Clone the Repository**
   ```bash
   git clone https://github.com/lies-exposed/lies.exposed.git
   cd lies.exposed
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Environment**
   ```bash
   pnpm dev
   ```

### Development Environment
- **VS Code Setup**: Use the provided `.vscode` settings
- **Docker Services**: Run required services with `docker compose up`
- **Watch Mode**: Use `pnpm watch` for live reloading
- **Type Checking**: Run `pnpm typecheck` to verify types

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

### Development Best Practices and Priorities

#### Common Pitfalls and Solutions
- **OpenAI Structured Output Issues**
  - **CRITICAL**: All properties must be required in schemas for OpenAI structured output
  - Never use `Schema.optional()`, `Schema.UndefinedOr()`, or similar optional patterns
  - Use `Schema.NullOr()` for truly optional values
  - Avoid `Schema.DateFromString` (creates ZodEffects); use `Schema.String` with validation instead
  - Use sentinel values like `"unknown"`, `"N/A"` for missing data
  - See the "OpenAI Structured Output Requirements" section for complete guidelines

- **MCP Server Issues**
  - Always verify server connectivity before implementation
  - Check authentication token validity
  - Handle rate limiting appropriately
  - Cache responses when possible

- **Code Review Guidelines**
  - Verify MCP documentation compliance
  - Check type safety across boundaries
  - Ensure error handling follows fp-ts patterns
  - Confirm test coverage meets requirements
  - **CRITICAL**: Verify OpenAI structured output schemas have no optional properties

- **Troubleshooting Guide**
  1. Check MCP server logs
  2. Verify type definitions
  3. Review Effect/fp-ts chain composition
  4. Validate environmental configuration
  5. For OpenAI structured output errors: Check schema has only required properties

#### 1. Documentation First Through MCP Servers
- **CRITICAL**: Always consult MCP servers for documentation before implementation
- Use MCP documentation tools to understand available capabilities and interfaces
- Check for existing implementations and patterns in the documentation
- Validate your approach against documented best practices

##### Using Context7 for Library Documentation
Before starting any implementation work:
1. **Configure Libraries**: Ensure the following libraries are configured:
   - `/fp-ts/fp-ts`: Core functional programming utilities
   - `/effect-ts/effect`: Modern functional effects system (source code)
   - `effect-ts.github.io/effect`: Model function effect system (docs)
   - `/facebook/react`: UI framework
   - `/marmelab/react-admin`: Admin interface framework
   - `/mui/material-ui`: UI component library (source code)
   - `mui.com/docs`: UI Component library (docs)

2. **Retrieve Documentation**:
   - Use VS Code's MCP commands to query library documentation
   - Access up-to-date documentation for fp-ts, Effect, React, and other core libraries
   - Search for specific APIs, hooks, or patterns you plan to use

3. **Verify Patterns**:
   - Review official examples and best practices
   - Understand the functional programming patterns with fp-ts and Effect
   - Check React component patterns and hooks usage
   - Validate admin interface patterns with react-admin

4. **Implementation Alignment**:
   - Ensure your planned implementation follows documented patterns
   - Reference the correct versions of library APIs
   - Follow the functional programming principles outlined in documentation

#### 2. Implementation Priority Order
1. **Functionality**: Ensure core logic works as expected
2. **Type Safety**: Verify all TypeScript types are correct
3. **Tests**: Write and run comprehensive tests
4. **Code Style**: Address formatting and linting issues last

#### 3. Code Organization
- **Imports**: Ensure all necessary imports are properly added and organized
  - Use absolute imports from packages (e.g., `@liexp/core`)
  - Include all required Effect/fp-ts imports
  - Order imports: external → internal → types
- **Error Handling**: Properly handle errors using Effect/fp-ts patterns
- **Type Definitions**: Define and export necessary types

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

### State Management

#### Application State Architecture
- **Effect/fp-ts Integration**
  - State encapsulation using `Effect`
  - Side effect management with `TaskEither`
  - Error channel handling with `Either`
  - Optional value handling with `Option`

#### React Integration
- **Component State Management**
  - Using Effect hooks with React
  - Managing async operations
  - Error boundary integration
  - State invalidation patterns

#### Best Practices
- Keep state transformations pure
- Use Effect for all side effects
- Implement proper error recovery
- Cache invalidation strategies
- State persistence patterns

#### Common Patterns
```typescript
// State update pattern
const updateState = pipe(
  Effect.Do,
  Effect.bind("current", () => getCurrentState),
  Effect.bind("new", ({ current }) => validateAndTransform(current)),
  Effect.tap(({ new }) => persistState(new))
)

// Async state management
const fetchAndProcess = pipe(
  fetchData,
  Effect.flatMap(processData),
  Effect.catchAll(handleError),
  Effect.provideService(LoggerLive)
)
```

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

### OpenAI Structured Output Requirements

**CRITICAL**: When using OpenAI's structured output feature with Zod schemas, all properties must be required. OpenAI does not support optional properties in structured output schemas.

#### Schema Design Guidelines for OpenAI Structured Output

1. **All Properties Must Be Required**:
   ```typescript
   // ❌ WRONG - Optional properties not supported by OpenAI structured output
   const ActorSchema = Schema.Struct({
     name: Schema.String,
     bornOn: Schema.optional(Schema.String), // This will cause errors
     diedOn: Schema.UndefinedOr(Schema.String), // This will cause errors
   });
   ```

   ```typescript
   // ✅ CORRECT - All properties required, use null for missing values
   const ActorSchema = Schema.Struct({
     name: Schema.String,
     bornOn: Schema.String, // Always provide a value or "unknown"
     diedOn: Schema.NullOr(Schema.String), // Use null instead of undefined
   });
   ```

2. **Date Handling Best Practices**:
   ```typescript
   // ✅ For string dates (recommended for structured output)
   bornOn: Schema.String.annotations({
     description: "Birth date in ISO format (YYYY-MM-DD) or 'unknown' if not available",
   }),
   
   // ✅ Alternative: Use NullOr for truly optional dates
   diedOn: Schema.NullOr(Schema.String.annotations({
     description: "Death date in ISO format (YYYY-MM-DD) or null if still alive",
   })),
   ```

3. **Array and Object Properties**:
   ```typescript
   // ✅ Arrays should always be present (can be empty)
   keywords: Schema.Array(Schema.String), // Returns [] if no keywords
   
   // ✅ Objects should have all required sub-properties
   address: Schema.Struct({
     street: Schema.String, // Use "unknown" or empty string if not available
     city: Schema.String,
     country: Schema.String,
   }),
   ```

4. **Handling Missing Information**:
   - Use descriptive fallback values: `"unknown"`, `"not specified"`, `"N/A"`
   - For dates: Use `"unknown"` or a specific date format for missing values
   - For numbers: Use `-1`, `0`, or other sentinel values as appropriate
   - For booleans: Always provide explicit `true`/`false` based on context

5. **Schema Conversion Considerations**:
   ```typescript
   // When using effectToZodObject for OpenAI structured output:
   const responseFormat = effectToZodObject(MySchema.fields);
   
   // Ensure the resulting Zod schema has no optional properties
   // The LLM will be forced to provide values for all fields
   ```

#### Common Anti-Patterns to Avoid

- ❌ Using `Schema.optional()` or `Schema.UndefinedOr()` for structured output
- ❌ Using `Schema.DateFromString` (creates ZodEffects, not simple string validation)
- ❌ Expecting the LLM to omit properties when they're unknown
- ❌ Using complex transformations that create ZodEffects instead of simple types

#### Recommended Pattern for AI Flows

```typescript
const StructuredResponseSchema = Schema.Struct({
  // Always required string properties
  name: Schema.String,
  description: Schema.String,
  
  // Use null for truly optional values
  optionalField: Schema.NullOr(Schema.String),
  
  // Use sentinel values for unknown data
  unknownDate: Schema.String.annotations({
    description: "Date in YYYY-MM-DD format or 'unknown' if not available",
  }),
  
  // Arrays are always present (empty if no items)
  tags: Schema.Array(Schema.String),
}).annotations({ 
  description: "Structured response with all required fields" 
});
```

### Quality Assurance
- **Multi-Model Validation**: Critical analyses use multiple AI models for verification
- **Human Review**: Automated outputs are flagged for human review when confidence is low
- **Continuous Learning**: Models are fine-tuned based on human feedback

#### Implementation Quality Checklist
1. **Documentation Review**:
   - ✓ Review MCP server documentation
   - ✓ Understand available tools and patterns
   - ✓ Check existing implementations

2. **Core Implementation**:
   - ✓ Implement core functionality
   - ✓ Add proper type definitions
   - ✓ Handle errors appropriately

3. **Testing and Validation**:
   - ✓ Write comprehensive tests
   - ✓ Verify type safety
   - ✓ Run test suite
   - **CRITICAL**: Verify OpenAI structured output schemas have no optional properties

4. **Code Cleanup**:
   - ✓ Organize imports
   - ✓ Fix formatting issues
   - ✓ Address linting warnings

## Testing Guidelines

### Test Types and Organization

#### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Focus on pure business logic
- Use vitest for fast execution

```typescript
describe("effectToZodStruct", () => {
  it("should convert Effect schema to Zod", () => {
    const schema = S.struct({
      name: S.string,
      age: S.number
    })
    const zod = effectToZodStruct(schema)
    expect(zod.parse({ name: "test", age: 25 })).toEqual({ name: "test", age: 25 })
  })
})
```

#### Integration Tests
- Test service interactions
- Validate MCP server integration
- Check database operations
- Test API endpoints

#### E2E Tests
- Full user journey testing
- Cross-service integration
- Performance benchmarking
- Load testing critical paths

#### E2E tests in the repo (services/api)

- Test bootstrap: `services/api/test/AppTest.ts` exposes `GetAppTest()` which returns an `AppTest` object:
  - `ctx`: ServerContext (DB, mocked providers, config)
  - `mocks`: dependency mocks (axios, puppeteer, s3, redis, queue, etc.)
  - `req`: supertest agent bound to `makeApp(ctx)` for issuing HTTP requests

- Recommended helpers to reuse in tests:
  - `saveUser(Test.ctx, scopes)` — creates a test user with specific permissions
  - `loginUser(Test)(user)` — logs a user and returns `{ authorization }` header value
  - `@liexp/test` arbitraries (e.g. `MediaArb`, `ProjectArb`, `KeywordArb`) for generating payloads

- Test patterns already used in the codebase (copy these):
  - call `Test = await GetAppTest()` in `beforeAll`
  - create user via `saveUser` and retrieve token via `loginUser`
  - use `Test.req.get/post/...` (supertest) to call endpoints and assert status/body

- AppTest notes:
  - External providers are mocked by default inside `AppTest` (axios, puppeteer, s3, ffmpeg, etc.), so e2e tests remain deterministic
  - Tests still require a reachable Postgres DB; `process.env.DB_DATABASE` must point to the test DB when running

- How to run API e2e tests locally:

```bash
# from repo root - runs only api tests
pnpm --filter services/api test

# or from inside services/api
pnpm test
```

Keep tests small and focused to avoid flakiness. Start with smoke tests (healthcheck, simple CRUD) and reuse existing mocks in `AppTest` for deterministic runs.

### Testing Best Practices

#### Test Structure
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Isolate test cases
- Clean up test data

#### Mock Data
- Use factories for consistent data
- Share fixtures across tests
- Version test data with code
- Document data scenarios

#### Coverage Requirements
- Minimum 80% coverage
- Critical paths 100% covered
- Document uncovered edge cases
- Regular coverage audits

### Performance Testing
- Measure response times
- Test under load
- Profile memory usage
- Monitor API limits

## Project Structure Conventions

### File Organization
```
src/
├── routes/           # API routes and controllers
│   ├── mcp/         # MCP server implementations
│   └── api/         # REST API endpoints
├── services/        # Business logic services
├── models/          # Domain models and types
└── utils/          # Shared utilities
```

### Build Output Structure
**IMPORTANT**: Always edit source files, never build outputs:
- **Packages** (`@liexp/*`): Source code in `src/`, build output in `lib/`
- **Services**: Source code in `src/`, build output in `build/`

When making code changes:
- ✅ Edit files in `src/` directories
- ❌ Never edit files in `lib/` or `build/` directories (these are generated)

### Naming Conventions
- **Files**: 
  - `kebab-case.ts` for utilities
  - `PascalCase.ts` for classes/types
  - `index.ts` for barrel files
- **Functions**: 
  - camelCase for regular functions
  - PascalCase for constructors
- **Types/Interfaces**: 
  - PascalCase
  - Prefix interfaces with 'I'
- **Constants**: 
  - UPPER_SNAKE_CASE

### Code Generation
- Use provided templates
- Follow type generation patterns
- Maintain consistency with existing code
- Document generated code

### Documentation Standards
- JSDoc for public APIs
- Markdown for guides
- Type documentation
- Example usage
- Update docs with code changes

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

## Monorepo & pnpm notes

- This repository is a pnpm workspace (monorepo). You can run package scripts from the repository root using the package filter syntax. For example, to run the `lint` script in the `api` service from the project root run:

  `pnpm --filter api run lint`  (or the shorthand `pnpm api lint` when using pnpm's workspace command aliases)

- Always check your current working directory before running pnpm commands. If you're inside a package folder (for example, `services/api`), you can run scripts without the workspace filter, e.g.:

  `pnpm run lint` (when your shell cwd is `/path/to/lies.exposed/services/api`)

- If you need to change directory from scripts or automation, prefer using absolute paths to avoid ambiguity. Example in a shell script:

  `cd /home/andreaascari/Workspace/lies-exposed/services/api && pnpm run migration:run`

  This ensures scripts behave the same regardless of the caller's current directory.

---

*This documentation is maintained alongside the codebase. For technical implementation details, refer to the source code in `services/ai-bot/` and `services/worker/`.*