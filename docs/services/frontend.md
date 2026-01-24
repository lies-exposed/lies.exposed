# Frontend Services Documentation

## Overview

The lies.exposed platform has two frontend services and a shared UI package:

1. **services/web** - Public-facing web application with SSR
2. **services/admin** - Administrative interface built on react-admin
3. **packages/@liexp/ui** - Shared React components, hooks, and design system

---

## 1. Web Service (`services/web`)

### Purpose and Responsibilities

The web service is the public-facing frontend application that provides:
- Server-Side Rendered (SSR) pages for SEO optimization
- Event exploration and fact-checking content display
- Interactive timelines and network graphs
- User authentication and profile management
- Story creation and viewing

### Architecture

#### Build System
- **Bundler**: Vite 7.x with custom SSR configuration
- **TypeScript**: Strict mode with separate configs for client/server
- **Target**: Custom SSR mode (not standard SPA)

#### Server Architecture
The web service uses a dual-render approach:

```
services/web/
├── src/
│   ├── client/           # Client-side React application
│   │   ├── App.tsx       # Main application component
│   │   ├── routes.tsx    # Route definitions with SSR queries
│   │   ├── index.tsx     # Client-side hydration entry
│   │   ├── configuration/
│   │   ├── components/
│   │   ├── pages/        # Page components
│   │   ├── templates/    # Entity detail templates
│   │   └── utils/
│   └── server/           # Express server with SSR
│       ├── server.tsx    # Server entry point
│       ├── createApp.tsx # Express app factory
│       ├── ssr.tsx       # SSR routing logic
│       └── ssr-render.tsx # React SSR rendering
├── public/               # Static assets
├── build/                # Build output (client/ and server/)
└── test/                 # E2E and spec tests
```

#### State Management
- **TanStack Query (React Query)**: Primary data fetching and caching
- **React Context**: Configuration, DataProvider, and theme
- **HydrationBoundary**: SSR state transfer to client

```typescript
// Client entry (src/client/index.tsx)
<BrowserRouter>
  <ConfigurationContext.Provider value={configuration}>
    <DataProviderContext.Provider value={apiProvider}>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <App pathname={location.pathname} />
        </HydrationBoundary>
      </QueryClientProvider>
    </DataProviderContext.Provider>
  </ConfigurationContext.Provider>
</BrowserRouter>
```

#### Routing
- **React Router 7**: Client-side routing
- **path-to-regexp**: Server-side route matching for SSR
- **Lazy Loading**: All page components use `React.lazy()` with Suspense

The routing system (`src/client/routes.tsx`) defines `ServerRoute` objects with:
- `path`: URL pattern
- `route`: React component (lazy loaded)
- `queries`: Function returning SSR data queries

```typescript
interface ServerRoute {
  path: string;
  route: React.FC;
  queries: (Q, conf) => (params, query) => Promise<AsyncDataRouteQuery[]>;
  redirect?: string;
}
```

### Key Components and Pages

#### Pages (`src/client/pages/`)
| Page | Path | Description |
|------|------|-------------|
| `index.tsx` | `/` | Homepage with keyword distribution, recent events |
| `ActorsPage.tsx` | `/actors` | Actor listing with search |
| `GroupsPage.tsx` | `/groups` | Organization listing |
| `KeywordsPage.tsx` | `/keywords` | Topic/hashtag browsing |
| `AreasPage.tsx` | `/areas` | Geographic area exploration |
| `MediaPage.tsx` | `/media` | Media gallery |
| `LinksPage.tsx` | `/links` | External link references |
| `EventsPage.tsx` | `/events` | Main event exploration with filters |
| `BooksPage.tsx` | `/books` | Book-type events |
| `DocumentariesPage.tsx` | `/documentaries` | Documentary events |
| `ProfilePage.tsx` | `/profile/*` | User profile (uses react-admin) |
| `StorySearchPage.tsx` | `/stories` | Story/article listing |

