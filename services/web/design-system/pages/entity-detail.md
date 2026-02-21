# Web Service Page Design: Entity Detail Pages

**Parent Document**: `services/web/design-system/MASTER.md`  
**Applies to**: Actor profiles (`/actors/:id`), Group profiles (`/groups/:id`), Location profiles (`/areas/:id`)

---

## Overview

Entity detail pages showcase information about actors, organizations, and locations. Design goals:
- **Profile clarity** - Immediate identification and key facts
- **Relationship discovery** - See connections and involvement
- **Event exploration** - Navigate to related events
- **Credibility** - Show sources and verification

---

## Page Layout Structure

### Desktop Layout

```
┌─────────────────────────────────────────────────┐
│ HEADER + NAVIGATION                             │
├─────────────────────────────────────────────────┤
│                                                   │
│ ┌──────────────┐  PROFILE HEADER (70%)          │
│ │              │  - Name                         │
│ │   AVATAR     │  - Title/Description          │
│ │  (200x200)   │  - Meta info                   │
│ │              │  - Social links                │
│ └──────────────┘                                 │
│                                                   │
│ TABS:                                            │
│ [Overview] [Events] [Related] [Articles]        │
│                                                   │
│ TAB CONTENT (varies by tab)                      │
│                                                   │
│ SIDEBAR (30%):                                   │
│ - Quick facts                                    │
│ - Related entities                               │
│ - External links                                 │
│                                                   │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Mobile Layout (Stacked)

```
┌──────────────────────────┐
│ HEADER                   │
├──────────────────────────┤
│ [AVATAR]                 │
│ NAME                     │
│ Title/Description        │
│ [Links]                  │
├──────────────────────────┤
│ TABS (Scrollable)        │
│ [Overview] [Events]...  │
├──────────────────────────┤
│ TAB CONTENT              │
│                          │
│ RELATED ENTITIES         │
│ [Entity 1]               │
│ [Entity 2]               │
│                          │
└──────────────────────────┘
```

---

## Section Specifications

### Profile Header

```
┌────────────────────────────────────────────────┐
│  ┌──────────────┐  H1: Barack Hussein Obama  │
│  │              │                             │
│  │   [AVATAR]   │  Former President of the   │
│  │  200x200px   │  United States             │
│  │              │                             │
│  │              │  Born: August 4, 1961      │
│  │              │  Nationality: American     │
│  │              │  Active since: 2005        │
│  └──────────────┘                             │
│                 [Edit profile]    [Share]    │
│                 (Admin only)      (Public)   │
│                                             │
│  BIOGRAPHY/DESCRIPTION (Full width):        │
│  "Barack Hussein Obama II is an American   │
│   politician who served as the 44th        │
│   President of the United States from      │
│   2009 to 2017. [+ read more]"            │
│                                             │
│  TAGS: [Politics] [Government] [USA]       │
│                                             │
└────────────────────────────────────────────────┘
```

**Properties**:
- Avatar: 200x200px (desktop), 120x120px (mobile)
- Border radius: 12px
- H1: 48px Signika, bold
- Title: 18px Lora, secondary color
- Meta info: 14px Lora, secondary color
- Bio: 18px Lora, 1.6 line height
- Padding: 48px (desktop), 24px (mobile)

### Tab Navigation

```
┌────────────────────────────────────────────────┐
│ [Overview] [Events] [Related Entities] [Media] │
│  ↑ (Active)                                    │
│  ─────────────────                             │
└────────────────────────────────────────────────┘
```

**Properties**:
- Sticky position on scroll (stays at top)
- Background: Surface color
- Tab spacing: 32px horizontal
- Underline: 3px primary color (active tab)
- Font: 16px Signika, bold
- Hover: Opacity 0.8
- Mobile: Horizontally scrollable, snap alignment

### Overview Tab Content

```
┌─────────────────────────┬──────────────────┐
│ MAIN CONTENT (70%)      │ SIDEBAR (30%)    │
│                         │                  │
│ BIOGRAPHY SECTION:      │ QUICK FACTS:     │
│ "Barack Hussein Obama..." │ Born: Aug 4    │
│ [More details]          │ Age: 62          │
│                         │ Status: Active   │
│ NOTABLE EVENTS:         │                  │
│ - Event 1 with date     │ RELATED ACTORS:  │
│ - Event 2 with date     │ • Michelle Obama │
│ - Event 3 with date     │ • Malia Obama    │
│ [View all (24) →]       │ • Sasha Obama    │
│                         │                  │
│ ACHIEVEMENTS:           │ RELATED GROUPS:  │
│ - Achievement 1         │ • Democratic     │
│ - Achievement 2         │   Party          │
│ - Achievement 3         │ • US Government  │
│                         │                  │
│ TIMELINE:               │ EXTERNAL LINKS:  │
│ [Interactive timeline]  │ • Wikipedia      │
│                         │ • Official Site  │
│                         │ • Twitter        │
└─────────────────────────┴──────────────────┘
```

### Events Tab Content

```
┌────────────────────────────────────────────────┐
│ "Events involving Barack Obama (47)"           │
│                                                 │
│ FILTERS (Optional):                            │
│ [Role ▼] [Year ▼] [Sort ▼]                    │
│                                                 │
│ ┌──────────────────────────────────────────┐  │
│ │ Event 1: "Obama visits UN"               │  │
│ │ March 15, 2024 • [✓ Verified]            │  │
│ │ Role: Participant • Source: Wikipedia    │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ ┌──────────────────────────────────────────┐  │
│ │ Event 2: "Obama speech at conference"    │  │
│ │ February 28, 2024 • [⚠ Disputed]        │  │
│ │ Role: Speaker • Source: News outlet      │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ [Load more events]                             │
│                                                 │
└────────────────────────────────────────────────┘
```

**Properties**:
- Event items: Full width cards
- Height: Min 100px
- Padding: 16px
- Border: 1px solid divider
- Margin bottom: 12px
- Hover: Elevation-2, background highlight

### Related Entities Tab

```
┌────────────────────────────────────────────────┐
│ "Related Actors"                               │
│ [👥 Michelle Obama] [👥 Malia Obama]          │
│ [👥 Sasha Obama] [👥 Joe Biden]              │
│ [👥 Hillary Clinton] [+ 12 more]             │
│                                                 │
│ "Related Groups"                               │
│ [🏢 Democratic Party] [🏢 US Government]     │
│ [🏢 United Nations]                           │
│                                                 │
│ "Related Locations"                            │
│ [📍 United States] [📍 New York]             │
│ [📍 Hawaii] [+ 3 more]                       │
│                                                 │
└────────────────────────────────────────────────┘
```

**Properties**:
- Grouped by entity type
- Chips/pills layout
- Gap: 12px
- Hover: Scale, lift shadow

---

## Component Specifications

### Entity Cards (in Related section)

```
┌──────────────────────────────┐
│ [AVATAR] Michelle Obama      │ (Compact format)
│ Former First Lady            │
│ [→] (Link arrow)             │
│ Appearances: 12 events       │
└──────────────────────────────┘
```

### Timeline Visualization

```
2024 ▪█████████████████████░░░░░░
2023 ▪██████████████████░░░░░░░░░░░
2022 ▪░░░░░░░░░░░░░░░░░░░░░░░░░░░
     └─────────────────────────────
  First appearance        Last appearance
  January 2012            March 2024
