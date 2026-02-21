# lies.exposed Design System - MASTER

## Brand Identity

### Product Positioning

**lies.exposed** is a transparent, investigative fact-checking and information analysis platform that empowers researchers, journalists, and citizens to uncover and verify truth through collaborative data analysis.

**Admin Backoffice** (admin.lies.exposed) is an efficient, powerful internal content management system for fact-checkers and administrators to manage data, review content, and coordinate investigations.

### Core Values

1. **Clarity over decoration**: Information is paramount; design should clarify, not obscure
2. **Trust & Transparency**: Honest visual hierarchy, no dark patterns, all sources visible
3. **Accessibility first**: WCAG 2.1 AA compliance as minimum standard
4. **Dark by default**: Designed for researchers spending long sessions analyzing data
5. **Performance**: Fast interactions, no bloat, optimized for low-bandwidth regions
6. **Consistency**: Unified experience across services and platforms

### Target Audiences

| Audience | Public App | Admin App | Design Implications |
|----------|-----------|-----------|---------------------|
| **Researchers** | Primary users | N/A | Need powerful search, filtering, exporting |
| **Journalists** | Primary users | Secondary | Need narrative tools, timeline views, attribution |
| **Fact-checkers** | Secondary | Primary | Need verification workflows, batch operations |
| **Investigators** | Primary | Secondary | Need data relationships, network views |
| **Citizens** | Primary | N/A | Need accessibility, clear explanations |
| **Administrators** | N/A | Primary | Need data-dense interfaces, keyboard shortcuts |

---

## Design System Architecture

```
lies.exposed Design System
├── Master System (this file)
│   └── Applies to both services
├── Service-Specific Overrides
│   ├── Public App: services/web/design-system/MASTER.md
│   └── Admin App: services/admin/design-system/MASTER.md
└── Page-Specific Overrides
    ├── services/web/design-system/pages/*.md
    └── services/admin/design-system/pages/*.md
```

**Hierarchy**: Page-specific > Service-specific > Master

When building a component or page:
1. Check `service/design-system/pages/{page-name}.md` first
2. If exists, apply those rules and override Master rules
3. If not exists, check `service/design-system/MASTER.md`
4. For anything not defined there, use Master rules

---

## Color System

### Semantic Color Palette

#### Light Mode (Reference/Alternative)

| Role | Color | Hex | Use Case |
|------|-------|-----|----------|
| **Background** | Light Gray | `#fafafa` | Default page background |
| **Surface** | White | `#ffffff` | Cards, containers, surfaces |
| **Primary** | Coral Red | `#FF5E5B` | Call-to-action, emphasis |
| **Secondary** | Teal | `#17B9B6` | Secondary actions, accents |
| **Text Primary** | Black | `rgba(0,0,0,0.87)` | Body text, primary content |
| **Text Secondary** | Medium Gray | `rgba(0,0,0,0.6)` | Secondary text, metadata |
| **Border** | Light Border | `#E5E7EB` | Dividers, outlines |

#### Dark Mode (Default) 🌙

| Role | Color | Hex | Use Case |
|------|-------|-----|----------|
| **Background** | Near Black | `#121212` | Default page background |
| **Surface** | Dark Gray | `#1e1e1e` | Cards, containers, surfaces |
| **Primary** | Bright Coral | `#FF7976` | Call-to-action, emphasis |
| **Secondary** | Bright Teal | `#4DD3CF` | Secondary actions, accents |
| **Text Primary** | White | `#ffffff` | Body text, primary content |
| **Text Secondary** | Light Gray | `rgba(255,255,255,0.6)` | Secondary text, metadata |
| **Border** | Dark Border | `#2d2d2d` | Dividers, outlines |

### Status Colors (Dark Mode - Default)

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| **Success** | Green | `#10B981` | Verified, complete, success states |
| **Warning** | Amber | `#F59E0B` | Pending, caution, attention needed |
| **Error** | Red | `#EF4444` | Error, failed, destructive actions |
| **Info** | Blue | `#3B82F6` | Information, helpful hints |
| **Muted** | Gray | `#6B7280` | Disabled, archived, inactive |