#### Templates (`src/client/templates/`)
Entity detail pages that receive ID props:
- `ActorTemplate.tsx` - Actor profile with related events
- `GroupTemplate.tsx` - Organization profile with members
- `EventTemplate.tsx` - Event detail with relations
- `KeywordTemplate.tsx` - Topic page with event timeline
- `AreaTemplate.tsx` - Geographic location events
- `MediaTemplate.tsx` - Media detail view
- `LinkTemplate.tsx` - External link detail
- `StoryTemplate.tsx` - Story/article content

### Configuration

#### Environment Variables (`.env`)
```bash
# Server Configuration
VIRTUAL_HOST=liexp.dev
VIRTUAL_PORT=80

# Application Configuration
VITE_NODE_ENV=development
VITE_PUBLIC_URL=http://liexp.dev
VITE_DEBUG="@liexp:*,-@liexp:API:debug"

# API URLs
VITE_SSR_API_URL=http://api.liexp.dev/v1  # Server-side API (internal)
VITE_API_URL=http://api.liexp.dev/v1       # Client-side API
VITE_DATA_URL=http://space.liexp.dev       # Static data/assets
VITE_ADMIN_URL=http://admin.liexp.dev/admin
```

#### Configuration Context
```typescript
// src/client/configuration/index.ts
export const configuration: Configuration = {
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  publicUrl: import.meta.env.VITE_PUBLIC_URL,
  platforms: {
    web: { url: "...", defaultImage: "..." },
    admin: { url: "..." },
    api: { url: "..." },
  },
};
```

### Build and Deployment

#### NPM Scripts
```bash
# Development
pnpm dev                    # Start dev server with SSR (tsx watch)
pnpm watch:client           # Vite dev server only (no SSR)

# Building
pnpm build                  # TypeScript compilation only
pnpm build:client           # Vite client bundle
pnpm build:server-ssr       # Vite SSR bundle
pnpm build:server           # Server TypeScript compilation
pnpm build:app-server       # Full production build (all above)

# Testing
pnpm test                   # Run all tests
pnpm test:e2e               # E2E tests only
pnpm test:spec              # Unit tests only

# Production
pnpm serve                  # Run production server
```

#### Build Output Structure
```
build/
├── client/               # Vite client bundle
│   ├── index.html
│   └── assets/
└── server/               # SSR server bundle
    ├── entry.js
    └── server.js
```

### Development Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start Development Server**
   ```bash
   # From services/web or repo root
   pnpm --filter web dev
   ```

3. **Access Application**
   - Development: `http://liexp.dev` (requires hosts file entry)
   - Default port: 3000 (or VIRTUAL_PORT)

---

## 2. Admin Service (`services/admin`)

### Purpose and Responsibilities

The admin service provides content management capabilities:
- CRUD operations for all platform resources
- AI-assisted content creation and editing
- Queue management for background jobs
- User and permission management
- Dashboard with content statistics
- Integrated AI chat assistant

### Architecture

#### Build System
- **Bundler**: Vite 7.x (SPA mode)
- **Framework**: react-admin 5.x
- **TypeScript**: Strict mode with server compilation

```
services/admin/
├── src/
│   ├── index.tsx         # Application entry point
│   ├── AdminPage.tsx     # Main admin component with resources
│   ├── theme.ts          # Admin-specific theme overrides
│   ├── configuration/
│   ├── components/
│   │   ├── chat/         # AI chat integration
│   │   └── MergedEventPreview.tsx
│   ├── hooks/
│   │   └── useStreamingChat.ts
│   ├── pages/            # Admin pages by resource
│   │   ├── actors/
│   │   ├── areas/
│   │   ├── events/
│   │   ├── graphs/
│   │   ├── dashboard/
│   │   └── ...
│   └── server/           # Express proxy server
│       ├── server.tsx
│       ├── createApp.ts
│       └── routes/
│           └── agent-proxy.routes.ts
├── docs/                 # Architecture documentation
├── public/
└── test/
```

