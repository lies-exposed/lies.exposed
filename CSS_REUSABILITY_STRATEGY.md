# CSS Reusability & Pattern Organization Strategy

## Current Architecture Analysis

### ✅ What's Already Good

1. **Centralized MUI Theme** (`@liexp/ui/src/theme/index.ts`)
   - Single source of truth for colors, typography, spacing
   - Component overrides for consistent styling across app
   - Already handles mobile breakpoints (600px, 600px+)
   - Light/Dark mode support built-in

2. **@liexp/ui Package Structure**
   - Centralized component library
   - Exported from single index
   - Reusable across all services (web, admin)

3. **MUI Component Overrides** Already in Theme
   - `MuiButton` - Mobile touch targets (44px minimum)
   - `MuiIconButton` - Mobile sized buttons
   - `MuiTabs` - Scrollable with auto scroll buttons
   - `MuiTextField`, `MuiInputBase` - Mobile input sizing
   - All configured in theme, not scattered in components

### ⚠️ Potential Issues to Prevent

1. **Inline Styles in Components** - Hard to maintain, override theme
2. **Multiple CSS Patterns** - Inconsistent across codebase
3. **Component-Scoped CSS** - Duplicated styles in multiple components
4. **Theme Overrides at Component Level** - Should be in central theme
5. **Magic Numbers** - Should use theme spacing, breakpoints
6. **Hardcoded Colors** - Should use theme palette

---

## Recommended Pattern Organization

### 1. Theme-First Approach (ALWAYS START HERE)

All styling should flow from the MUI theme. Never hardcode values.

#### ❌ Don't Do This:
```typescript
// BAD: Hardcoded values scattered in component
<Box sx={{ 
  padding: '16px',
  backgroundColor: '#FF5E5B',
  fontSize: '14px',
  '@media (max-width: 600px)': {
    padding: '8px',
    fontSize: '12px'
  }
}}>
```

#### ✅ Do This:
```typescript
// GOOD: Use theme tokens
import { useTheme } from '@mui/material/styles';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{
      padding: theme.spacing(2),  // 16px
      backgroundColor: theme.palette.primary.main,
      fontSize: theme.typography.body2.fontSize,
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),  // 8px
        fontSize: theme.typography.caption.fontSize,
      }
    }}>
```

### 2. Layered Styling Strategy

Create a clear hierarchy for where styling happens:

#### Layer 1: Theme Configuration (CENTRALIZED)
```typescript
// @liexp/ui/src/theme/index.ts
// - Global palette colors
// - Typography scales (h1, h2, body1, body2)
// - Component defaults (MuiButton, MuiCard, etc.)
// - Breakpoints and spacing scale
```

#### Layer 2: Component-Level Tokens (REUSABLE)
```typescript
// @liexp/ui/src/theme/components.ts (NEW)
// Export reusable component style objects

export const cardStyles = {
  base: {
    borderRadius: 1,
    boxShadow: 1,
    transition: 'all 200ms ease-in-out',
    '&:hover': {
      boxShadow: 3,
    }
  },
  mobile: {
    padding: 2,
    gap: 2,
  },
  tablet: {
    padding: 3,
    gap: 3,
  }
}

export const buttonStyles = {
  primary: {
    textTransform: 'none',
    fontWeight: 600,
  },
  mobile: {
    minHeight: 44,
    minWidth: 44,
  }
}
```

#### Layer 3: Composed Components (SPECIFIC)
```typescript
// @liexp/ui/src/components/EventCard.tsx
// Use theme + component tokens, add specific logic

<Card 
  sx={{
    ...cardStyles.base,
    ...cardStyles.mobile,
    [theme.breakpoints.up('md')]: {
      ...cardStyles.tablet,
    }
  }}
>
  {/* content */}
</Card>
```

### 3. Spacing Scale (Don't Use Magic Numbers)

Utilize MUI spacing system consistently:

