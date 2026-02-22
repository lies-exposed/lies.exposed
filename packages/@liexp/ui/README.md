# @liexp/ui

Shared UI components, theme, and styling utilities for the lies.exposed platform.

## Overview

This package provides:
- **Theme System**: Centralized MUI theme configuration with mobile-first design principles
- **Reusable Components**: Pre-built React components with consistent styling
- **Style Utilities**: Functions and objects to prevent CSS duplication and maintain consistency
- **Design System**: Color palette, typography, spacing, and interactive patterns

## Theme & Styling

### Using the Theme

The theme is automatically available through MUI's `useTheme()` hook:

```typescript
import { useTheme } from '@liexp/ui';

export const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{
      color: theme.palette.primary.main,
      padding: theme.spacing(2),
    }}>
      Themed content
    </Box>
  );
};
```

### Style Utilities

Import reusable style patterns from `@liexp/ui` to prevent CSS bloat:

```typescript
import { 
  flexCenter, 
  ellipsisText, 
  cardVariants,
  buttonVariants 
} from '@liexp/ui';

export const MyCard = () => (
  <Card sx={cardVariants.elevated}>
    <Box sx={flexCenter}>
      <Typography sx={ellipsisText}>
        Centered text with ellipsis
      </Typography>
    </Box>
  </Card>
);
```

### Available Utility Categories

#### Flexbox Utilities
- `flexCenter` - Center content both horizontally and vertically
- `flexBetween` - Space-between layout
- `flexStart` - Flex layout aligned to top-left
- `flexColumn` - Vertical flex layout
- `flexColumnCenter` - Vertical centered layout

#### Text Utilities
- `ellipsisText` - Single line with ellipsis overflow
- `truncateLines(n)` - Truncate to n lines with ellipsis
- `mutedText` - Secondary text styling
- `captionText` - Small caption text

#### Card Variants
- `cardVariants.base` - Minimal card styling
- `cardVariants.elevated` - Prominent card with shadow and hover effect
- `cardVariants.outlined` - Card with colored border
- `cardVariants.filled` - Card with background color

#### Text Variants
- `textVariants.heading` - Large bold text (h1-h3 style)
- `textVariants.subheading` - Medium semi-bold text
- `textVariants.body` - Regular paragraph text
- `textVariants.secondary` - Muted secondary text
- `textVariants.caption` - Small caption text
- `textVariants.label` - Small bold label text

#### Button Variants
- `buttonVariants.primary` - Main call-to-action button
- `buttonVariants.secondary` - Alternative action button
- `buttonVariants.outlined` - Tertiary outlined button
- `buttonVariants.ghost` - Minimal text button
- `buttonVariants.icon` - Icon-only button (44x44px minimum)

#### Input Variants
- `inputVariants.standard` - Standard outlined input
- `inputVariants.filled` - Filled background input

#### Layout Variants
- `layoutVariants.responsiveGrid` - Responsive grid (1 col mobile → 4 col desktop)
- `layoutVariants.cardContainer` - Standard card container
- `layoutVariants.section` - Full-width section with max-width constraint
- `layoutVariants.flexSpacer` - Space-between flex layout

#### Badge Variants
- `badgeVariants.primary` - Primary status badge
- `badgeVariants.secondary` - Secondary status badge
- `badgeVariants.outlined` - Outlined status badge

#### Avatar Variants
- `avatarVariants.xs` - 32px avatar
- `avatarVariants.sm` - 40px avatar
- `avatarVariants.md` - 48px avatar
- `avatarVariants.lg` - 56px avatar
- `avatarVariants.xl` - 64px avatar

#### Advanced Utilities
- `baseCard()` - Combine with other utilities
- `elevatedCard()` - Card with elevation and hover
- `outlinedCard()` - Outlined card style
- `aspectVideo` - 16:9 aspect ratio
- `aspectSquare` - 1:1 aspect ratio
- `touchFriendlyButton` - 44x44px minimum touch target
- `focusStyle` - Keyboard focus state styling
- `hoverScale` - Scale up on hover
- `hoverShadow` - Shadow increase on hover
- `hideScrollbar` - Hide scrollbar while keeping scroll
- `customScrollbar` - Styled custom scrollbar
- `fullWidth`, `fullHeight`, `fullScreen` - 100% sizing
- `containerMax` - Max-width container
- `responsiveImage` - Responsive image container
- `gridAutoFit` - Auto-fitting grid
- `gridAutoFill` - Auto-filling grid

