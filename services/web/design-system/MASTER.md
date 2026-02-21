# lies.exposed Web - Service Design System

**Applies to**: Public-facing fact-checking platform at lies.exposed

**Hierarchy**: Page-specific > This document > `packages/@liexp/ui/DESIGN_SYSTEM.md`

---

## Overview

The lies.exposed web service is a **content-first, editorial platform** for public fact-checking and information analysis. The design system prioritizes:

1. **Trust & Transparency** - Clear information hierarchy, honest data representation
2. **Discoverability** - Search-first navigation, content surfacing
3. **Accessibility** - WCAG 2.1 AA compliance for diverse audiences
4. **Performance** - Fast load times, efficient information consumption
5. **Editorial Excellence** - Readable typography, visual storytelling

---

## Service Identity

### Purpose
Provide verifiable fact-checking information to the general public with an emphasis on transparency and educational value.

### Key Characteristics
- **Public-facing**: No authentication required for viewing content
- **Information-dense**: Users search for specific facts, events, entities
- **Editorial tone**: Trustworthy, journalistic, objective
- **Research-oriented**: Deep content pages with citations and sources

### Target Audience
- General public seeking fact-checking information
- Researchers and journalists
- Educational institutions
- Media outlets

---

## Design Differences from Master System

### 1. Spacing & Layout

**Master System**: 4px base unit (4, 8, 12, 16, 24, 32, 40, 48px...)

**Web Override**: Use standard spacing but apply more breathing room

| Context | Spacing | Rationale |
|---------|---------|-----------|
| Content margins | 48px+ (web), 32px (mobile) | Editorial breathing room |
| Section gaps | 64px (web), 48px (mobile) | Clear visual separation |
| Component padding | Standard (16-24px) | Consistency |
| List item spacing | 24px vertical | Readable content lists |
| Typography line height | 1.6-1.8 | Optimal reading line length |

**Implementation**:
```typescript
// In page-specific layouts
const contentPadding = useResponsive({
  xs: 16, // mobile
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64
});
```

### 2. Typography System

**Master System**: Signika (headers), Lora (body)

**Web Override**: Emphasize readability for long-form content

| Element | Font | Size | Weight | Use Case |
|---------|------|------|--------|----------|
| H1 (Page Title) | Signika | 48px | 600 | Event titles, main headlines |
| H2 (Section) | Signika | 32px | 600 | Content sections |
| H3 (Subsection) | Signika | 24px | 600 | Subsection headers |
| Body (Content) | Lora | 18px | 400 | Article text, descriptions |
| Body (Compact) | Lora | 16px | 400 | Meta text, dates, sources |
| Caption | Lora | 14px | 400 | Captions, footnotes |
| Label (Buttons) | Signika | 14px | 600 | Button text, labels |

**Guidelines**:
- Maximum line length: 75-85 characters (650-750px width)
- Minimum contrast ratio: 7:1 for body text
- Links styled with underline on hover (not color alone)
- Bold used sparingly for emphasis

### 3. Color Usage

**Master Palette** (use as-is):
- Primary: #FF7976 (coral, actions)
- Secondary: #4DD3CF (teal, status/links)
- Background: #121212 (dark)
- Surface: #1e1e1e (cards, sections)

**Web-Specific Semantic Colors**:

| Color | Hex | Use Case | Rationale |
|-------|-----|----------|-----------|
| Success | #4CAF50 | Verified facts, correct claims | Green = trust in fact-checking |
| Warning | #FF9800 | Disputed/partially true claims | Caution without alarm |
| Error | #FF5252 | False/misinformation | High contrast warning |
| Info | #4DD3CF | Context, source links | Secondary brand color |
| Neutral | #9E9E9E | Disabled state, secondary text | Accessible contrast |

