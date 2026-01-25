# Web Service

**Location:** `services/web`

## Purpose

The web service is the public-facing frontend application that provides:
- Server-Side Rendered (SSR) pages for SEO optimization
- Event exploration and fact-checking content display
- Interactive timelines and network graphs
- User authentication and profile management
- Story creation and viewing

## Architecture

### Build System

- **Bundler**: Vite 7.x with custom SSR configuration
- **TypeScript**: Strict mode with separate configs for client/server
- **Target**: Custom SSR mode (not standard SPA)

### Directory Structure

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

### State Management

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

### Routing

- **React Router 7**: Client-side routing
- **path-to-regexp**: Server-side route matching for SSR
- **Lazy Loading**: All page components use `React.lazy()` with Suspense

```typescript
interface ServerRoute {
  path: string;
  route: React.FC;
  queries: (Q, conf) => (params, query) => Promise<AsyncDataRouteQuery[]>;
  redirect?: string;
}
```

## Pages

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

## Templates

Entity detail pages that receive ID props:
- `ActorTemplate.tsx` - Actor profile with related events
- `GroupTemplate.tsx` - Organization profile with members
- `EventTemplate.tsx` - Event detail with relations
- `KeywordTemplate.tsx` - Topic page with event timeline
- `AreaTemplate.tsx` - Geographic location events
- `MediaTemplate.tsx` - Media detail view
- `LinkTemplate.tsx` - External link detail
- `StoryTemplate.tsx` - Story/article content

## Configuration

### Environment Variables

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

## Build and Deployment

### NPM Scripts

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

### Build Output

```
build/
├── client/               # Vite client bundle
│   ├── index.html
│   └── assets/
└── server/               # SSR server bundle
    ├── entry.js
    └── server.js
```

## Development

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start Development Server**
   ```bash
   pnpm --filter web dev
   ```

3. **Access Application**
   - Development: `http://liexp.dev` (requires hosts file entry)
   - Default port: 3000

## Related Documentation

- [UI Package](../packages/ui.md) - Shared React components
- [Admin Service](./admin.md) - Admin interface
