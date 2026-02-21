# lies.exposed Design System Implementation Plan

## Executive Summary

lies.exposed has a solid technical foundation with 384 components and centralized MUI theme management, but lacks formal design system documentation and governance. This plan creates a production-ready design system with clear guidelines for both the public fact-checking platform and internal admin backoffice.

---

## Phase 1: Foundation & Documentation (Weeks 1-2)

### 1.1 Create Master Design System Document

**File**: `packages/@liexp/ui/DESIGN_SYSTEM.md`

```markdown
# lies.exposed Design System - Master

## Brand Identity

### Product Positioning
- **Public App**: Transparent, investigative, trustworthy fact-checking platform
- **Admin App**: Efficient, powerful content management system
- **Target Users**: Fact-checkers, researchers, journalists, investigators

### Design Principles
1. **Clarity over decoration**: Information-first design
2. **Trust & Transparency**: Honest visual hierarchy, no dark patterns
3. **Accessibility first**: WCAG 2.1 AA minimum standard
4. **Dark by default**: Reduced eye strain for researchers
5. **Performance**: Fast interactions, no bloat
6. **Consistency**: Unified experience across services

## Color System

### Semantic Colors

#### Light Mode (Primary)
- **Background**: #fafafa (Light Gray)
- **Surface**: #ffffff (White)
- **Primary**: #FF5E5B (Coral Red)
- **Secondary**: #17B9B6 (Teal)
- **Text Primary**: rgba(0,0,0,0.87) (Black)
- **Text Secondary**: rgba(0,0,0,0.6) (Medium Gray)
- **Border**: #E5E7EB (Light Border)

#### Dark Mode (Default)
- **Background**: #121212 (Near Black)
- **Surface**: #1e1e1e (Dark Gray)
- **Primary**: #FF7976 (Bright Coral)
- **Secondary**: #4DD3CF (Bright Teal)
- **Text Primary**: #ffffff (White)
- **Text Secondary**: rgba(255,255,255,0.6)
- **Border**: #2d2d2d (Dark Border)

#### Status Colors
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Info**: #3B82F6 (Blue)

### Implementation
```tsx
// Use MUI theme palette directly
theme.palette.primary.main
theme.palette.background.default
theme.palette.text.primary
```

## Typography System

### Font Families
- **Primary (Display/Headers)**: Signika (Google Fonts)
- **Secondary (Body/Prose)**: Lora (Google Fonts)

### Type Scale

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|------------|-------|
| `h1` | 2.5rem | 700 | 1.2 | Page titles |
| `h2` | 2rem | 700 | 1.3 | Section headers |
| `h3` | 1.5rem | 600 | 1.4 | Subsection headers |
| `h4` | 1.25rem | 600 | 1.4 | Component headers |
| `body1` | 1rem | 400 | 1.6 | Body text |
| `body2` | 0.875rem | 400 | 1.5 | Secondary text |
| `caption` | 0.75rem | 400 | 1.4 | Small labels |

### Font Loading
```tsx
@import url('https://fonts.googleapis.com/css2?family=Signika:wght@400;600;700&family=Lora:wght@400;500;600&display=swap');
```

## Spacing System

### Base Unit: 4px (0.25rem)

| Scale | Pixels | CSS Class | Usage |
|-------|--------|-----------|-------|
| `xs` | 4px | `p-1` | Tight spacing (internal padding) |
| `sm` | 8px | `p-2` | Small padding/gap |
| `md` | 16px | `p-4` | Default padding/gap |
| `lg` | 24px | `p-6` | Large spacing (sections) |
| `xl` | 32px | `p-8` | Extra large spacing |
| `2xl` | 48px | `p-12` | Page-level spacing |

### MUI Integration
```tsx
theme.spacing(1)  // 4px
theme.spacing(2)  // 8px
theme.spacing(4)  // 16px
theme.spacing(6)  // 24px
```

## Elevation & Shadows

### Shadow Levels (Z-Index)

| Level | Use Case | CSS |
|-------|----------|-----|
| `0` | Flat elements | No shadow |
| `1` | Cards at rest | `0 1px 3px rgba(0,0,0,0.12)` |
| `2` | Cards hover | `0 4px 8px rgba(0,0,0,0.15)` |
| `3` | Modals, dropdowns | `0 10px 24px rgba(0,0,0,0.18)` |
| `4` | Overlays, popovers | `0 15px 35px rgba(0,0,0,0.2)` |

### MUI Implementation
```tsx
elevation={1}  // Card
elevation={2}  // Card hover
elevation={8}  // Modal
elevation={16} // Drawer
```

## Border Radius System

| Scale | Pixels | Usage |
|-------|--------|-------|
| `sm` | 4px | Small buttons, tags |
| `md` | 8px | Default for cards, inputs |
| `lg` | 12px | Large containers |
| `full` | 9999px | Pills, circular elements |

## Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `xs` | 0px | Mobile (default) |
| `sm` | 600px | Tablet portrait |
| `md` | 960px | Tablet landscape |
| `lg` | 1280px | Desktop |
| `xl` | 1920px | Wide desktop |

## Animation & Transitions

### Duration Conventions

```tsx
// Micro interactions
duration: 150ms  // Hover effects, button ripple