#### State Management
- **react-admin DataProvider**: Primary data operations
- **TanStack Query**: Custom queries and caching
- **AgentAPIContext**: AI service communication

```typescript
// Entry point (src/index.tsx)
<ConfigurationContext.Provider value={configuration}>
  <DataProviderContext.Provider value={APIRESTClient(...)}>
    <AgentAPIContext.Provider value={APIRESTClient(...)}>
      <QueryClientProvider client={new QueryClient()}>
        <AdminPage />
      </QueryClientProvider>
    </AgentAPIContext.Provider>
  </DataProviderContext.Provider>
</ConfigurationContext.Provider>
```

### Key Components and Pages

#### Resource Management
The admin uses react-admin `Resource` components for CRUD operations:

| Resource | List | Edit | Create | Description |
|----------|------|------|--------|-------------|
| `pages` | Yes | Yes | Yes | CMS pages |
| `stories` | Yes | Yes | Yes | Articles/stories |
| `media` | Yes | Yes | Yes | Multimedia content |
| `links` | Yes | Yes | Yes | External references |
| `actors` | Yes | Yes | Yes | People/entities |
| `groups` | Yes | Yes | Yes | Organizations |
| `areas` | Yes | Yes | Yes | Geographic locations |
| `keywords` | Yes | Yes | Yes | Topics/tags |
| `events` | Yes | Yes | Yes | Main events |
| `books` | Yes | Yes | Yes | Book events |
| `deaths` | Yes | Yes | Yes | Death events |
| `documentaries` | Yes | Yes | Yes | Documentary events |
| `quotes` | Yes | Yes | Yes | Quote events |
| `patents` | Yes | Yes | Yes | Patent events |
| `scientific-studies` | Yes | Yes | Yes | Scientific study events |
| `transactions` | Yes | Yes | Yes | Transaction events |
| `users` | Yes | Yes | Yes | User management |
| `social-posts` | Yes | Yes | Yes | Social media posts |
| `queues` | Yes | - | Yes | Background job queues |
| `graphs` | Yes | Yes | Yes | Network graphs |
| `nations` | Yes | Yes | Yes | Country data |

#### Custom Pages
- **Dashboard** (`pages/dashboard/AdminStats.tsx`): Media/links statistics
- **Queue Management**: Background job monitoring

#### AI Chat Integration
The admin includes an AI chat assistant (`components/chat/AdminChat.tsx`):
- Streaming chat with Server-Sent Events
- Context-aware assistance (current resource/record)
- Tool call visualization
- M2M authentication via proxy

### Agent Proxy Server

The admin service includes an Express server that proxies AI agent requests:

```typescript
// Key routes (server/routes/agent-proxy.routes.ts)
POST   /api/proxy/agent/chat/message        # Send chat message
POST   /api/proxy/agent/chat/message/stream # Streaming chat (SSE)
GET    /api/proxy/agent/chat/conversations  # List conversations
GET    /api/proxy/agent/chat/conversations/:id
DELETE /api/proxy/agent/chat/conversations/:id
GET    /api/proxy/agent/health              # Health check
```

Features:
- M2M (Machine-to-Machine) authentication
- Rate limiting per authenticated user
- Request auditing with correlation IDs
- Error handling and mapping

### Configuration

#### Environment Variables (`.env`)
```bash
# Node Environment
NODE_ENV=development
DEBUG=@liexp:*

# Frontend Configuration
VITE_NODE_ENV=development
VITE_DEBUG=@liexp:*
VITE_USE_AGENT_PROXY=true  # Enable server-side agent proxy

# URLs
VITE_PUBLIC_URL=http://admin.liexp.dev
VITE_API_URL=http://api.liexp.dev/v1
VITE_WEB_URL=http://liexp.dev
VITE_AGENT_URL=http://agent.liexp.dev/v1
VITE_OPENAI_URL=https://ai.lies.exposed/v1
```