```typescript
// In all components, use theme.spacing(n) where n = 1-12
// 1 unit = 8px by default in MUI

theme.spacing(1)   // 8px
theme.spacing(2)   // 16px
theme.spacing(3)   // 24px
theme.spacing(4)   // 32px
theme.spacing(6)   // 48px
```

#### Instead of:
```typescript
gap: '8px'
padding: '16px'
marginTop: '24px'
```

#### Use:
```typescript
gap: theme.spacing(1)
padding: theme.spacing(2)
marginTop: theme.spacing(3)
```

### 4. Component Variants Pattern

Create variants for common components to reduce duplication:

```typescript
// @liexp/ui/src/components/Card/CardVariants.ts
import { SxProps, Theme } from '@mui/material/styles';

export const cardVariants = {
  elevated: {
    boxShadow: 2,
    '&:hover': { boxShadow: 4 }
  },
  outlined: {
    border: 1,
    borderColor: 'divider',
    '&:hover': { borderColor: 'primary.main' }
  },
  flat: {
    backgroundColor: 'grey.100',
    '&:hover': { backgroundColor: 'grey.200' }
  },
} as const;

// Usage in components:
<Card sx={{ ...cardVariants.elevated }}>
```

### 5. Responsive Behavior Pattern

Keep responsive logic organized and consistent:

```typescript
// PATTERN: Mobile-first with breakpoint escalation
const responsiveStyles = {
  // Mobile defaults
  padding: theme.spacing(2),
  fontSize: theme.typography.body2.fontSize,
  gridTemplateColumns: '1fr',  // single column
  
  // Tablet
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  
  // Desktop
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  
  // Large
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
}
```

### 6. Extract Common Patterns to Utilities

If a style pattern repeats 2+ times, extract it:

```typescript
// @liexp/ui/src/theme/styleUtils.ts
export const flexCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const ellipsisText = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const truncateLines = (lines: number = 2) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

// Usage:
<Box sx={{ ...ellipsisText }}>Long text</Box>
<Typography sx={{ ...truncateLines(3) }}>Multiple lines</Typography>
```

### 7. Component-Specific Style Organization

For complex components, organize styles clearly:

```typescript
// @liexp/ui/src/components/EventCard/EventCard.styles.ts
import { SxProps, Theme } from '@mui/material/styles';

export const eventCardStyles = {
  container: {
    borderRadius: 1,
    overflow: 'hidden',
    transition: 'all 200ms',
    '&:hover': {
      boxShadow: 4,
    }
  } as SxProps<Theme>,
  
  media: {
    height: 200,
    objectFit: 'cover',
  } as SxProps<Theme>,
  
  content: {
    padding: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  } as SxProps<Theme>,
  
  title: {
    fontWeight: 600,
    fontSize: theme => theme.typography.h6.fontSize,
  } as SxProps<Theme>,
  
  actions: {
    padding: 2,
    paddingTop: 0,
    display: 'flex',
    gap: 1,
  } as SxProps<Theme>,
} as const;

// Usage:
export const EventCard = (props) => (
  <Card sx={eventCardStyles.container}>
    <CardMedia sx={eventCardStyles.media} image={...} />
    <CardContent sx={eventCardStyles.content}>
      <Typography sx={eventCardStyles.title}>{title}</Typography>
    </CardContent>
    <CardActions sx={eventCardStyles.actions}>
      {/* buttons */}
    </CardActions>
  </Card>
);
```

---

## File Structure for Maximum Reusability