// Normal interactions
duration: 300ms  // Modal open, drawer slide

// Slow animations
duration: 500ms  // Page transitions (rare)
```

### Easing

```tsx
// Standard (ease-in-out)
easing: theme.transitions.easing.easeInOut

// Emphasis (ease-out)
easing: theme.transitions.easing.easeOut  // Entrances

// Deemphasis (ease-in)
easing: theme.transitions.easing.easeIn   // Exits
```

### Accessibility

Always check `prefers-reduced-motion`:
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-motion: reduce)').matches;
```

## Component Guidelines

### Button Variants

| Variant | Usage | Light Mode | Dark Mode |
|---------|-------|-----------|-----------|
| `contained` | Primary action | Primary color | Primary color |
| `outlined` | Secondary action | Border + text | Border + text |
| `text` | Tertiary action | Text only | Text only |

### Card Layouts

| Type | Light BG | Dark BG | Shadow | Usage |
|------|----------|---------|--------|-------|
| Flat | #ffffff | #1e1e1e | None | Event listings |
| Raised | #fafafa | #2d2d2d | 1px | Highlighted cards |
| Elevated | #ffffff | #1e1e1e | 4-8px | Interactive cards |

### Icon Usage

- **Icon Set**: Heroicons (24x24px primary)
- **Color**: Inherit from parent text color
- **Never use emojis** as UI icons
- **Consistent sizing**: 16px, 20px, 24px (standard sizes)

### Form Components

