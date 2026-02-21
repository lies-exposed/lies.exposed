# Web Service Page Design: Events Pages

**Parent Document**: `services/web/design-system/MASTER.md`  
**Applies to**: Event listing, event detail, event timeline pages

---

## Overview

Event pages are the core of lies.exposed. They showcase fact-checking information with emphasis on:
- **Clarity** - Facts presented without ambiguity
- **Credibility** - Sources and verification status visible
- **Exploration** - Related content easily discoverable
- **Shareability** - Content formatted for social sharing

---

## Page Layout Structure

### Event Detail Page (`/events/:id`)

**Grid Structure (Desktop)**:
```
┌─────────────────────────────────────────────────┐
│  HEADER (Navigation + Search)                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────────────┬───────────────────┐ │
│  │                         │                   │ │
│  │  EVENT DETAIL (70%)    │  SIDEBAR (30%)    │ │
│  │                         │  - Related Events │ │
│  │  - Main claim           │  - Involved       │ │
│  │  - Source attribution   │    Entities       │ │
│  │  - Verification status  │  - Timeline       │ │
│  │  - Entity pills          │  - Share buttons  │ │
│  │  - Timeline              │                   │ │
│  │  - Full content          │                   │ │
│  │                         │                   │ │
│  └─────────────────────────┴───────────────────┘ │
│                                                  │
├─────────────────────────────────────────────────┤
│  FOOTER                                         │
└─────────────────────────────────────────────────┘
```

**Mobile (Stacked)**:
```
┌──────────────────────────┐
│  HEADER                  │
├──────────────────────────┤
│  EVENT DETAIL            │
│  - Main claim            │
│  - Source                │
│  - Verification status   │
│  - Entities              │
│  - Timeline              │
│  - Full content          │
├──────────────────────────┤
│  RELATED EVENTS          │
│  (Vertical list)         │
├──────────────────────────┤
│  INVOLVED ENTITIES       │
│  (Grid or list)          │
├──────────────────────────┤
│  FOOTER                  │
└──────────────────────────┘
```

### Event List/Timeline Page (`/events`)

**Desktop Layout**:
```
┌─────────────────────────────────────────────────┐
│  HEADER + SEARCH                                │
├─────────────────────────────────────────────────┤
│  FILTERS (Sidebar)  │  EVENT TIMELINE/GRID      │
│  - Date range       │  - Card 1                 │
│  - Status           │  - Card 2                 │
│  - Entities         │  - Card 3                 │
│  - Sources          │  - ...                    │
│                     │                           │
│                     │  PAGINATION               │
└─────────────────────────────────────────────────┘
```

---

## Component Specifications

### Event Detail View

#### 1. Event Header Section

```
┌────────────────────────────────────────────┐
│ BREADCRUMB: Events > 2024 > March > Event  │
├────────────────────────────────────────────┤
│ H1 Title: "Barack Obama visits UN Summit"  │
│                                             │
│ VERIFICATION BADGE: [✓ VERIFIED]           │
│ Timestamp: March 15, 2024 • 2 hours ago    │
│ Source: Wikipedia                          │
├────────────────────────────────────────────┤
│ Description: "On March 15, 2024, former..."│
│                                             │
│ SHARE BUTTONS: [Facebook] [Twitter] [Link] │
└────────────────────────────────────────────┘
```

**Component Patterns**:
- Title (H1): 48px Signika, bold
- Breadcrumb: Navigable, shows path
- Verification Badge: Color-coded (green=verified, orange=disputed, gray=unverified)
- Timestamp: Secondary text color, 14px
- Source attribution: With icon/link
- Description: 18px Lora, 1.6 line height
- Share buttons: Horizontal row, icon + label

**Spacing**:
- Content padding: 48px (desktop), 24px (mobile)
- Section gap: 32px
- Typography gap: 16px

#### 2. Entity Pills Section