### Usage Guidelines

```tsx
// ✅ DO: Use MUI theme palette
const Component = () => {
  const theme = useTheme();
  return (
    <Box sx={{ backgroundColor: theme.palette.primary.main }}>
      Primary action button
    </Box>
  );
};

// ✅ DO: Use theme.palette colors in sx prop
<Box sx={{ color: (theme) => theme.palette.text.primary }} />

// ❌ DON'T: Hardcode hex colors
<Box sx={{ color: "#FF5E5B" }} />  // Never do this

// ❌ DON'T: Use text as only indicator
<Box sx={{ color: theme.palette.error.main }}>Error</Box>  // Add icon too

// ✅ DO: Combine color with other indicators
<Box display="flex" alignItems="center" gap={1}>
  <Icons.CheckCircle color="success" />
  <Typography color="success.main">Verified</Typography>
</Box>
```

### Color Accessibility

**Minimum Contrast Ratios**:
- Normal text: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1

**Verify with**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Browser DevTools accessibility inspector
- Automated tools: axe, WAVE

---

## Typography System

### Font Stack

```css
/* Display & Headers */
font-family: "Signika", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Body & Prose */
font-family: "Lora", Georgia, serif;
```

### Font Loading

```html
<link
  href="https://fonts.googleapis.com/css2?family=Signika:wght@400;600;700&family=Lora:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

### Type Scale

| Role | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|------------|-----------------|-------|
| `h1` | 2.5rem (40px) | 700 | 1.2 (48px) | -0.02em | Page titles, hero sections |
| `h2` | 2rem (32px) | 700 | 1.3 (41.6px) | -0.01em | Section headers, modal titles |
| `h3` | 1.5rem (24px) | 600 | 1.4 (33.6px) | 0 | Subsection headers |
| `h4` | 1.25rem (20px) | 600 | 1.4 (28px) | 0 | Component headers, cards |
| `h5` | 1rem (16px) | 600 | 1.5 (24px) | 0 | Smaller headers, labels |
| `h6` | 0.875rem (14px) | 600 | 1.5 (21px) | 0 | Small section headers |
| `body1` | 1rem (16px) | 400 | 1.6 (25.6px) | 0 | Body text, main content |
| `body2` | 0.875rem (14px) | 400 | 1.5 (21px) | 0 | Secondary text, descriptions |
| `caption` | 0.75rem (12px) | 400 | 1.4 (16.8px) | 0.04em | Labels, captions, small text |
| `overline` | 0.75rem (12px) | 600 | 1.5 (18px) | 0.08em | Category labels, badges |

### MUI Integration

```tsx
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "'Signika', sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.6,
      fontFamily: "'Lora', serif",
    },
  },
});
```

### Typography Usage

```tsx
// ✅ Use MUI Typography component
<Typography variant="h1">Page Title</Typography>
<Typography variant="body1">Body text content</Typography>

// ✅ Use correct semantic element
<Typography component="p" variant="body1">Paragraph</Typography>

// ❌ Don't use Typography for styles only
<Typography style={{ fontSize: "20px", fontWeight: 600 }}>
  Custom styled text
</Typography>

// ❌ Don't hardcode font families
<div style={{ fontFamily: "Signika" }}>Text</div>
```

---

## Spacing System

### Base Unit: 4px

Tailwind-inspired spacing scale where each unit = 4px.

| Scale | Pixels | Rem | CSS Class | Usage |
|-------|--------|-----|-----------|-------|
| `1` | 4px | 0.25rem | `p-1` | Minimal spacing (rare) |
| `2` | 8px | 0.5rem | `p-2` | Small padding, tight gaps |
| `3` | 12px | 0.75rem | `p-3` | Compact spacing |
| `4` | 16px | 1rem | `p-4` | Default padding/gap |
| `6` | 24px | 1.5rem | `p-6` | Large spacing |
| `8` | 32px | 2rem | `p-8` | Extra large spacing |
| `12` | 48px | 3rem | `p-12` | Page-level spacing |
| `16` | 64px | 4rem | `p-16` | Major section spacing |

### MUI Theme Integration

```tsx
const theme = createTheme({
  spacing: (factor: number) => `${0.25 * factor}rem`, // 4px base
});