- **Input Height**: 40px (Touch target minimum 44px)
- **Label**: Always required, visible even when empty
- **Helper Text**: Below input for validation messages
- **Error State**: Red (#EF4444) text + error icon

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

#### Color Contrast
```
- Large text (18pt+): 3:1 minimum
- Normal text: 4.5:1 minimum
- UI components: 3:1 minimum
```

#### Interactive Elements
```
- Minimum target size: 44x44px (touch)
- Focus state: Always visible (outline or background)
- Keyboard navigation: Tab, Enter, Escape supported
```

#### Semantic HTML
```
- Use proper heading hierarchy (h1 > h2 > h3)
- Form labels linked with <label> element
- Lists use <ul>, <ol>, <dl> appropriately
- Buttons use <button>, not <div> with click handlers
```

#### ARIA Labels
```
- Icon buttons: aria-label required
- Modals: role="dialog", aria-modal="true"
- Loading: aria-busy="true" during async operations
- Alerts: role="alert", aria-live="polite"
```

## Responsive Design

### Mobile-First Approach

```tsx
// Mobile (xs: 0px)
<Box sx={{ padding: 2 }}>
  
  // Tablet (sm: 600px)
  sx={{ 
    '@media (min-width: 600px)': { padding: 4 }
  }}
  
  // Desktop (md: 960px)
  sx={{ 
    '@media (min-width: 960px)': { padding: 6 }
  }}
</Box>
```

### Touch Targets
- Minimum: 44x44px
- Spacing between targets: 8px
- Buttons on mobile: Full width or 44x44px minimum

### Viewport Meta Tags
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Page-Specific Overrides

### Structure
```
design-system/
├── MASTER.md           (This file)
├── pages/
│   ├── events.md       (Events page overrides)
│   ├── admin.md        (Admin backoffice overrides)
│   └── explore.md      (Explore timeline overrides)
└── components/
    ├── event-card.md   (Component-specific guidelines)
    └── modals.md       (Modal patterns)
```

When building a page:
1. Check `design-system/pages/{page-name}.md` first
2. If exists, use those rules + override MASTER rules
3. If not exists, use MASTER rules exclusively

### Example: Admin-Specific Overrides
```markdown
# Admin Backoffice Design System

## Overrides from MASTER

### Color
- **Background**: #0f172a (Darker for admin)
- **Surface**: #1e293b (Darker workspace)
- **Accent**: #60a5fa (Softer blue for data)

### Spacing
- **Compact mode**: Use 50% spacing for lists
- **Dense tables**: 8px vertical padding

### Typography
- **Body**: Smaller (0.875rem) for data density
- **Headers**: Same scale but bold weight consistent

## Admin-Specific Components
- DataGrid configuration
- Form layouts (3-column on desktop)
- Toolbar patterns
```

## Anti-Patterns

### DO NOT
1. ❌ Use emojis as UI icons
2. ❌ Mix font families inconsistently
3. ❌ Use text color as only indicator (use icons, patterns)
4. ❌ Skip focus states on interactive elements
5. ❌ Use scale transforms on hover (causes layout shift)
6. ❌ Hardcode colors (use theme palette)
7. ❌ Ignore dark mode requirements
8. ❌ Use `cursor: pointer` without interaction feedback
9. ❌ Skip loading states
10. ❌ Create custom button styles (use variants)

### DO
1. ✅ Use SVG icons from consistent library
2. ✅ Reference theme colors
3. ✅ Test at 200% zoom
4. ✅ Verify keyboard navigation
5. ✅ Use opacity/color changes for hover
6. ✅ Document component variations
7. ✅ Test both light and dark modes
8. ✅ Provide visual feedback on all interactions
9. ✅ Show loading states for async operations
10. ✅ Extend MUI theme for customizations

## Testing Checklist

Before shipping components, verify:

- [ ] Responsive at 375px (mobile), 768px (tablet), 1024px (desktop)
- [ ] Light and dark mode look correct
- [ ] WCAG AA color contrast (use WebAIM checker)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus states visible
- [ ] Icons from consistent library
- [ ] No layout shift on hover
- [ ] Touch targets 44x44px minimum
- [ ] Load time acceptable
- [ ] No console errors/warnings

---

## Related Resources

- [MUI Theme Documentation](https://mui.com/material-ui/customization/theming/)
- [Signika Font](https://fonts.google.com/specimen/Signika)
- [Lora Font](https://fonts.google.com/specimen/Lora)
- [Heroicons](https://heroicons.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
```

Create this document in the codebase.

### 1.2 Document Current Component Inventory

**File**: `packages/@liexp/ui/COMPONENT_INVENTORY.md`

Create categorized list of all 384 components with purposes.

### 1.3 Establish Naming Conventions

**File**: `packages/@liexp/ui/NAMING_CONVENTIONS.md`

```
Pattern: {Category}{Purpose}{Variant}

Example:
- EventCard.tsx (Component: Card displaying event)
- EventCardSmall.tsx (Variant: Small version)
- EventCardHorizontal.tsx (Variant: Horizontal layout)
- EventCardLoading.tsx (Variant: Loading state)

Categories:
- Card* → Display containers
- Form* → Input components
- Modal* → Dialog components
- Layout* → Layout wrappers
- Common* → Shared components
- Admin* → Admin-only components
```

---

## Phase 2: Component Standardization (Weeks 3-4)

### 2.1 Audit Existing Components

Create script to analyze:
- Component file size (flag > 500 lines)
- Prop types (missing JSDoc)
- Accessibility attributes
- Theme usage

### 2.2 Standardize Component Template

**Template**: `packages/@liexp/ui/src/components/_TEMPLATE.tsx`

```tsx
import * as React from "react";
import { type SomeProps } from "./Some.types.js";

/**
 * Brief description of component
 *
 * @example
 * <SomeComponent label="Example" />
 */
export const SomeComponent: React.FC<SomeProps> = ({
  label,
  variant = "primary",
  disabled = false,
  ...props
}) => {
  return (
    <div role="button" aria-label={label} {...props}>
      {label}
    </div>
  );
};

SomeComponent.displayName = "SomeComponent";

export default SomeComponent;
```

### 2.3 Create Component Documentation Template

**File**: `packages/@liexp/ui/src/components/{Component}/{Component}.md`

```markdown
# ComponentName

## Purpose
What problem does this component solve?

## Usage
```tsx
<ComponentName prop="value" />
```

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|

## Accessibility
- Keyboard support: Yes/No
- ARIA labels: Yes/No
- Screen reader: Yes/No

## Variants
- Variant 1: When to use
- Variant 2: When to use

## Related Components
- Link to similar components
```

---

## Phase 3: Service-Specific Design Systems (Weeks 5-6)

### 3.1 Public App Design System

**File**: `services/web/design-system/MASTER.md`

Override MASTER with public-facing considerations:
- Trustworthy, transparent aesthetic
- Focus on content discovery
- News/editorial aesthetic
- Search-first navigation

#### Public App Specific Rules

```markdown
# lies.exposed Public Website Design System

## Overrides from @liexp/ui MASTER

### Purpose
Transparent, investigative fact-checking platform. Design should convey
trustworthiness, clarity, and investigative expertise.

### Key Differences
1. **Content-First**: Article/event content is primary, UI is secondary
2. **Search Emphasis**: Discovery through search, explore, filters
3. **Social Proof**: Show community contributions, verifications
4. **Editorial Style**: Resembles news/investigative websites

### Color Accent
- Use primary color sparingly (call-to-action only)
- Favor neutral grays for content hierarchy
- Red (#FF5E5B) for error/alert states
- Green for verified, trusted indicators

### Typography
- Emphasis on readability (body text in Lora)
- Long-form content support
- Clear visual hierarchy for headlines

### Navigation
- Hamburger menu on mobile (space-efficient)
- Top navigation on desktop (persistent discovery)
- Breadcrumb trail for page context

### Forms
- Simple, minimal design
- Clear validation messages
- Search bar prominent on header

### Social Elements
- Contributor cards with avatars
- Verification badges
- Comment/discussion threads
- Share buttons (discrete placement)

### Data Visualization
- Charts and graphs for trends
- Timeline for event progression
- Networks for actor relationships
- Maps for geographical context

## Page Overrides

### Homepage
- Hero with search input
- Featured/trending events
- Quick statistics
- Call-to-action sections

### Events Page
- Full-width timeline
- Filter sidebar
- Event detail cards
- Related events suggestions

### Explore Timeline
- Infinite scroll
- Event clusters by date
- Filter panels
- Full-screen detail view

### Actor/Group Pages
- Profile header
- Bio section
- Timeline of involvement
- Related actors/groups
- Media gallery
```

### 3.2 Admin App Design System

**File**: `services/admin/design-system/MASTER.md`

Override for admin backoffice considerations:
- Efficiency-first interface
- Data-dense layouts
- Power user features
- Workflow optimization

#### Admin App Specific Rules

```markdown
# Admin Backoffice Design System

## Overrides from @liexp/ui MASTER

### Purpose
Internal content management system for fact-checkers and administrators.
Design should maximize productivity, data visibility, and workflow efficiency.

### Key Differences
1. **Data-Dense**: Show maximum information in minimum space
2. **Workflow-Optimized**: Minimize clicks, maximize keyboard shortcuts
3. **Batch Operations**: Multi-select, bulk edit capabilities
4. **Power User Focus**: Advanced filters, saved views, custom columns

### Spacing
- **Compact**: Use spacing(2) = 8px for lists (50% of public app)
- **Grouping**: Use spacing(4) = 16px between sections
- **Sections**: Use spacing(6) = 24px between major sections

### Color
- **Workspace**: Dark background (#0f172a) for long sessions
- **Data**: Neutral text with accent colors for status
- **Interactive**: Clear blue (#60a5fa) for interactive elements
- **Status**: 
  - Green: Published, verified
  - Yellow: Pending review
  - Red: Requires action
  - Gray: Archived, inactive

### Typography
- **Headlines**: Signika, smaller scale for space
- **Data**: Lora 0.875rem for readability in tables
- **Labels**: Small caps for column headers

### Layout
- **Sidebar Navigation**: Persistent, collapsible
- **Content Area**: Full width, scrollable
- **Toolbar**: Sticky top with batch actions
- **Details Panel**: Right sidebar for edit/preview

### Components
- **DataGrid**: Sortable, filterable, resizable columns
- **Forms**: Inline editing where possible
- **Modals**: Confirmation dialogs for destructive actions
- **Bulk Actions**: Checkboxes, select all, batch operations
- **Filters**: Saved filter sets, quick filters

### Navigation
- Sidebar with collapsible sections
- Breadcrumb for page context
- Search bar for quick navigation

### Workflows
1. **Content Creation**
   - Form wizard or inline editing
   - Preview pane
   - Auto-save drafts
   - Publish confirmation

2. **Content Review**
   - List view with status indicators
   - Click to expand details
   - Inline editing
   - Batch approval actions

3. **Reporting**
   - Pre-built reports
   - Custom report builder
   - Export options (CSV, PDF)
   - Scheduled reports

## Responsive Admin
- Tablet (sm): 2-column layout (sidebar + content)
- Mobile: Sidebar collapses, content full-width
- Never hide critical functionality
```

---

## Phase 4: Implementation & Governance (Weeks 7-8)

### 4.1 Create Component Status Tracker

**File**: `packages/@liexp/ui/COMPONENT_STATUS.md`

Track each component:
```
| Component | Status | Dark Mode | A11y | Responsive | Variant Count |
|-----------|--------|-----------|------|------------|---------------|
| Button | ✅ | ✅ | ✅ | ✅ | 5 |
| Card | ✅ | ✅ | ⚠️ | ✅ | 3 |
| Modal | 🔄 | ✅ | ❌ | 🔄 | 2 |
```

Status key:
- ✅ Production ready
- 🔄 In progress
- ❌ Not implemented
- ⚠️ Needs review

### 4.2 Establish Design Review Checklist

**File**: `.github/DESIGN_REVIEW_CHECKLIST.md`

```markdown
# Design Review Checklist

For all UI changes, verify:

## Visual
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] Light and dark mode look correct
- [ ] No emojis used as icons
- [ ] Icon set consistent (Heroicons or Lucide)
- [ ] No layout shift on hover

## Interaction
- [ ] Cursor pointer on clickable elements
- [ ] Hover states provide feedback
- [ ] Focus states visible (outline or background)
- [ ] Transitions smooth (150-300ms)

## Accessibility
- [ ] WCAG AA color contrast verified
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] ARIA labels present where needed
- [ ] Form inputs have labels
- [ ] Images have alt text

## Theme
- [ ] Uses theme.palette colors (not hardcoded)
- [ ] Respects theme.spacing()
- [ ] Dark mode automatically works
- [ ] No px values in key CSS

## Code Quality
- [ ] TypeScript types defined
- [ ] No console errors
- [ ] JSDoc comments present
- [ ] Props interface documented
- [ ] displayName set for debugging

## Performance
- [ ] No unnecessary re-renders
- [ ] Memoized where appropriate
- [ ] No inline function definitions
- [ ] Image sizes optimized
```

### 4.3 Create Design System Enforcement Script

**File**: `scripts/verify-design-system.ts`

Automated checks:
- No hardcoded colors (regex match for #RRGGBB)
- Icon usage from approved libraries only
- Emoji detection in code
- Missing accessibility attributes
- Theme compliance

### 4.4 Document Design Decisions

**File**: `packages/@liexp/ui/DESIGN_DECISIONS.md`

Record ADRs (Architecture Decision Records):

```markdown
# Design Decision Records

## ADR-001: Dark Theme as Default

**Date**: 2026-02-21
**Status**: Accepted

### Context
Users spend long hours researching and fact-checking. Extended screen time 
causes eye strain.

### Decision
Implement dark theme as default with light theme as alternative.

### Consequences
- Reduced eye strain for long research sessions
- Improved battery life on OLED devices
- Better night-time usability
- Requires careful contrast testing for light theme

### Related Issues
- https://github.com/lies-exposed/lies.exposed/issues/XXX
```

---

## Phase 5: Storybook Integration (Weeks 9-10)

### 5.1 Enhance Storybook Stories

**File**: `services/storybook/src/stories/*.stories.tsx`

Create comprehensive stories for each component:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@liexp/ui";

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["contained", "outlined", "text"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "contained",
    children: "Primary Button",
  },
};

export const DarkMode: Story = {
  args: { children: "Dark Mode" },
  decorators: [
    (Story) => (
      <div style={{ background: "#1e1e1e", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
};

export const Accessibility: Story = {
  args: { children: "Accessible Button" },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
        ],
      },
    },
  },
};
```

### 5.2 Add Design Token Documentation

Document design tokens in Storybook:

```tsx
// ColorTokens.stories.mdx
import { Canvas, Meta } from "@storybook/blocks";

<Meta title="Design System/Colors" />

# Color Tokens

## Primary Colors

| Name | Light | Dark | Usage |
|------|-------|------|-------|
| Primary | #FF5E5B | #FF7976 | Main brand color |
| Secondary | #17B9B6 | #4DD3CF | Secondary actions |
```

---

## Phase 6: Quality Assurance & Launch (Weeks 11-12)

### 6.1 Comprehensive Testing

- Visual regression testing with Percy or Chromatic
- Accessibility audit (axe DevTools)
- Performance testing (Lighthouse)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile device testing

### 6.2 Documentation Website

Create dedicated design system website:
- Component showcase
- Design guidelines
- Accessibility guidelines
- Contribution instructions
- Changelog

### 6.3 Team Training

- Design system workshop for developers
- Figma integration for designers
- Component review guidelines
- Best practices documentation

### 6.4 Launch & Governance

- Soft launch (internal teams)
- Feedback collection
- Refinement based on feedback
- Official launch
- Establish maintenance cadence

---

## Implementation Roadmap

```
Timeline: 12 weeks

Week 1-2:  Phase 1 (Documentation)
           - DESIGN_SYSTEM.md
           - COMPONENT_INVENTORY.md
           - NAMING_CONVENTIONS.md

Week 3-4:  Phase 2 (Standardization)
           - Component audit
           - Template establishment
           - Standardize 50% of components

Week 5-6:  Phase 3 (Service-Specific)
           - Public app design system
           - Admin app design system
           - Create page overrides

Week 7-8:  Phase 4 (Governance)
           - Component status tracker
           - Review checklist
           - Enforcement scripts
           - Design decisions log

Week 9-10: Phase 5 (Storybook)
           - Enhanced stories
           - Design tokens documentation
           - Interactive examples

Week 11-12: Phase 6 (QA & Launch)
           - Testing and audit
           - Website creation
           - Team training
           - Official launch
```

---

## Success Metrics

### After Phase 1 (End Week 2)
- ✅ Design system documented in MASTER.md
- ✅ All 384 components inventoried
- ✅ Naming conventions established

### After Phase 2 (End Week 4)
- ✅ 100% of components follow template
- ✅ All components have TypeScript types
- ✅ 50% of components have stories

### After Phase 3 (End Week 6)
- ✅ Public app has dedicated design rules
- ✅ Admin app has dedicated design rules
- ✅ 15+ page-specific overrides documented

### After Phase 4 (End Week 8)
- ✅ All components status tracked
- ✅ Review checklist adopted by team
- ✅ 20+ design decisions documented

### After Phase 5 (End Week 10)
- ✅ 100% of components have Storybook stories
- ✅ Design tokens fully documented
- ✅ Interactive examples for all patterns

### After Phase 6 (End Week 12)
- ✅ Design system website live
- ✅ 100% WCAG AA compliance verified
- ✅ Team trained and using system
- ✅ Regular maintenance cadence established

---

## Next Immediate Steps

1. **This Week**:
   - Create `DESIGN_SYSTEM.md` in `packages/@liexp/ui/`
   - Document current color/typography/spacing systems
   - Create `COMPONENT_INVENTORY.md` with categorization

2. **Next Week**:
   - Create naming conventions document
   - Start public app design system document
   - Begin component audit script

3. **Week 3**:
   - Create admin app design system
   - Establish component templates
   - Start Storybook enhancement

---

## Resources & References

- [MUI Customization](https://mui.com/material-ui/customization/)
- [Design System Best Practices](https://www.designsystems.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Storybook Design Systems](https://storybook.js.org/docs/react/api/csf)
- [Design Tokens](https://tokens.studio/)

---

## Questions & Decisions Needed

1. **Figma Integration**: Should we maintain Figma component library in sync?
2. **Icon Library**: Stick with Heroicons + FontAwesome or consolidate?
3. **CSS-in-JS vs Tailwind**: Should we document Tailwind utilities?
4. **Component Library Publishing**: Publish @liexp/ui to npm?
5. **Version Management**: Semantic versioning for design system?