#### Server Environment (`.env.server`)
```bash
# Server binding
SERVER_HOST=0.0.0.0
SERVER_PORT=80

# Agent proxy configuration
AGENT_API_URL=http://agent.liexp.dev/v1

# M2M Authentication
M2M_TOKEN_URL=...
M2M_CLIENT_ID=...
M2M_CLIENT_SECRET=...

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Build and Deployment

#### NPM Scripts
```bash
# Development
pnpm dev                    # Vite dev server (SPA)
pnpm dev:server             # Server with agent proxy

# Building
pnpm build                  # TypeScript compilation
pnpm build:app              # Vite SPA bundle
pnpm build:server           # Server compilation
pnpm build:app-server       # Full production build

# Testing
pnpm test                   # Run tests
pnpm test:e2e               # E2E tests

# Production
pnpm serve                  # Run production server
```

### Development Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start Development**
   ```bash
   # SPA only (no agent proxy)
   pnpm --filter admin dev

   # With agent proxy server
   pnpm --filter admin dev:server
   ```

3. **Access Application**
   - Development: `http://admin.liexp.dev`
   - Default port: 80 (or SERVER_PORT)

---

## 3. UI Package (`packages/@liexp/ui`)

### Purpose and Responsibilities

The shared UI package provides:
- Reusable React components for both web and admin
- Design system with consistent theming
- Custom hooks for data fetching and state
- Templates for entity pages
- Admin-specific components for react-admin

### Package Structure

```
packages/@liexp/ui/
├── src/
│   ├── index.ts              # Package exports (theme only)
│   ├── theme/                # MUI theme configuration
│   ├── context/              # React contexts
│   │   ├── ConfigurationContext.tsx
│   │   ├── DataProviderContext.tsx
│   │   ├── AgentAPIContext.tsx
│   │   └── JSONAPIProviderContext.tsx
│   ├── hooks/                # Custom React hooks
│   ├── components/           # Reusable components
│   │   ├── Common/           # Generic UI components
│   │   ├── admin/            # react-admin specific
│   │   ├── events/           # Event-related components
│   │   ├── actors/           # Actor components
│   │   ├── groups/           # Group components
│   │   ├── keywords/         # Keyword components
│   │   ├── stories/          # Story components
│   │   ├── Media/            # Media display components
│   │   ├── Graph/            # Visualization components
│   │   ├── Chat/             # Chat UI components
│   │   └── ...
│   ├── containers/           # Data-connected components
│   ├── templates/            # Page templates
│   ├── state/                # State management utilities
│   │   └── queries/          # TanStack Query definitions
│   ├── client/               # Client utilities
│   │   └── api.ts            # Auth provider
│   ├── i18n/                 # Internationalization
│   ├── icons/                # Custom icons
│   ├── react/                # React utilities
│   ├── utils/                # General utilities
│   └── vite/                 # Vite plugins
│       └── plugins/
├── assets/                   # CSS and static assets
│   ├── main.css
│   └── blocknote.css
└── lib/                      # Build output
```

### Design System

#### Theme Configuration (`src/theme/index.ts`)
```typescript
const ECOTheme = createTheme({
  palette: {
    primary: {
      main: "#FF5E5B",        // Coral red
      light: lighten("#FF5E5B", 0.5),
      dark: darken("#FF5E5B", 0.5),
    },
    secondary: {
      main: "#17B9B6",        // Teal
      light: lighten("#17B9B6", 0.5),
      dark: darken("#17B9B6", 0.5),
    },
  },
  typography: {
    h1-h6: { fontFamily: "Lora" },      // Headings
    body1: { fontFamily: "Lora" },       // Primary body
    body2: { fontFamily: "Signika" },    // Secondary body
  },
});
```

#### Exports
```typescript
export {
  ECOTheme,          // MUI theme instance
  colors,            // Color constants
  useTheme,          // Theme hook
  styled,            // Styled utility
  themeOptions,      // Raw theme options
  ThemeProvider,     // Provider component
};
```

### Key Component Categories

