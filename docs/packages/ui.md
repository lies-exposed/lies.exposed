# @liexp/ui

**Location:** `packages/@liexp/ui`

## Purpose

The shared UI package provides:
- Reusable React components for both web and admin
- Design system with consistent theming
- Custom hooks for data fetching and state
- Templates for entity pages
- Admin-specific components for react-admin

## Package Structure

```
packages/@liexp/ui/
├── src/
│   ├── index.ts              # Package exports (theme only)
│   ├── theme/                # MUI theme configuration
│   ├── context/              # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── components/           # Reusable components
│   │   ├── Common/           # Generic UI components
│   │   ├── admin/            # react-admin specific
│   │   ├── events/           # Event-related components
│   │   ├── actors/           # Actor components
│   │   └── ...
│   ├── containers/           # Data-connected components
│   ├── templates/            # Page templates
│   ├── state/                # State management utilities
│   │   └── queries/          # TanStack Query definitions
│   └── utils/                # General utilities
├── assets/                   # CSS and static assets
│   ├── main.css
│   └── blocknote.css
└── lib/                      # Build output
```

## Design System

### Theme Configuration

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

### Exports

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

## Component Categories

### Common Components (`components/Common/`)

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

### Admin Components (`components/admin/`)

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

### Visualization Components (`components/Graph/`)

- **Network/**: D3-based network graphs
- **Flow/**: React Flow integration
- **covid/**: COVID-specific visualizations

## Custom Hooks

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

## Templates

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

## Importing

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

## Development Commands

```bash
pnpm --filter @liexp/ui build     # TypeScript compilation
pnpm --filter @liexp/ui watch     # Watch mode
pnpm --filter @liexp/ui lint      # ESLint
pnpm --filter @liexp/ui test      # Vitest tests
```

## Related Documentation

- [Web Service](../services/web.md) - Uses these components
- [Admin Service](../services/admin.md) - Uses admin components
- [Storybook](../services/storybook.md) - Component documentation