**Link Styling**:
```typescript
// Links must be underlined (not color-only for accessibility)
const linkStyles = {
  color: theme.palette.secondary.main,
  textDecoration: 'underline',
  '&:hover': {
    textDecoration: 'underline',
    opacity: 0.8,
  },
  '&:visited': {
    color: theme.palette.secondary.light, // Lighter for visited
  },
};
```

### 4. Component Sizing

**Master System**: Touch targets 44x44px minimum

**Web Override**: Use full sizing for better information density while maintaining accessibility

| Component | Desktop Size | Mobile Size | Rationale |
|-----------|--------------|-------------|-----------|
| Buttons (Primary) | 44-48px height | 44px height | Accessibility standard |
| Buttons (Secondary) | 40px height | 40px height | Compact for toolbars |
| Input Fields | 48px height | 56px height | Mobile touch target |
| Card Width | 100%-500px | 100% | Column layout |
| List Item Height | Auto (min 48px) | Auto (min 56px) | Content-driven |

### 5. Navigation & Information Architecture

**Master System**: Default navigation patterns

**Web Override**: Search-first, content discovery focus

#### Primary Navigation
- **Logo** (left) - Home link
- **Search** (center) - Full-width search bar with suggestions
- **Secondary Links** (right) - About, Methodology, Contact

#### Secondary Navigation
- Event timeline/categories
- Entity filters (actors, groups, locations)
- Time range filters
- Source credibility indicators

#### Footer
- Links to resources
- Social media
- Privacy policy
- Contact information

### 6. Information Hierarchy

**Master Pattern**: Standard visual hierarchy

**Web Enhancement**: Emphasis on source credibility and fact verification

```
Page Title (H1)
  ↓
Event Card / Content Block
  ├── Main Claim (18px, Lora)
  ├── Source Attribution (14px, with icon)
  ├── Verification Status (badge: Verified/Disputed/Unverified)
  ├── Involved Entities (pills/tags)
  ├── Timeline Indicator
  └── Detailed Content (H3 sections)
```

### 7. Form Design

**Master System**: Standard form components

**Web Enhancement**: Clear validation feedback and inline help

```typescript
const formStyles = {
  // Input fields
  input: {
    borderRadius: 8, // Softer corners for editorial
    fontSize: '16px', // Prevent zoom on iOS
    '&:focus': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
  
  // Error states
  error: {
    color: theme.palette.error.main,
    fontSize: '14px',
    marginTop: 4,
  },
  
  // Help text
  helperText: {
    color: theme.palette.text.secondary,
    fontSize: '14px',
    marginTop: 8,
  },
};
```

### 8. Card & Content Layouts

**Master System**: Standard card elevation

**Web Enhancement**: Emphasis on content readability

```typescript
const cardStyles = {
  // Event cards
  container: {
    borderRadius: 12,
    backgroundColor: theme.palette.surface,
    padding: 24,
    boxShadow: theme.shadows[2], // Subtle elevation
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    transition: 'all 200ms ease-in-out',
    
    '&:hover': {
      boxShadow: theme.shadows[4], // Slight lift on hover
      borderColor: alpha(theme.palette.primary.main, 0.3),
    },
  },
};
```

### 9. Loading & Empty States

**Master System**: Standard indicators

**Web Enhancement**: Editorial messaging for empty states

| State | Display | Message |
|-------|---------|---------|
| Loading | Skeleton cards | "Loading fact-checks..." |
| Empty | Icon + text | "No events found matching your search" |
| Error | Error icon + text | "Unable to load content. Please try again." |
| No results | Search icon + text | "Refine your search criteria and try again" |

### 10. Mobile Responsiveness

**Master Breakpoints**: xs (0), sm (600px), md (900px), lg (1200px), xl (1536px)

**Web Optimization**:

| Breakpoint | Layout | Navigation | Typography |
|-----------|--------|-----------|-----------|
| xs (0-599px) | Single column | Mobile menu | 18px base |
| sm (600-899px) | Single column | Mobile menu | 18px base |
| md (900-1199px) | 1-2 columns | Desktop nav | 18px base |
| lg (1200-1535px) | 2-3 columns | Desktop nav | 18px base |
| xl (1536px+) | 3-4 columns | Desktop nav | 18px base |

**Mobile-First Rules**:
1. Stack elements vertically on mobile
2. Increase touch targets to 48-56px
3. Reduce horizontal padding to 16px
4. Simplify navigation to hamburger menu
5. Use full-width modals instead of dialogs
6. Remove hover effects (they don't work on touch)

### 11. Accessibility Standards

**Master**: WCAG 2.1 AA

**Web Enhancement**: Additional considerations

| Requirement | Standard | Web Additional | Example |
|-------------|----------|-----------------|---------|
| Color Contrast | 4.5:1 (text) | 7:1 (body text) | Better readability |
| Link Identification | Color + underline | Always underline | No color-only links |
| Focus Indicators | Visible focus | High contrast outline | 3px blue outline |
| Keyboard Navigation | Tab order | Tab through search first | Logical flow |
| Screen Reader | Semantic HTML | Skip links, landmarks | "Skip to content" |
| Images | Alt text | Descriptive alt text | "Barack Obama at UN summit, 2023" |
| Forms | Labels for inputs | Error messages linked to input | aria-describedby |
| Motion | prefers-reduced-motion | Disable animations | No autoplay transitions |

**Testing**: Run accessibility audit for every page:
```bash
npm run test:a11y
```

### 12. Dark Mode Implementation

**Master**: Dark mode default with light mode support

**Web**: Maintain dark mode for reading comfort, provide light mode option

```typescript
// In theme context, persist user preference
const [isDark, setIsDark] = useLocalStorage('theme-preference', true);

// Provide toggle in settings/header
const toggleTheme = () => setIsDark(!isDark);
```

**Dark Mode Colors** (reference):
- Background: #121212
- Surface: #1e1e1e
- Text: #FFFFFF
- Text Secondary: #B0B0B0
- Primary: #FF7976
- Secondary: #4DD3CF

---

## Page-Specific Overrides

Create page-specific design rules in `services/web/design-system/pages/`:

1. **events.md** - Event detail/list pages
   - Event card layouts
   - Timeline visualization
   - Source attribution styling
   - Related events display

2. **explore.md** - Content discovery/search
   - Filter UI
   - Search results layout
   - Faceted search styling
   - Tag/entity pills

3. **homepage.md** - Landing page
   - Hero section
   - Featured events
   - CTA buttons
   - Content preview cards

4. **entity-detail.md** - Actor/Group profiles
   - Profile header
   - Bio section
   - Timeline of involvement
   - Related events

---

## Component Usage Guide

### Approved Components for Web

| Category | Component | Usage | Variant |
|----------|-----------|-------|---------|
| **Buttons** | Primary Button | Main actions | Primary |
| | Secondary Button | Alternative actions | Secondary |
| | Text Button | Links within content | Text |
| | Icon Button | Toolbar actions | Icon only |
| **Cards** | Event Card | Content containers | Elevated |
| | Entity Card | Actor/group display | Compact |
| | Link Card | Source references | Minimal |
| **Forms** | Text Input | Search, filters | Full width |
| | Select Dropdown | Category filters | Native HTML |
| | Checkbox | Multiple selection | Standard |
| | Radio Button | Single selection | Standard |
| **Navigation** | AppBar | Top navigation | Fixed |
| | Breadcrumb | Page hierarchy | Text + icon |
| | Pagination | Result navigation | Numbers + nav |
| **Feedback** | Snackbar | Notifications | Toast |
| | Alert | Validation errors | Inline |
| | Badge | Status indicators | Circular |
| **Data Display** | Table | Structured data | Sortable |
| | List | Simple data | Vertical |
| | Chip | Tags/categories | Outlined |
| **Modals** | Dialog | Confirmations | Full overlay |
| | Drawer | Side navigation | Slide from left |
| **Typography** | Heading | Section titles | H1-H6 |
| | Body Text | Content | Paragraph |
| | Caption | Meta information | Small |

### Anti-Patterns (Avoid on Web)

- ❌ Auto-playing videos or animations
- ❌ Infinite scroll without pagination fallback
- ❌ Floating action buttons (use fixed buttons instead)
- ❌ Hover-only interactions (won't work on mobile)
- ❌ Flashing content (seizure trigger)
- ❌ Color-only status indicators (must include text or icon)
- ❌ Disabled buttons without explanation
- ❌ Empty carousels or sliders
- ❌ Unlabeled form inputs

---

## Design Review Checklist (Web Service)

Before committing component changes or adding new pages:

### Visual Design
- [ ] Dark mode appearance is correct and readable
- [ ] Spacing follows the 4px grid
- [ ] Typography hierarchy is clear (H1 > H2 > body)
- [ ] Color contrast meets 7:1 for body text
- [ ] Links are underlined (not color-only)
- [ ] Hover states are visible and intuitive

### Information Architecture
- [ ] Page title (H1) is clear
- [ ] Content is scannable with proper headings
- [ ] Forms have clear labels and error messages
- [ ] Related content is grouped together
- [ ] Source attribution is visible
- [ ] Verification status is clear

### Accessibility
- [ ] Page has proper heading hierarchy (no skipped levels)
- [ ] All inputs have associated labels (not placeholder-only)
- [ ] Focus indicators are visible (3px outline)
- [ ] Tab order is logical
- [ ] Images have descriptive alt text
- [ ] Error messages are linked to inputs (aria-describedby)
- [ ] Links clearly indicate external URLs or new windows
- [ ] Keyboard navigation works throughout page

### Mobile Responsiveness
- [ ] Layout works on 320px width (iPhone SE)
- [ ] Touch targets are at least 44x44px
- [ ] Horizontal scroll is not required
- [ ] Form inputs don't zoom on focus (16px+)
- [ ] Navigation is accessible on mobile
- [ ] Text is readable without zooming

### Performance
- [ ] Images are optimized and responsive
- [ ] No unnecessary CSS or JavaScript
- [ ] Page loads in under 3 seconds
- [ ] Lazy loading used for below-the-fold content

### Code Quality
- [ ] Component has proper TypeScript types
- [ ] JSDoc comments document props and usage
- [ ] No console errors or warnings
- [ ] Follows naming conventions (see NAMING_CONVENTIONS.md)
- [ ] Storybook story exists (if new component)

---

## Resources

### Documentation
- Master Design System: `packages/@liexp/ui/DESIGN_SYSTEM.md`
- Component Inventory: `packages/@liexp/ui/COMPONENT_INVENTORY.md`
- Naming Conventions: `packages/@liexp/ui/NAMING_CONVENTIONS.md`
- Component Status: `packages/@liexp/ui/COMPONENT_STATUS.md`

### Tools & Libraries
- **Typography**: [Signika font](https://fonts.google.com/specimen/Signika), [Lora font](https://fonts.google.com/specimen/Lora)
- **Icons**: [Material Icons](https://fonts.google.com/icons)
- **Component Library**: Material-UI (MUI)
- **Accessibility Testing**: [axe DevTools](https://www.deque.com/axe/devtools/), [WAVE](https://wave.webaim.org/)
- **Color Contrast**: [Contrast Ratio Calculator](https://webaim.org/resources/contrastchecker/)

### Reference Links
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [MUI Documentation](https://mui.com/material-ui/getting-started/)
- [Typography Best Practices](https://www.nngroup.com/articles/typography-web/)
- [Mobile Usability](https://www.nngroup.com/articles/mobile-usability/)

---

**Last Updated**: February 2026
**Version**: 1.0
**Maintained by**: Design System Team