// Usage:
<Box sx={{ padding: theme.spacing(4) }} /> // 16px
<Stack spacing={2} /> // 8px gaps
<Box sx={{ margin: `${theme.spacing(4)} ${theme.spacing(2)}` }} />
```

### Spacing Rules

```tsx
// ✅ DO: Use theme.spacing()
<Box sx={{ p: 4, mb: 6 }} />

// ✅ DO: Use shorthand in sx prop
<Box sx={{ p: 2, m: 0 }} />

// ❌ DON'T: Use absolute pixel values
<Box sx={{ padding: "16px" }} />

// ❌ DON'T: Mix spacing units
<Box sx={{ paddingTop: 4, paddingBottom: "20px" }} />
```

---

## Elevation & Shadows

### Shadow Levels

Shadows create visual hierarchy and depth. MUI uses elevation levels 0-24.

| Elevation | Use Case | Shadow | When |
|-----------|----------|--------|------|
| **0** | Flat elements | None | Background, disabled states |
| **1** | Cards at rest | `0 1px 3px rgba(0,0,0,0.12)` | Default cards |
| **2** | Cards hover | `0 4px 8px rgba(0,0,0,0.15)` | Hovered cards |
| **3** | Dropdowns | `0 10px 24px rgba(0,0,0,0.18)` | Menus, popovers |
| **4** | Modals | `0 15px 35px rgba(0,0,0,0.2)` | Dialogs, bottom sheets |
| **8** | Floating action | `0 20px 50px rgba(0,0,0,0.25)` | Floating buttons |
| **16** | Sticky header | `0 25px 60px rgba(0,0,0,0.3)` | App bar, sticky elements |

### Usage

```tsx
// ✅ Use elevation prop
<Card elevation={1} /> // Default card
<Paper elevation={8} /> // Modal backdrop

// ✅ Use Box with shadow
<Box sx={{ boxShadow: 1 }} /> // Elevation 1

// ❌ DON'T: Create custom shadows
<Box sx={{ boxShadow: "0 2px 10px rgba(0,0,0,0.5)" }} />
```

### Dark Mode Shadows

Shadows are slightly different in dark mode to maintain clarity:

```tsx
// MUI automatically adjusts shadows for dark mode
// No manual adjustment needed
<Card elevation={1} /> // Works in both themes
```

---

## Border Radius System

### Scale

| Scale | Pixels | Rem | Usage |
|-------|--------|-----|-------|
| `sm` | 4px | 0.25rem | Small buttons, tags, chips |
| `md` | 8px | 0.5rem | Cards, inputs, default radius |
| `lg` | 12px | 0.75rem | Large containers, modals |
| `xl` | 16px | 1rem | Extra large components |
| `full` | 9999px | - | Pills, circles, avatars |

### MUI Configuration

```tsx
const theme = createTheme({
  shape: {
    borderRadius: 8, // Default 8px
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4, // Small buttons
        },
      },
    },
  },
});
```

### Usage

```tsx
// ✅ Use borderRadius prop
<Box sx={{ borderRadius: 1 }} /> // 4px (MUI unit)
<Box sx={{ borderRadius: "8px" }} /> // 8px explicit