## Best Practices

### Mobile-First Design

All styling must follow mobile-first principles:

1. **Mobile defaults** - Define styles for 375px width first
2. **Progressive enhancement** - Add tablet (768px) and desktop (1024px+) styles as overrides
3. **Touch targets** - Ensure interactive elements are minimum 44x44px on mobile

```typescript
// ✅ Good: Mobile-first with responsive overrides
const sx = {
  padding: 1,
  fontSize: '0.875rem',
  minHeight: '44px', // Mobile touch target
  sm: {
    padding: 2,
    minHeight: '40px', // Can be smaller on tablet+
  }
};

// ❌ Avoid: Desktop-first or hardcoded sizes
const sx = {
  padding: 3,
  fontSize: '1rem',
  minHeight: '40px', // Too small on mobile!
};
```

### Preventing CSS Bloat

Always extract repeated styles into utility functions:

```typescript
// ❌ Bad: Duplicated sx props across components
<Card sx={{ borderRadius: 1, boxShadow: 2, transition: 'all 0.2s' }} />
<Box sx={{ borderRadius: 1, boxShadow: 2, transition: 'all 0.2s' }} />
<Paper sx={{ borderRadius: 1, boxShadow: 2, transition: 'all 0.2s' }} />

// ✅ Good: Use variants once
import { cardVariants } from '@liexp/ui';

<Card sx={cardVariants.elevated} />
<Box sx={cardVariants.elevated} />
<Paper sx={cardVariants.elevated} />
```

### Theme Colors & Spacing

Never hardcode values - always use the theme:

```typescript
// ❌ Bad: Hardcoded colors and numbers
const sx = {
  color: '#FF5E5B',
  padding: '16px',
  margin: '8px 0',
};

// ✅ Good: Use theme values
const sx = (theme) => ({
  color: theme.palette.primary.main,
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
});
```

## Color Palette

The theme includes a carefully chosen color system:

- **Primary**: #FF5E5B (Coral red) - Main brand color
- **Primary Light**: Lighter variant for hover/disabled states
- **Primary Dark**: Darker variant for focus/active states
- **Secondary**: #17B9B6 (Teal) - Accent color
- **Background**: #fafafa (light mode) / #121212 (dark mode)
- **Text Primary**: rgba(0,0,0,0.87) (light) / #fff (dark)
- **Text Secondary**: rgba(0,0,0,0.6) (light) / rgba(255,255,255,0.7) (dark)

## Typography

- **Primary Font**: Signika (body text, general UI)
- **Secondary Font**: Lora (headings, emphasis)

Heading sizes are responsive and scale based on breakpoint:
- **h1-h5**: Responsive scaling from 1.25rem (mobile) to 1.75rem+ (desktop)
- **h6**: 1rem on all screen sizes
- **Body1**: Secondary font, 400 weight
- **Body2**: Primary font, 300 weight, 1rem

## Accessibility

All styles follow WCAG 2.1 Level AA standards:

- **Color Contrast**: Minimum 4.5:1 for text
- **Touch Targets**: Minimum 44x44px on mobile
- **Focus States**: Visible focus styles on all interactive elements
- **Spacing**: Minimum 8px (theme.spacing(1)) between interactive elements
- **Keyboard Navigation**: All interactive elements are keyboard accessible

## Components

See individual component documentation in `src/components/`.

## Responsive Breakpoints

The theme uses Material-UI's default breakpoints:

- **xs**: 0px (mobile)
- **sm**: 600px (tablet)
- **md**: 960px (small desktop)
- **lg**: 1280px (desktop)
- **xl**: 1920px (large desktop)

## Contributing

When adding new components or styles:

1. **Check for existing patterns** - Reuse utilities from `styleUtils.ts`
2. **Use theme values** - No hardcoded colors, spacing, or fonts
3. **Mobile-first design** - Design for 375px first, enhance for larger screens
4. **Type safety** - Use `SxProps<Theme>` for all style objects
5. **Documentation** - Add JSDoc comments and examples
6. **Testing** - Test at multiple breakpoints (375px, 768px, 1024px, 1440px)

## Resources

- [Material-UI Documentation](https://mui.com/docs/)
- [Theme Customization Guide](https://mui.com/material-ui/customization/theming/)
- [Responsive Design in MUI](https://mui.com/material-ui/customization/breakpoints/)