```
┌────────────────────────────────────────────┐
│ INVOLVED ACTORS:                           │
│ [🔗 Barack Obama] [🔗 Joseph Biden]        │
│ [🔗 António Guterres]                       │
│                                             │
│ INVOLVED GROUPS:                           │
│ [🔗 United Nations] [🔗 US Government]     │
│                                             │
│ LOCATIONS:                                 │
│ [📍 New York] [📍 United States]            │
└────────────────────────────────────────────┘
```

**Component Pattern: EntityChip**
- Size: 32-40px height
- Padding: 8-12px horizontal, 4-8px vertical
- Icon: Prefix (🔗 for entity, 📍 for location)
- Text: 14px, bold
- Color: Secondary color (#4DD3CF) with slight opacity background
- Hover: Lift shadow, increase opacity
- Click: Navigate to entity detail

#### 3. Timeline Section

```
┌────────────────────────────────────────────┐
│ TIMELINE                                   │
│                                             │
│ 2024-03-15 ← Current event (highlighted)  │
│             Barack Obama visits UN        │
│                                             │
│ 2024-03-10 ← Earlier event                │
│             UN Secretary report           │
│                                             │
│ 2024-02-28 ← Earlier event                │
│             Government statement          │
└────────────────────────────────────────────┘
```

**Component Pattern: EventTimeline**
- Vertical line down center
- Events alternating left/right (desktop) or all left (mobile)
- Current event: Larger, different color
- Past/future events: Smaller, dimmed
- Hover: Show tooltip with full event title
- Click: Navigate to event detail

#### 4. Related Content Section

```
┌────────────────────────────────────────────┐
│ RELATED EVENTS (3 cards)                   │
│                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ Event 1  │ │ Event 2  │ │ Event 3  │    │
│ │ Title    │ │ Title    │ │ Title    │    │
│ │ Date     │ │ Date     │ │ Date     │    │
│ │ Status   │ │ Status   │ │ Status   │    │
│ └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│ [View more →]                              │
└────────────────────────────────────────────┘
```

**Component Pattern: RelatedEventCards**
- 3 cards per row (desktop), 1 per row (mobile)
- Each card: EventCard variant (compact)
- Grid gap: 24px
- "View more" link: Right-aligned, secondary color

### Event List/Grid Page

#### 1. Filter Sidebar (Desktop)

```
┌──────────────────────┐
│ FILTERS              │
├──────────────────────┤
│ Date Range:          │
│ [From] __ - [To] __ │
│                      │
│ Status:              │
│ ☐ Verified           │
│ ☐ Disputed           │
│ ☐ Unverified         │
│                      │
│ Involved Entities:   │
│ [Search box]         │
│ • Barack Obama       │
│ • Joseph Biden       │
│ • UN Secretary       │
│                      │
│ [Clear all] [Apply]  │
└──────────────────────┘
```

**Component Pattern: SearchFiltersBox**
- Width: 250px (fixed, desktop)
- Position: Left sidebar, sticky on scroll
- Sections: Date, Status, Entities
- Buttons: Clear all (outline), Apply (primary)
- Mobile: Collapsed into hamburger menu

#### 2. Event Grid

**Desktop (3 columns)**:
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ EventCard│ │ EventCard│ │ EventCard│
├──────────┤ ├──────────┤ ├──────────┤
│ EventCard│ │ EventCard│ │ EventCard│
└──────────┘ └──────────┘ └──────────┘
```

**Tablet (2 columns)**:
```
┌──────────┐ ┌──────────┐
│ EventCard│ │ EventCard│
├──────────┤ ├──────────┤
│ EventCard│ │ EventCard│
└──────────┘ └──────────┘
```

**Mobile (1 column)**:
```
┌──────────┐
│ EventCard│
├──────────┤
│ EventCard│
└──────────┘
```

**Grid Properties**:
- Gap: 24px
- Card height: Auto (min 280px)
- Card padding: 24px
- Responsive: 3 cols (lg) → 2 cols (md) → 1 col (sm/xs)

---

## Visual Specifications

### Colors & Status Badges

| Status | Color | Icon | Background |
|--------|-------|------|------------|
| Verified | #66BB6A | ✓ | rgba(102, 187, 106, 0.1) |
| Disputed | #FFA726 | ⚠ | rgba(255, 167, 38, 0.1) |
| Unverified | #757575 | ⊘ | rgba(117, 117, 117, 0.1) |

**Badge Styling**:
```css
border-radius: 4px;
padding: 4px 12px;
font-size: 12px;
font-weight: 600;
display: inline-block;
```

### Typography Scale (Event Detail)

| Element | Font | Size | Weight | Line Height | Usage |
|---------|------|------|--------|-------------|-------|
| H1 (Title) | Signika | 48px | 600 | 1.2 | Event name |
| H2 (Section) | Signika | 32px | 600 | 1.2 | Section headers |
| Body (Main) | Lora | 18px | 400 | 1.6 | Event description |
| Body (Meta) | Lora | 14px | 400 | 1.5 | Dates, sources |
| Label | Signika | 14px | 600 | 1.4 | Category labels |
| Caption | Lora | 12px | 400 | 1.4 | Timestamps, footnotes |

### Spacing

```
Content padding (web):
- Desktop: 48px (sides), 48px (top/bottom)
- Tablet: 32px (sides), 32px (top/bottom)
- Mobile: 16px (sides), 24px (top/bottom)

Section gaps:
- Between major sections: 64px
- Between subsections: 32px
- Between items in list: 24px

Component padding:
- EventCard: 24px
- EntityChip: 8px horizontal, 4px vertical
- Badge: 4px horizontal, 2px vertical
```

---

## Interactive Behaviors

### Hover States

```
EventCard:
- Box shadow: elevation-2 → elevation-4
- Border: transparent → alpha(primary, 0.3)
- Opacity: 1 → 0.95
- Transition: 200ms ease-in-out

EntityChip:
- Background: alpha → alpha * 1.2
- Shadow: none → elevation-2
- Cursor: pointer
- Text color: no change

Link:
- Text-decoration: none → underline
- Color: no change
- Opacity: 1 → 0.8
```

### Click/Active States

```
EventCard (selected):
- Border: 3px solid primary
- Background: alpha(primary, 0.08)

EntityChip (selected):
- Border: 2px solid primary
- Font-weight: 700
```

### Loading States

```
Page load:
- Show skeleton of EventCard (5 cards)
- Skeleton height: 320px
- Gradient animation left to right
- Duration: 1.5s

List load:
- Show skeleton rows (placeholder)
- 5 skeleton rows
- Staggered animation (50ms delay between)
```

### Empty States

```
No events found:
- Icon: Large (64x64px) search icon
- Message: "No events found matching your search"
- Sub-message: "Try adjusting your filters or search terms"
- CTA: "Clear filters" or "View all events"

Error loading:
- Icon: Error icon (64x64px)
- Message: "Unable to load events"
- Sub-message: "Please try again or contact support"
- CTA: "Retry" button
```

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation

- **Tab order**: Header search → Filters → Event cards → Pagination → Footer
- **Filter section**: Tab through date inputs → Status checkboxes → Entity search → Buttons
- **Event card**: Tab through title (link) → Entity pills (links) → "View more" (link)
- **Escape key**: Close filter panel (mobile), close modals

### ARIA Labels

```
<!-- Event card -->
<article role="region" aria-label="Event: Barack Obama visits UN Summit">
  <!-- Links should indicate they're external or internal -->
  <a href="..." aria-label="View full event details">...</a>
</article>

<!-- Status badge -->
<span role="status" aria-label="Verified">✓ Verified</span>

<!-- Entity pill -->
<a href="..." aria-label="View actor: Barack Obama">Barack Obama</a>

<!-- Filter section -->
<aside aria-label="Event filters" role="complementary">
```

### Color Contrast

- Body text: 7:1 (exceeds 4.5:1 minimum)
- Link text: 7:1
- Status badge text: 7:1
- Placeholder text: 4.5:1 minimum

### Focus Indicators

```
:focus-visible {
  outline: 3px solid #FF7976;
  outline-offset: 2px;
}
```

### Testing Checklist

- [ ] Tab key navigates through all interactive elements
- [ ] Escape key closes modals/filters
- [ ] Screen reader announces status badges
- [ ] Color contrast checked with axe DevTools
- [ ] No keyboard traps
- [ ] Focus order is logical
- [ ] Image alt text present and descriptive

---

## Mobile Optimization

### Touch Targets
- Entity pills: 40x40px minimum
- Card clickable area: Full card (48px minimum height)
- Filter buttons: 44x44px

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | 320-599px | 1 column, stacked |
| Tablet | 600-899px | 2 columns, sidebar collapsed |
| Desktop | 900px+ | 3 columns, sidebar expanded |

### Mobile Navigation
- Search bar: Full width below header
- Filter button: "Filters (n)" chip with badge count
- Sort options: Inline dropdown (Date, Relevance, etc.)
- Results: Full-width cards, stacked

### Mobile Filters Panel
- Full-screen overlay on click
- Sticky header with "Done" button
- Scrollable filter options
- "Clear all" and "Apply" at bottom
- No keyboard needed (touch-focused)

---

## Performance Guidelines

### Image Optimization
- Event thumbnails: 600x400px maximum (compressed)
- Lazy load: Off-screen images
- WebP format: Primary, JPEG fallback
- Alt text: Descriptive (e.g., "Screenshot from UN meeting")

### Code Splitting
- Event detail page: Separate bundle
- Timeline visualization: Lazy load on scroll
- Related events: Load on demand

### Caching Strategy
- Event data: Cache for 1 hour
- Entity data: Cache for 24 hours
- Images: Cache for 30 days

---

## Common Patterns

### "Skip to Content" Link
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

### Breadcrumb Pattern
```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/events">Events</a></li>
    <li><a href="/events?year=2024">2024</a></li>
    <li><a href="/events?year=2024&month=3">March</a></li>
    <li aria-current="page">Event Title</li>
  </ol>
</nav>
```

### Entity Pill with Icon
```html
<a href="/actors/1" class="entity-pill">
  <span class="icon">🔗</span>
  <span class="label">Barack Obama</span>
</a>
```

---

## Design Review Checklist (Events Pages)

### Visual Design
- [ ] Event title is prominent (H1, 48px)
- [ ] Verification status badge is clearly visible
- [ ] Source attribution is visible
- [ ] Related content is easily discoverable
- [ ] Dark mode appearance is correct
- [ ] Spacing follows grid (multiples of 8px)
- [ ] Typography hierarchy is clear

### Information Architecture
- [ ] Breadcrumb shows page hierarchy
- [ ] Entities are clearly marked (icons + labels)
- [ ] Timeline shows event relationships
- [ ] Filters are organized logically
- [ ] Search is prominent
- [ ] Related events are relevant

### Accessibility
- [ ] Heading hierarchy is correct (no skipped levels)
- [ ] Focus indicators visible (3px outline)
- [ ] Color contrast is 7:1 minimum
- [ ] Links are underlined or clearly distinguished
- [ ] Status badges use text + color (not color-only)
- [ ] Entity pills are keyboard-accessible
- [ ] ARIA labels describe function

### Mobile
- [ ] Layout works at 320px width
- [ ] Touch targets are 44px+ minimum
- [ ] No horizontal scroll
- [ ] Form inputs are 16px+ (no zoom on iOS)
- [ ] Filter panel is full-screen overlay (mobile)

---

## References & Examples

### Similar Sites
- Wikipedia: Editorial style, clear typography
- Snopes.com: Fact-checking badges, related content
- FactCheck.org: Source citations, date ranges
- ProPublica: Data visualization, timeline patterns

### Component References
- `EventCard` from COMPONENT_INVENTORY.md
- `EntityChip` (use ActorChip/AreaChip pattern)
- `Timeline` (custom or from libraries)
- `SearchFiltersBox` from COMPONENT_INVENTORY.md
- `BreadCrumb` from COMPONENT_INVENTORY.md

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained by**: Design System Team