// ❌ DON'T: Use pixel values with theme
<Box sx={{ borderRadius: "12px" }} />
```

---

## Responsive Breakpoints

### Mobile-First Approach

Design for mobile first, then enhance for larger screens.

| Name | Width | Device | Usage |
|------|-------|--------|-------|
| `xs` | 0px | Mobile | Default/baseline |
| `sm` | 600px | Tablet portrait | Larger phones, small tablets |
| `md` | 960px | Tablet landscape | Standard tablets |
| `lg` | 1280px | Desktop | Desktop computers |
| `xl` | 1920px | Wide desktop | Large monitors |

### Layout Patterns

```tsx
// ✅ Mobile-first breakpoints
<Box sx={{
  display: "flex",
  flexDirection: "column", // Mobile
  
  "@media (min-width: 600px)": {
    flexDirection: "row", // Tablet+
  },
  
  "@media (min-width: 960px)": {
    gap: 6, // Desktop spacing
  },
}} />

// ✅ Use breakpoint helpers
const { breakpoints } = useTheme();

<Box sx={{
  padding: 2,
  [breakpoints.up("sm")]: {
    padding: 4,
  },
  [breakpoints.up("md")]: {
    padding: 6,
  },
}} />
```

### Content Width

```tsx
// ✅ Standard max-widths
<Container maxWidth="sm" /> // 600px
<Container maxWidth="md" /> // 960px
<Container maxWidth="lg" /> // 1280px
<Container maxWidth="xl" /> // 1920px
```

---

## Animation & Transitions

### Duration Standards

```tsx
// Micro interactions (hover, ripple)
duration: 150, // ms

// Standard transitions (open/close)
duration: 300, // ms

// Slow animations (rare, page transitions)
duration: 500, // ms
```

### Easing Curves

```tsx
// Entrance (easeOut) - start slow, end fast
easing: theme.transitions.easing.easeOut

// Standard (easeInOut) - smooth acceleration and deceleration
easing: theme.transitions.easing.easeInOut

// Exit (easeIn) - start fast, end slow
easing: theme.transitions.easing.easeIn
```

### Accessibility

Always respect `prefers-reduced-motion`:

```tsx
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

<Box sx={{
  transition: prefersReducedMotion ? "none" : "all 300ms ease-in-out",
}} />
```

### Common Transitions

```tsx
// Button hover
<Button sx={{
  transition: (theme) => theme.transitions.create(["backgroundColor"], {
    duration: theme.transitions.duration.short,
  }),
}} />

// Opacity change
<Box sx={{
  opacity: isHovered ? 1 : 0.7,
  transition: "opacity 200ms ease-in-out",
}} />
```

---

## Component Patterns

### Button Variants

| Variant | Usage | Light | Dark |
|---------|-------|-------|------|
| **Contained** | Primary action | Primary color | Primary color |
| **Outlined** | Secondary action | Border + text | Border + text |
| **Text** | Tertiary action | Text only | Text only |

### Card Layouts

```tsx
// Flat card (default)
<Card sx={{ elevation: 0 }} />

// Raised card (highlighted)
<Card sx={{ elevation: 1 }} />

// Elevated card (interactive)
<Card sx={{ elevation: 3 }} />
```

### Form Patterns

```tsx
// Text field
<TextField
  label="Input label"
  placeholder="Placeholder text"
  helperText="Helper text or error message"
  error={!!errors.field}
/>

// Select field
<FormControl>
  <InputLabel>Choose option</InputLabel>
  <Select value={value} onChange={handleChange}>
    <MenuItem value="option1">Option 1</MenuItem>
  </Select>
</FormControl>

// Checkbox
<FormControlLabel
  control={<Checkbox checked={checked} onChange={handleChange} />}
  label="Checkbox label"
/>
```

### Modal Pattern

```tsx
<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Modal Title</DialogTitle>
  <DialogContent>
    Content goes here
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm} variant="contained">
      Confirm
    </Button>
  </DialogActions>
</Dialog>
```

### Icon Usage

**Icon Set**: Heroicons (primary) + Lucide (fallback)

```tsx
// ✅ Use SVG icons from consistent library
<Icons.CheckCircle />

// ❌ NEVER use emojis as UI icons
<span>✅</span> // Don't do this