```
@liexp/ui/
├── src/
│   ├── theme/
│   │   ├── index.ts                    (Main theme config)
│   │   ├── palettes/                   (Color schemes)
│   │   │   ├── light.ts
│   │   │   └── dark.ts
│   │   ├── typography.ts               (Font scales)
│   │   ├── breakpoints.ts              (Responsive sizes)
│   │   ├── components/                 (MUI component overrides)
│   │   │   ├── button.ts
│   │   │   ├── card.ts
│   │   │   ├── input.ts
│   │   │   └── tabs.ts
│   │   ├── styleUtils.ts               (Reusable style patterns)
│   │   └── variants.ts                 (Component variants)
│   │
│   ├── components/
│   │   ├── Common/                     (Atomic - single responsibility)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   ├── Cards/                      (Compound - specific use cases)
│   │   │   ├── Events/
│   │   │   │   ├── EventCard.tsx       (Uses Common + EventCard.styles.ts)
│   │   │   │   ├── EventCard.styles.ts
│   │   │   │   ├── EventCardGrid.tsx   (Uses Common + Grid utilities)
│   │   │   │   └── index.ts
│   │   │   ├── Actors/
│   │   │   │   ├── ActorCard.tsx
│   │   │   │   ├── ActorCard.styles.ts
│   │   │   │   └── index.ts
│   │   │   └── ...
│   │   │
│   │   ├── Lists/
│   │   │   ├── EventList.tsx
│   │   │   ├── ActorList.tsx
│   │   │   └── ...
│   │   │
│   │   └── Layouts/
│   │       ├── Container.tsx
│   │       ├── Grid.tsx
│   │       └── Stack.tsx
│   │
│   └── hooks/
│       ├── useResponsive.ts            (Media query hook)
│       ├── useTheme.ts                 (Theme access)
│       └── useThemeMediaQuery.ts       (Already exists in MUI)
```

---

## CSS Bloat Prevention Rules

### ✅ DO:

1. **Use theme tokens everywhere**
   ```typescript
   backgroundColor: theme.palette.primary.main
   padding: theme.spacing(2)
   fontSize: theme.typography.body1.fontSize
   ```

2. **Centralize repeating patterns**
   ```typescript
   // If you write the same sx prop 2+ times, extract it
   const sharedStyles = { /* ... */ }
   ```

3. **Use component overrides in theme**
   ```typescript
   // For ALL MuiButton, use theme, not component prop
   themeOptions.components.MuiButton.styleOverrides
   ```

4. **Compose styles from smaller pieces**
   ```typescript
   sx={{
     ...baseStyles,
     ...variant.elevated,
     [theme.breakpoints.down('sm')]: {
       ...mobileOverrides
     }
   }}
   ```

5. **Use theme's breakpoints**
   ```typescript
   [theme.breakpoints.up('md')]: { /* styles */ }
   [theme.breakpoints.down('sm')]: { /* styles */ }
   ```

### ❌ DON'T:

1. **Hardcode colors**
   ```typescript
   // ❌ Never
   backgroundColor: '#FF5E5B'
   
   // ✅ Always
   backgroundColor: theme.palette.primary.main
   ```

2. **Use magic numbers for spacing**
   ```typescript
   // ❌ Never
   padding: '16px 24px'
   margin: '8px'
   
   // ✅ Always
   padding: theme.spacing(2, 3)
   margin: theme.spacing(1)
   ```

3. **Duplicate styles across components**
   ```typescript
   // ❌ If you copy-paste sx props, extract them
   
   // ✅ Create a shared styles file
   export const cardStyles = { /* ... */ }
   ```

4. **Use inline styles for complex styling**
   ```typescript
   // ❌ Multiple lines in component
   <Box style={{ padding: '16px', /* many lines */ }}>
   
   // ✅ Move to sx or styles file
   <Box sx={myStyles.container}>
   ```

5. **Hardcode breakpoints**
   ```typescript
   // ❌ Never
   '@media (max-width: 600px)': { /* */ }
   
   // ✅ Always
   [theme.breakpoints.down('sm')]: { /* */ }
   ```

6. **Create CSS files for component styling**
   ```typescript
   // ❌ Don't create .css or .module.css
   // ✅ Use sx prop or theme overrides
   ```

---

## Implementation Checklist