```

### External Links Section

```
┌──────────────────────────────────┐
│ EXTERNAL LINKS                   │
│                                  │
│ [🔗 Official Website]            │
│ [🔗 Wikipedia]                   │
│ [🔗 Twitter (@BarackObama)]     │
│ [🔗 Wikipedia Commons]           │
│                                  │
└──────────────────────────────────┘
```

---

## Visual Specifications

### Colors

| Element | Color | Usage |
|---------|-------|-------|
| Name/Title | White | Primary heading |
| Meta info | #B0B0B0 | Secondary information |
| Tab active | #FF7976 | Current tab indicator |
| Links | #4DD3CF | External links |
| Tag | #4DD3CF | Category tags |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 (Name) | Signika | 48px | 600 |
| Title | Lora | 18px | 400 |
| H2 (Section) | Signika | 32px | 600 |
| Body | Lora | 16px | 400 |
| Meta | Lora | 14px | 400 |
| Tab | Signika | 16px | 600 |
| Label | Signika | 14px | 600 |

### Spacing

```
Profile header: 48px padding
Avatar: 200x200px (200px margin right)
Section gap: 48px
Content padding: 48px (desktop), 24px (mobile)
Tab padding: 24px horizontal
Timeline gap: 16px vertical
```

---

## Interactive Behaviors

### Tab Switching

```
Click tab:
- Fade out current content (200ms)
- Load new tab content
- Fade in new content (200ms)
- Update URL hash (#overview, #events, etc.)
- Scroll to top of content area

Active tab:
- Underline: 3px primary color
- Text: Bold
- Background: Subtle highlight (optional)
```

### Entity Pill Hover

```
Color change:
- Background: alpha(primary, 0.2)
- Text: Primary color
- Cursor: Pointer

On click:
- Navigate to entity detail page
- Maintain scroll position (back button)
```

### Timeline Hover

```
Segment hover:
- Fill: Brighter color
- Tooltip: "5 events in 2024"
- Cursor: Pointer
- Opacity: 1 (from 0.7)

On click:
- Filter events to that year
- Scroll to events section
```

### Loading States

```
Profile header: Skeleton (avatar + text lines)
Tab content: Skeleton with content shape
Events list: 3 skeleton event cards

Duration: 1.5s gradient animation
```

### Empty States

```
No events:
- Icon: Calendar icon
- Message: "No events on record"
- Sub-message: "This actor may not be involved in documented events"

No related entities:
- Message: "No related entities found"
```

---

## Accessibility (WCAG 2.1 AA)

### Semantic Structure

```html
<!-- Profile header -->
<header role="banner">
  <h1>Barack Hussein Obama</h1>
  <p role="doc-subtitle">Former President of the United States</p>
</header>

<!-- Tabs -->
<div role="tablist" aria-label="Content tabs">
  <button role="tab" aria-selected="true" aria-controls="overview">
    Overview
  </button>
</div>

<!-- Tab panel -->
<div role="tabpanel" id="overview" aria-labelledby="overview-tab">
  <!-- Content -->
</div>

<!-- External links -->
<section aria-label="External links">
  <a href="..." target="_blank" rel="noopener noreferrer">
    Wikipedia <span aria-label="opens in new window">↗</span>
  </a>
</section>
```

### Keyboard Navigation

- **Tab**: Move between tabs
- **Arrow Left/Right**: Switch tabs
- **Enter/Space**: Activate tab
- **Tab order**: Name → Bio → Tabs → Content → Related entities
- **Focus indicators**: 3px outline on all interactive elements

### Color Contrast

- Name/Title: 7:1 (white on dark)
- Meta info: 4.5:1 minimum
- All links: 7:1
- Tab underline: 7:1

### Screen Reader Support

- Announce tab state: "Tab 1 of 4, selected"
- Describe image: "Avatar of Barack Obama"
- Event role: "Participant, March 15, 2024"
- External link: "Wikipedia (opens in new window)"

---

## Mobile Optimization

### Responsive Layout

| Breakpoint | Avatar | Content Width | Sidebar |
|-----------|--------|-----------------|---------|
| Mobile (xs) | 120px | 100% | Hidden |
| Tablet (sm) | 150px | 100% | Hidden |
| Desktop (md+) | 200px | 70% | 30% visible |

### Mobile Header

```
[AVATAR]
NAME
Title/Description
[Icons: Links]
────────────────
[Tab 1] [Tab 2] [Tab 3] →
(Scrollable horizontally)
```

### Mobile Events List

- Full width
- 12px padding
- Stacked vertically
- "Load more" button at bottom

### Touch Targets

- Tab buttons: 44x44px
- Entity pills: 40x40px minimum
- External links: 44x44px

---

## Performance

### Image Optimization

- Avatar: 200x200px WebP, JPEG fallback
- Lazy load related entity avatars
- Use placeholder while loading

### Code Splitting

- Overview tab: Main bundle
- Events tab: Lazy load
- Related tab: Lazy load
- Timeline: Lazy load

### Caching

- Entity data: Cache 24 hours
- Related data: Cache 7 days
- Events: Cache 1 hour (more volatile)

---

## Design Review Checklist (Entity Pages)

### Visual Design
- [ ] Avatar is prominent and clear (200x200px)
- [ ] Name (H1) is at top
- [ ] Tabs are sticky on scroll
- [ ] Tab active indicator is clear
- [ ] Dark mode appearance is correct
- [ ] Color contrast is 7:1 minimum

### Information Architecture
- [ ] Overview tab shows key biography
- [ ] Events tab lists all involvement
- [ ] Related entities are grouped by type
- [ ] External links are useful and current
- [ ] Timeline visualization is clear
- [ ] Breadcrumb shows navigation path

### Accessibility
- [ ] Heading hierarchy is correct
- [ ] Tab navigation works with keyboard
- [ ] Tab state is announced to screen readers
- [ ] Focus indicators visible
- [ ] All links indicate external (↗ icon)
- [ ] Images have alt text

### Mobile
- [ ] Avatar size reduced on mobile (120px)
- [ ] Sidebar is hidden/repositioned
- [ ] Tabs scroll horizontally
- [ ] Touch targets are 44px+
- [ ] No horizontal scroll

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained by**: Design System Team