// ✅ Icon + text combination
<Button startIcon={<Icons.Download />}>
  Download
</Button>

// ✅ Sized icons
<Icons.Check sx={{ fontSize: 24 }} />

// Common sizes:
// - sm: 16px
// - md: 24px
// - lg: 32px
```

---

## Accessibility (WCAG 2.1 AA)

### Semantic HTML

```tsx
// ✅ Use semantic elements
<button onClick={handleClick}>Click me</button>
<header><h1>Page Title</h1></header>
<nav><ul><li><a href="/">Home</a></li></ul></nav>
<main><article>Content</article></main>
<footer>Footer</footer>

// ❌ Avoid non-semantic divs for interaction
<div onClick={handleClick}>Click me</div>
<div role="button">Click me</div>
```

### Heading Hierarchy

```tsx
// ✅ Proper hierarchy
<h1>Page Title</h1>
<h2>Section 1</h2>
<h3>Subsection 1.1</h3>
<h2>Section 2</h2>

// ❌ Skip levels
<h1>Title</h1>
<h3>Skip h2</h3>
```

### Form Accessibility

```tsx
// ✅ Labels connected to inputs
<label htmlFor="email">Email:</label>
<input id="email" type="email" />

// ✅ Help text for complex fields
<TextField
  label="Password"
  helperText="Min 8 chars, 1 uppercase, 1 number"
  error={!isValidPassword}
/>

// ❌ Missing labels
<input type="email" placeholder="Email" />
```

### ARIA Labels

```tsx
// ✅ Icon buttons need labels
<IconButton aria-label="Close">
  <Icons.Close />
</IconButton>

// ✅ Modal accessibility
<Dialog
  open={open}
  aria-labelledby="dialog-title"
  aria-modal="true"
>
  <DialogTitle id="dialog-title">Modal Title</DialogTitle>
</Dialog>

// ✅ Loading state
<Box aria-busy="true" aria-label="Loading data">
  {isLoading && <CircularProgress />}
</Box>
```

### Keyboard Navigation

All interactive elements must be keyboard accessible:

```tsx
// ✅ Native buttons work out of the box
<button>Click me</button>

// ✅ TabIndex for custom interactive elements (rare)
<div
  role="button"
  tabIndex={0}
  onKeyPress={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  }}
>
  Custom button
</div>
```

### Color Contrast

- **Body text**: 4.5:1 minimum contrast
- **Large text** (18pt+): 3:1 minimum
- **UI components**: 3:1 minimum

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify.

### Testing

```bash
# Accessibility audit
npx axe devtools

# Lighthouse audit
# In Chrome DevTools > Lighthouse > Accessibility

# React testing with jest-axe
import { axe, toHaveNoViolations } from "jest-axe";
expect(await axe(container)).toHaveNoViolations();
```

---

## Touch Targets & Mobile UX

### Minimum Sizes

```
Primary touch target: 44x44px
Spacing between targets: 8px minimum
```

### Mobile Optimization

```tsx
// ✅ Mobile-friendly button
<Button
  fullWidth
  sx={{
    "@media (max-width: 600px)": {
      height: "48px",
      fontSize: "1rem",
    },
  }}
>
  Mobile-friendly button
</Button>

// ✅ Responsive container
<Container
  maxWidth="sm"
  sx={{
    px: 2, // Mobile padding
    "@media (min-width: 600px)": {
      px: 4,
    },
  }}
>
  Content
</Container>
```

---

## Dark Mode Implementation

### Current Default: Dark Mode 🌙

Dark mode is the default theme. Light mode is available as an alternative.

### Automatic Theme Switching

```tsx
const { resolvedMode } = useThemeMode();

