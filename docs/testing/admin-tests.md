# Admin Component Tests

This document describes the testing pattern introduced in PR #3393 for testing react-admin components in the admin service.

## Overview

The admin tests use a custom `adminTest` fixture that wraps components in real react-admin context (`AdminContext` + `RecordContextProvider` + `ResourceContext.Provider`) instead of mocking every hook individually. HTTP calls from sub-components are intercepted via MSW.

## Key Files

| File | Purpose |
|------|---------|
| `services/admin/test/adminTest.tsx` | Main test fixture implementation |
| `services/admin/test/specSetup.ts` | Vitest configuration |
| `services/admin/vitest.config.spec.ts` | Test runner config |

## Usage Pattern

### Basic Structure

```typescript
import { adminTest } from "../../../test/adminTest.js";

describe("ComponentName", () => {
  adminTest("test description", async ({ render }) => {
    const { getByRole } = render(<MyComponent />, { 
      record: myRecord,
      permissions: ["admin:read"]
    });
    expect(getByRole("button")).toBeInTheDocument();
  });
});
```

### Test Fixture API

The `adminTest` fixture provides:

| Property | Type | Description |
|----------|------|-------------|
| `render` | `(ui, options) => Promise<RenderResult>` | Renders component in admin context |
| `mocks` | `AdminMocks` | Pre-configured auth/data providers |

#### Render Options

```typescript
interface RenderOptions {
  record?: Record<string, unknown>;     // Record for RecordContextProvider
  permissions?: string[];               // User permissions (default: [])
  resource?: string;                    // Resource name (default: "links")
  id?: string;                          // Route :id param (default: record.id or "test-id")
}
```

### Test Data Generation

Use fast-check arbitraries from `@liexp/test` to generate realistic test data:

```typescript
import { Group, fc } from "@liexp/test/lib/index.js";

const [baseRecord] = fc.sample(Group.GroupArb, 1);
const record = { ...baseRecord };
```

## Example Test

```typescript
import { Group, fc } from "@liexp/test/lib/index.js";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect } from "vitest";
import { adminTest } from "../../../test/adminTest.js";
import { GroupEdit } from "../AdminGroups.js";

const [baseRecord] = fc.sample(Group.GroupArb, 1);
const record = { ...baseRecord };

describe("GroupEdit", () => {
  adminTest("should render the EditForm wrapper", async ({ render }) => {
    await render(<GroupEdit />, { resource: "groups", record });
    await waitFor(() => {
      expect(document.querySelector(".tabbed-form")).toBeInTheDocument();
    });
  });

  adminTest("should render admin-only fields for admin users", async ({ render }) => {
    await render(<GroupEdit />, { 
      resource: "groups", 
      record,
      permissions: ["admin:read"] 
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });
  });
});
```

## How It Works

### Context Setup

The fixture provides:

1. **AdminContext** - react-admin's main context with:
   - Mocked `authProvider` (default permissions: `[]`)
   - Mocked `dataProvider` (returns test record)
   - Custom `routerProvider` with test-specific overrides

2. **ResourceContext.Provider** - Sets the resource name

3. **RecordContextProvider** - Provides the record for form components

4. **QueryClientProvider** - Shared React Query client with retries disabled

### Mock Providers

The fixture auto-mocks:

- `authProvider.getPermissions()` - Returns user permissions
- `authProvider.getIdentity()` - Returns test user identity
- `authProvider.canAccess()` - Returns `true` by default
- `dataProvider.getOne()` - Returns the provided record
- `dataProvider.getList()` / `getMany()` / `getManyReference()` - Return empty arrays

### Custom Router Provider

The test uses a custom `routerProvider` that:
- Skips internal router creation (`RouterWrapper = Fragment`)
- Injects test record id into `useParams()`
- Provides no-op `Routes`/`Route` components to avoid router context issues
- Uses `MemoryRouter` for direct react-router calls

### MSW Integration

MSW intercepts all HTTP calls from nested components, returning:
- `GET *` → `{ data: [], total: 0 }`
- `POST *` → `{ data: {} }`

## Running Admin Tests

```bash
# Run admin tests
pnpm --filter @liexp/admin test

# Run with coverage
pnpm --filter @liexp/admin test:coverage
```

## Best Practices

### Do

- Use arbitraries for test data generation
- Test both admin and non-admin permission levels
- Use `waitFor` for async component rendering
- Access hidden elements via `document.getElementById()` when tabs are aria-hidden

### Don't

- Mock individual hooks - the fixture handles context
- Hardcode record IDs - use arbitraries
- Forget to await `render()` - it's async
- Test negative assertions - test what SHOULD exist