#### Common Components (`components/Common/`)
- **BlockNote/**: Rich text editor integration
- **Button/**: Custom button variants
- **ErrorBox**: Error display component
- **FullSizeLoader**: Loading overlay
- **Graph/**: Network and flow visualizations
- **Icons/**: Icon library (FontAwesome)
- **Filters/**: Search and filter controls
- **Markdown/**: Markdown rendering
- **Slider/**: Image/content sliders
- **Tree/**: Tree view components
- **JSON/**: JSON viewer/editor

#### Admin Components (`components/admin/`)
- **actors/**: Actor CRUD components
- **areas/**: Area management
- **events/**: Event forms and displays
  - **suggestions/**: AI-suggested events
  - **tabs/**: Tabbed event editing
  - **titles/**: Event title generation
- **groups/**: Group management
- **keywords/**: Keyword/tag management
- **links/**: Link management
- **media/**: Media upload and management
- **stories/**: Story/article editing
- **user/**: User management
- **Modal/**: Admin modal dialogs
- **SocialPost/**: Social media post management
- **toolbar/**: Admin toolbar components

#### Visualization Components (`components/Graph/`)
- **Network/**: D3-based network graphs
- **Flow/**: React Flow integration
- **covid/**: COVID-specific visualizations
- **SocietyCollapseForecastGraph/**
- **WealthDistributionGraph/**

#### Entity Components
- `ActorPageContent.tsx`
- `EventPageContent.tsx`
- `GroupPageContent.tsx`
- `KeywordPageContent.tsx`
- `ProjectPageContent.tsx`

### Custom Hooks (`hooks/`)

| Hook | Purpose |
|------|---------|
| `useAPI` | Generic API calls |
| `useDataProvider` | react-admin DataProvider access |
| `useAgentAPI` | AI agent API access |
| `useAgentDataProvider` | Agent DataProvider access |
| `useEndpointQueriesProvider` | Type-safe endpoint queries |
| `useEndpointRestClient` | REST client access |
| `useModal` | Modal state management |
| `usePopover` | Popover state management |
| `useNLPExtraction` | NLP entity extraction |
| `useWindowsDimensions` | Responsive dimensions |
| `useQueryParams` | URL query parameter access |

### Containers (`containers/`)

Data-connected components that combine hooks and presentation:

| Container | Purpose |
|-----------|---------|
| `ActorsBox` | Actor list with data |
| `AreasBox`, `AreasMapBox` | Area display |
| `EventsBox`, `EventsPanel` | Event listing |
| `EventsNetwork` | Event network graph |
| `GroupsBox` | Group listing |
| `MediaBox`, `MediaSliderBox` | Media display |
| `StoriesBox` | Story listing |
| `StatsPanelBox` | Statistics display |
| `PageContentBox` | CMS page content |

### Templates (`templates/`)

Reusable page layouts:
- `ActorTemplate.tsx` - Actor profile page
- `AreaTemplate.tsx` - Area detail page
- `EventTemplate.tsx` - Event detail page
- `GroupTemplate.tsx` - Group profile page
- `KeywordTemplate.tsx` - Keyword/topic page
- `ExploreTemplate.tsx` - Event exploration
- `SplitPageTemplate.tsx` - Two-column layout
- `MediaSearchTemplate.tsx` - Media search
- `MediaTemplateUI.tsx` - Media detail

### State Management (`state/queries/`)

TanStack Query definitions:
- `SearchEventsQuery.ts` - Event search with pagination
- `DiscreteQueries.ts` - Simple queries
- `github.ts` - GitHub API queries

### Build and Usage

#### NPM Scripts
```bash
pnpm build     # TypeScript compilation to lib/
pnpm watch     # Watch mode
pnpm lint      # ESLint
pnpm test      # Vitest tests
```

#### Package Exports
```json
{
  "exports": {
    ".": "./lib/index.js",
    "./lib/*": "./lib/*",
    "./assets/*": "./assets/*"
  }
}
```

#### Importing in Services
```typescript
// Import components
import { ErrorBox } from "@liexp/ui/lib/components/Common/ErrorBox.js";
import { EventTemplateUI } from "@liexp/ui/lib/templates/EventTemplate.js";

// Import hooks
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";

// Import theme
import { ECOTheme, useTheme } from "@liexp/ui/lib/theme/index.js";

// Import CSS
import "@liexp/ui/assets/main.css";
import "@liexp/ui/assets/blocknote.css";
```

---

## Key Dependencies

### Shared Across All Frontend Services

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | DOM rendering |
| `react-router` | ^7.12.0 | Client-side routing |
| `@tanstack/react-query` | ^5.90.2 | Data fetching/caching |
| `@mui/material` | ^7.3.7 | UI components |
| `@emotion/react` | ^11.14.0 | CSS-in-JS |
| `effect` | ^3.19.14 | Functional effects |
| `fp-ts` | ^2.16.10 | Functional programming |
| `vite` | ^7.3.1 | Build tool |
| `typescript` | ^5.9.3 | Type system |

### Web Service Specific
- `express` - HTTP server
- `@liexp/backend` - Express utilities
- `react-error-boundary` - Error handling
- `ra-core`, `ra-i18n-polyglot` - react-admin core

### Admin Service Specific
- `react-admin` - Admin framework
- `openai` - AI integration
- `cors` - CORS middleware
- `web-vitals` - Performance monitoring

### UI Package Specific
- `@blocknote/*` - Rich text editor
- `@visx/*` - Data visualization
- `@xyflow/react` - Flow diagrams
- `d3`, `d3-*` - Data visualization
- `ol` (OpenLayers) - Maps
- `react-virtualized` - Virtual scrolling
- `react-markdown` - Markdown rendering

---

## Development Workflow

### Running All Frontend Services

```bash
# Start database (required)
docker compose up -d db.liexp.dev

# Start API (required for data)
pnpm --filter api dev

# Start web service
pnpm --filter web dev

# Start admin service
pnpm --filter admin dev
```

### Testing

```bash
# All UI package tests
pnpm --filter @liexp/ui test

# Web service tests
pnpm --filter web test

# Admin service tests
pnpm --filter admin test
```

### Type Checking

```bash
# Check all packages
pnpm typecheck

# Specific service
pnpm --filter web typecheck
pnpm --filter admin typecheck
pnpm --filter @liexp/ui typecheck
```

### Linting

```bash
pnpm --filter web lint
pnpm --filter admin lint
pnpm --filter @liexp/ui lint
```

---

## 4. Storybook Service (`services/storybook`)

### Purpose and Responsibilities

The Storybook service provides:
- Interactive component documentation
- Visual testing environment for UI components
- Design system showcase
- Component usage examples and patterns

### Architecture

```
services/storybook/
├── .storybook/          # Storybook configuration
│   ├── main.ts          # Main config (addons, framework)
│   └── preview.ts       # Preview configuration
├── src/
│   └── stories/         # Component stories
├── public/              # Static assets
└── build/               # Production build output
```

### Key Features

- **Storybook 10.x**: Latest Storybook with Vite integration
- **React-Vite Builder**: Fast HMR and builds
- **Addon Docs**: Auto-generated documentation
- **Addon Links**: Navigation between stories
- **@liexp/ui Integration**: Showcases all shared components

### Development Commands

```bash
# Start Storybook development server
pnpm --filter @liexp/storybook dev

# Build static Storybook
pnpm --filter @liexp/storybook build:app

# From services/storybook directory
pnpm dev        # Start on port 6006
pnpm build:app  # Build static site
```

### Access

- Development: `http://storybook.liexp.dev:6006`

### Configuration

The Storybook service uses:
- **@storybook/react-vite**: React framework integration
- **@storybook/addon-docs**: Documentation generation
- **@storybook/addon-links**: Story navigation

All `@liexp/ui` components are documented with:
- Props documentation
- Usage examples
- Interactive controls
- Design token references

---

*This documentation covers the key architectural decisions, component organization, configuration patterns, and development workflows for the frontend services in the lies.exposed monorepo.*