// resolvedMode: "light" | "dark"
// Automatically handles system preference + user override
```

### Ensuring Dark Mode Support

When adding new components:

1. **Test in both modes**: Toggle theme switcher
2. **Use theme colors**: Never hardcode colors
3. **Verify contrast**: Use WebAIM checker
4. **Check transparency**: Ensure glass cards are visible
5. **Border visibility**: Use theme.palette.divider

```tsx
// ✅ Works in both themes
<Box sx={{
  backgroundColor: (theme) => theme.palette.background.paper,
  color: (theme) => theme.palette.text.primary,
}} />

// ❌ Doesn't support dark mode
<Box sx={{
  backgroundColor: "#ffffff",
  color: "#000000",
}} />
```

---

## Performance Guidelines

### Image Optimization

```tsx
// ✅ Use next/image for optimization
import Image from "next/image";

<Image
  src="/photo.jpg"
  alt="Description"
  width={400}
  height={300}
  priority // For above-fold images
/>

// ❌ Unoptimized img tags
<img src="/photo.jpg" />
```

### Component Performance

```tsx
// ✅ Memoize expensive components
import { memo } from "react";

const ExpensiveComponent = memo(({ data }) => {
  return <div>{data}</div>;
});

// ✅ Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler
}, []);

// ❌ Don't create functions in render
const onClick = () => handleClick(); // BAD
```

### Bundle Size

- Keep components focused and small
- Use tree-shaking (ES6 modules)
- Lazy load heavy components
- Monitor bundle size with `source-map-explorer`

---

## Component Status Tracking

Track all 384 components for:

| Aspect | Status | Notes |
|--------|--------|-------|
| Dark Mode | ✅ / 🔄 / ❌ | Works in both themes |
| Accessibility | ✅ / 🔄 / ❌ | WCAG 2.1 AA compliant |
| Responsive | ✅ / 🔄 / ❌ | Works at 375px, 768px, 1024px |
| TypeScript | ✅ / 🔄 / ❌ | Full type safety |
| Storybook | ✅ / 🔄 / ❌ | Has stories + tests |
| JSDoc | ✅ / 🔄 / ❌ | Documented props |

### Update Schedule

- Monthly review of component status
- Quarterly accessibility audit (automated + manual)
- Add component status badge to Storybook stories

---

## Common Pitfalls & Anti-Patterns

### ❌ DO NOT

1. **Use emojis as UI icons**
   ```tsx
   // WRONG
   <div>✅ Success</div>
   
   // RIGHT
   <Box display="flex" gap={1}>
     <Icons.CheckCircle color="success" />
     <span>Success</span>
   </Box>
   ```

2. **Hardcode colors**
   ```tsx
   // WRONG
   <Box sx={{ color: "#FF5E5B" }} />
   
   // RIGHT
   <Box sx={{ color: (theme) => theme.palette.primary.main }} />
   ```

3. **Skip focus states**
   ```tsx
   // WRONG
   <button>Click me</button>
   
   // RIGHT
   <button style={{ outline: "2px solid blue" }}>
     Click me
   </button>
   ```

4. **Use scale transforms on hover** (causes layout shift)
   ```tsx
   // WRONG
   sx={{ '&:hover': { transform: 'scale(1.05)' } }}
   
   // RIGHT
   sx={{ '&:hover': { boxShadow: 3 } }}
   ```

5. **Ignore dark mode**
   ```tsx
   // WRONG
   <Box sx={{ backgroundColor: "white", color: "black" }} />
   
   // RIGHT
   <Box sx={{
     backgroundColor: (theme) => theme.palette.background.paper,
     color: (theme) => theme.palette.text.primary,
   }} />
   ```

6. **Mix spacing units**
   ```tsx
   // WRONG
   sx={{ p: 4, m: "20px", gap: "10px" }}
   
   // RIGHT
   sx={{ p: 4, m: 5, gap: 2.5 }}
   ```

7. **Create custom button styles**
   ```tsx
   // WRONG
   <Box
     component="button"
     sx={{ background: "blue", padding: "10px 20px" }}
   >
     Click
   </Box>
   
   // RIGHT
   <Button variant="contained">Click</Button>
   ```

8. **Skip loading states**
   ```tsx
   // WRONG
   <button disabled={isLoading}>Submit</button>
   
   // RIGHT
   <Button
     disabled={isLoading}
     endIcon={isLoading ? <CircularProgress size={20} /> : null}
   >
     {isLoading ? "Submitting..." : "Submit"}
   </Button>
   ```

9. **Ignore accessibility**
   ```tsx
   // WRONG
   <div onClick={onClick}>Click me</div>
   
   // RIGHT
   <button onClick={onClick}>Click me</button>
   ```

10. **Use relative positioning without layout context**
    ```tsx
    // WRONG
    <Box position="relative" left="20px">
      Confusing position
    </Box>
    
    // RIGHT
    <Box sx={{ ml: 5 }}>
      Clear spacing
    </Box>
    ```

### ✅ DO

1. ✅ Use SVG icons from consistent library
2. ✅ Reference theme colors and values
3. ✅ Provide visible focus states
4. ✅ Use opacity/color changes for hover effects
5. ✅ Support both light and dark modes
6. ✅ Use theme spacing units consistently
7. ✅ Extend MUI theme for customizations
8. ✅ Provide loading and error states
9. ✅ Test accessibility with real tools
10. ✅ Document all component variations

---

## Design Review Checklist

Before committing UI changes, verify:

### Visual ✨
- [ ] Responsive at 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide)
- [ ] Light and dark mode look correct
- [ ] No emojis used as icons
- [ ] Icons from consistent set (Heroicons/Lucide)
- [ ] No layout shift on hover
- [ ] Text has proper contrast (4.5:1)
- [ ] Touch targets at least 44x44px

### Interaction 🖱️
- [ ] Cursor pointer on all clickable elements
- [ ] Hover states provide visual feedback
- [ ] Focus states visible (outline or background)
- [ ] Loading states shown during async operations
- [ ] Error states clear and actionable
- [ ] Transitions smooth (not jarring)
- [ ] Animations respect `prefers-reduced-motion`

### Accessibility ♿
- [ ] Uses semantic HTML
- [ ] Form inputs have labels
- [ ] Images have alt text
- [ ] ARIA labels on icon buttons
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Color not only indicator
- [ ] Tested with axe or WAVE

### Code Quality 💻
- [ ] Uses theme colors (not hardcoded)
- [ ] Uses theme spacing (not pixels)
- [ ] TypeScript types defined
- [ ] Props interface documented
- [ ] JSDoc comments present
- [ ] displayName set for debugging
- [ ] No console errors/warnings
- [ ] No prop drilling (< 3 levels)

### Performance ⚡
- [ ] Images optimized and lazy-loaded
- [ ] Components memoized if necessary
- [ ] Event handlers use useCallback
- [ ] No inline function definitions
- [ ] No unnecessary re-renders
- [ ] Bundle size impact minimal

---

## Resources & References

### Design
- [MUI Documentation](https://mui.com/)
- [Design Tokens](https://tokens.studio/)
- [Dark Mode Best Practices](https://www.smashingmagazine.com/2021/11/guide-dark-mode/)

### Icons
- [Heroicons](https://heroicons.com/)
- [Lucide Icons](https://lucide.dev/)

### Fonts
- [Signika on Google Fonts](https://fonts.google.com/specimen/Signika)
- [Lora on Google Fonts](https://fonts.google.com/specimen/Lora)

### Accessibility
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### Tools
- [Storybook](https://storybook.js.org/)
- [Chromatic](https://www.chromatic.com/) (visual testing)
- [Percy](https://percy.io/) (visual regression)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-21 | Andrea Ascari | Initial design system document |

---

## Questions & Next Steps

1. Create service-specific overrides: `services/web/design-system/MASTER.md`
2. Create admin overrides: `services/admin/design-system/MASTER.md`
3. Document page-specific rules in `pages/*.md` folders
4. Audit existing components and create status tracker
5. Enhance Storybook stories with design tokens
6. Establish design review workflow and automation