- [ ] Review all existing components in @liexp/ui
- [ ] Create `@liexp/ui/src/theme/styleUtils.ts` with reusable patterns
- [ ] Create `@liexp/ui/src/theme/variants.ts` for component variants
- [ ] Audit all hardcoded colors - replace with theme.palette
- [ ] Audit all magic numbers - replace with theme.spacing
- [ ] Audit all hardcoded breakpoints - replace with theme.breakpoints
- [ ] Create `.styles.ts` files for complex components (EventCard, etc.)
- [ ] Add JSDoc to theme exports explaining usage
- [ ] Create a STYLING_GUIDE.md in @liexp/ui documenting patterns
- [ ] Add ESLint rule to catch hardcoded colors (eslint-plugin-mui)
- [ ] Audit and consolidate MUI component overrides
- [ ] Ensure ALL mobile styles are in theme, not scattered

---

## Example: Refactoring EventCard

### BEFORE (Scattered):
```typescript
// services/web/src/client/components/EventCardCustom.tsx
const EventCard = (props) => (
  <Card style={{ padding: '16px', marginBottom: '8px' }}>
    <div style={{ backgroundColor: '#FF5E5B', padding: '12px' }}>
      {/* hardcoded color, no reuse */}
    </div>
  </Card>
)
```

### AFTER (Centralized):
```typescript
// @liexp/ui/src/components/Cards/Events/EventCard.styles.ts
export const eventCardStyles = {
  container: {
    padding: theme => theme.spacing(2),
    marginBottom: theme => theme.spacing(1),
  },
  header: {
    backgroundColor: theme => theme.palette.primary.main,
    padding: theme => theme.spacing(1.5),
  }
} as const;

// @liexp/ui/src/components/Cards/Events/EventCard.tsx
import { eventCardStyles } from './EventCard.styles';

export const EventCard = (props) => (
  <Card sx={eventCardStyles.container}>
    <Box sx={eventCardStyles.header}>
      {/* Now centralized, reusable, theme-aware */}
    </Box>
  </Card>
)
```

---

## Tools to Prevent CSS Bloat

### 1. ESLint Rules (Add to config)
```javascript
// .eslintrc.js
rules: {
  '@typescript-eslint/no-hardcoded-strings': 'warn', // For colors
  'no-magic-numbers': ['warn', { ignore: [0, 1, -1] }],
}
```

### 2. Code Review Checklist
- [ ] All colors from theme.palette?
- [ ] All spacing from theme.spacing()?
- [ ] All breakpoints from theme.breakpoints?
- [ ] No CSS files created?
- [ ] No style duplication in 2+ components?
- [ ] All sx props type-safe (SxProps)?

### 3. Component Audit
Run quarterly:
```bash
# Find hardcoded colors
grep -r "#[0-9A-F]\{6\}" src/components/ | grep -v node_modules

# Find magic numbers in sx props
grep -r "padding:\|margin:\|fontSize:" src/components/ | grep "'[0-9]"
```

---

## Migration Path (Phased)

### Phase 1: Foundation (Current)
- ✅ MUI theme exists and works
- ✅ Theme overrides for common components exist
- Create styleUtils.ts and variants.ts

### Phase 2: Core Components
- Refactor existing Cards (Event, Actor, Group)
- Extract common patterns to styleUtils
- Create .styles.ts files for complex components

### Phase 3: Audit & Cleanup
- Remove any remaining inline styles
- Consolidate duplicate sx props
- Ensure mobile styles only in theme

### Phase 4: Documentation
- Update CONTRIBUTING.md with styling guide
- Add examples to each component
- Create styling cookbook for team

---

## Key Principles

1. **Single Source of Truth** - All styling in @liexp/ui/src/theme/
2. **Theme-First** - Start with theme tokens, never hardcode
3. **Composition Over Duplication** - Extract patterns, don't repeat
4. **Mobile-First in Theme** - Handle responsive in theme, not components
5. **Type-Safe Styling** - Use SxProps<Theme> for all sx props
6. **No CSS Files** - Use MUI theme and sx, never .css files
7. **Consistent Patterns** - Same component = same styling approach
8. **Zero Magic Numbers** - Every value from theme

---

Generated: 2026-02-22
Based on current @liexp/ui architecture analysis
