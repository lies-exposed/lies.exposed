# Storybook Service

**Location:** `services/storybook`

## Purpose

The Storybook service provides:
- Interactive component documentation
- Visual testing environment for UI components
- Design system showcase
- Component usage examples and patterns

## Architecture

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

## Key Features

- **Storybook 10.x**: Latest Storybook with Vite integration
- **React-Vite Builder**: Fast HMR and builds
- **Addon Docs**: Auto-generated documentation
- **Addon Links**: Navigation between stories
- **@liexp/ui Integration**: Showcases all shared components

## Development Commands

```bash
# Start Storybook development server
pnpm --filter @liexp/storybook dev

# Build static Storybook
pnpm --filter @liexp/storybook build:app

# From services/storybook directory
pnpm dev        # Start on port 6006
pnpm build:app  # Build static site
```

## Access

- Development: `http://storybook.liexp.dev:6006`

## Configuration

The Storybook service uses:
- **@storybook/react-vite**: React framework integration
- **@storybook/addon-docs**: Documentation generation
- **@storybook/addon-links**: Story navigation

All `@liexp/ui` components are documented with:
- Props documentation
- Usage examples
- Interactive controls
- Design token references

## Related Documentation

- [UI Package](../packages/ui.md) - The components being documented
- [Web Service](./web.md) - Public frontend using these components
- [Admin Service](./admin.md) - Admin interface using these components
