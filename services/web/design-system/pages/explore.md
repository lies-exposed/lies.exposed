# Web Service Page Design: Explore & Search Pages

**Parent Document**: `services/web/design-system/MASTER.md`  
**Applies to**: Search results, explore/discovery, filtering pages

---

## Overview

The Explore page is where users discover fact-checking content. Design principles:
- **Search-first** - Global search is the primary entry point
- **Faceted discovery** - Multiple ways to filter and browse
- **Visual scanning** - Results are scannable at a glance
- **Relevance** - Most relevant results appear first

---

## Page Layout Structure

### Main Explore/Search Page (`/search`, `/explore`)

**Desktop Layout**:
```
┌──────────────────────────────────────────────────┐
│ HEADER + SEARCH BAR (Full width)                 │
├──────────────────────────────────────────────────┤
│                                                   │
│ ┌────────────────┬──────────────────────────────┐ │
│ │ FACETED FILTERS│  SEARCH RESULTS              │ │
│ │ (Left Sidebar) │  - Result 1                  │ │
│ │                │  - Result 2                  │ │
│ │ Content Types: │  - Result 3                  │ │
│ │ • Events (42)  │  - Result 4                  │ │
│ │ • Actors (18)  │  - Result 5                  │ │
│ │ • Groups (7)   │                              │ │
│ │ • Articles (3) │  [Pagination]                │ │
│ │                │                              │ │
│ │ Verification:  │  Show: [10 per page ▼]      │ │
│ │ • Verified (15)│  Sort: [Relevance ▼]        │ │
│ │ • Disputed (8) │                              │ │
│ │ • Unknown (47) │                              │ │
│ │                │                              │
│ │ Date Range:    │                              │ │
│ │ [From] [To]    │                              │ │
│ │                │                              │ │
│ │ [Apply] [Clear]│                              │ │
│ │                │                              │ │
│ └────────────────┴──────────────────────────────┘ │
│                                                   │
├──────────────────────────────────────────────────┤
│ FOOTER                                           │
└──────────────────────────────────────────────────┘
```

**Mobile Layout (Stacked)**:
```
┌──────────────────────────┐
│ HEADER                   │
├──────────────────────────┤
│ SEARCH BAR               │
├──────────────────────────┤
│ [Filters] [Sort]         │
├──────────────────────────┤
│ SEARCH RESULTS           │
│ - Result 1               │
│ - Result 2               │
│ - Result 3               │
│                          │
│ [Load more]              │
│                          │
├──────────────────────────┤
│ FOOTER                   │
└──────────────────────────┘
```

---

## Component Specifications

### Search Bar Component

**Desktop (Full Width)**:
```
┌──────────────────────────────────────────────────┐
│                                                   │
│ 🔍 [Enter search term or actor name...          ]│  [Advanced ▾]
│                                                   │
│ Suggestions (Autocomplete):                      │
│ • Barack Obama (Actor)                           │
│ • UN General Assembly (Group)                    │
│ • 2024 US Election (Event)                       │
│ • Climate Change Fact Check (Topic)              │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Properties**:
- Height: 56px (mobile), 48px (desktop)
- Icon: Search (24px, secondary color)
- Padding: 16px horizontal
- Border radius: 8px
- Border: 2px solid transparent → 2px solid primary on focus
- Autocomplete: Below input, max 8 suggestions
- Font size: 16px (prevents iOS zoom)

### Faceted Filters Sidebar

**Structure**:
```
┌─────────────────────────────┐
│ FILTERS                     │
│ [x] Show filters            │ (Close button on mobile)
├─────────────────────────────┤
│ CONTENT TYPE (Checkbox)     │
│ ☑ Events (342)              │
│ ☑ Actors (156)              │
│ ☑ Groups (48)               │
│ ☑ Articles (23)             │
│ ☐ Media (8)                 │
├─────────────────────────────┤
│ VERIFICATION STATUS         │
│ ☐ Verified (87)             │
│ ☐ Disputed (124)            │
│ ☐ Unverified (361)          │
├─────────────────────────────┤
│ DATE RANGE                  │
│ From: [MM/DD/YYYY]          │
│ To: [MM/DD/YYYY]            │
│ [Calendar]                  │
├─────────────────────────────┤
│ INVOLVED ENTITIES           │
│ (Searchable list)           │
│ [Search entities...]        │
│ • Barack Obama              │
│ • Joseph Biden              │
│ • UN Secretary General      │
│ [+ 42 more]                 │
├─────────────────────────────┤
│ RELATED TOPICS              │
│ [Politics] [Economy]        │
│ [Science] [Health]          │
│ [Technology] [Environment]  │
│                             │
│ (3) Active filters          │
│ [Clear all]  [Apply]        │
└─────────────────────────────┘
```

**Mobile Filters Panel**:
- Full-screen overlay on "Filters" click
- Header: "Filters" title + close button
- Scrollable content
- Sticky footer: [Clear all] [Apply]
- Width: 100% of screen
- Backdrop: Semi-transparent (prevents interaction behind)

### Search Results Cards

**Result Card Types**:

#### Event Result
```
┌────────────────────────────────────┐
│ TITLE: "Barack Obama meets UN..."  │  (Bold, 18px)
│                                     │
│ VERIFICATION: [✓ Verified]         │
│ SOURCE: Wikipedia • March 15, 2024 │  (14px, secondary)
│                                     │
│ SNIPPET: "On March 15, 2024, former│  (16px, 2 lines max)
│ President Barack Obama attended... │
│ [Read more →]                      │
│                                     │
│ INVOLVED:                          │
│ [Barack Obama] [UN] [New York]     │
│                                     │
│ RELEVANCE: ████████░░ 85%          │
└────────────────────────────────────┘
```

#### Actor Result
```
┌────────────────────────────────────┐
│ [AVATAR]  NAME: Barack Hussein     │  (With profile image)
│ (64x64px) Obama                    │
│                                     │
│ TITLE: 44th President of the US    │  (14px, secondary)
│                                     │
│ BIO SNIPPET: "Born August 4, 1961,│  (16px, 2 lines max)
│ Barack Hussein Obama II is an      │
│ American politician... [More →]    │
│                                     │
│ APPEARANCES: 47 events             │
│ RELATED: [Donald Trump]            │  (Other actors)
│ [Joe Biden] [Hillary Clinton]      │
│                                     │
│ RELEVANCE: ████████░░ 78%          │
└────────────────────────────────────┘
```

#### Group Result
```
┌────────────────────────────────────┐
│ [LOGO]    NAME: United Nations     │  (With organization logo)
│ (64x64px) (UN)                     │
│                                     │
│ TYPE: International Organization   │  (14px, secondary)
│ FOUNDED: October 24, 1945          │
│                                     │
│ DESCRIPTION: "The United Nations is│  (16px, 2 lines max)
│ an intergovernmental organization  │
│ aimed at... [More →]               │
│                                     │
│ INVOLVED IN: 34 events             │
│ MEMBERS: [US] [China] [UK]...      │
│                                     │
│ RELEVANCE: ████████░░ 82%          │
└────────────────────────────────────┘
```

**Result Card Properties**:
- Padding: 24px (desktop), 16px (mobile)
- Border radius: 8px
- Border: 1px solid divider
- Shadow: elevation-1 (subtle)
- Hover: elevation-2, border accent
- Margin bottom: 16px
- Max-width: Full container width
- Min-height: 160px

### Pagination Controls

```
┌────────────────────────────────────────────────────┐
│ Showing 1-10 of 427 results                        │
│                                                     │
│ [← Previous] [1] [2] [3] ... [42] [43] [Next →]   │
│                                                     │
│ Show per page: [10 ▼] | Sort: [Relevance ▼]      │
└────────────────────────────────────────────────────┘
```

**Properties**:
- Center-aligned
- Previous/Next buttons: Disabled if on first/last page
- Current page: Bold (primary color)
- Padding: 24px vertical, 16px horizontal

### Empty Results State

```
┌────────────────────────────────────────────────────┐
│                                                     │
│               🔍                                   │
│                                                     │
│         No results found for:                      │
│         "Barack Obaaama"                           │
│                                                     │
│    Did you mean: [Barack Obama]?                  │
│                                                     │
│    Try:                                            │
│    • Check your spelling                           │
│    • Use fewer or different keywords              │
│    • Try a different search term                  │
│                                                     │
│    [Clear search] [Browse all events]             │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## Search Features

### Autocomplete/Suggestions

```
Triggered when user:
- Starts typing (after 2 characters)
- Clicks in search box
- Has not searched recently

Suggestions show:
- Recent searches (for logged-in users)
- Popular searches (global)
- Matching entities (actors, groups, topics)
- Recent events

Format: [Icon] [Title] [Type badge]
Example: 🔗 Barack Obama (Actor)
```

### Advanced Search

Click "Advanced" button to reveal:

```
┌────────────────────────────────────┐
│ ADVANCED SEARCH OPTIONS            │
├────────────────────────────────────┤
│ Search in:                         │
│ ☑ Event titles                     │
│ ☑ Event descriptions              │
│ ☑ Actor names                      │
│ ☑ Group names                      │
│ ☑ Sources                          │
│                                     │
│ Contains all terms:                │
│ [                              ]  │
│                                     │
│ Contains exact phrase:             │
│ [                              ]  │
│                                     │
│ Does not contain:                  │
│ [                              ]  │
│                                     │
│ Date range:                        │
│ From: [    ]  To: [    ]           │
│                                     │
│ Verification status:               │
│ [Verified] [Disputed] [Unknown]   │
│                                     │
│ [Search] [Reset]                   │
└────────────────────────────────────┘
```

---

## Visual Specifications

### Colors

| Element | Color | Usage |
|---------|-------|-------|
| Search bar border | #FF7976 | On focus |
| Filter toggle | #4DD3CF | Active |
| Result title link | #4DD3CF | Hover underline |
| Verification badge | Color-coded | See Event pages |
| Relevance bar | #FF7976 | Background for bar |
| Relevance fill | #FF7976 | Actual relevance % |

### Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Search placeholder | Lora | 16px | 400 | Secondary text |
| Filter heading | Signika | 16px | 600 | Primary |
| Filter option | Lora | 14px | 400 | Primary text |
| Result title | Lora | 18px | 600 | Primary |
| Result meta | Lora | 14px | 400 | Secondary text |
| Result snippet | Lora | 16px | 400 | Primary text |
| Pagination | Lora | 14px | 400 | Primary text |

### Spacing

```
Search bar: 56px height (mobile), 48px (desktop)
Result cards: 16px gap
Filter sidebar: 250px width (desktop)
Filter sections: 24px gap
Filter items: 12px vertical gap
```

---

## Interactive Behaviors

### Filter Interactions

**Checkbox Change**:
- Update result count instantly (or show loading state)
- "Active filters" badge shows count
- "Clear all" button appears when filters applied

**Date Range**:
- Show calendar picker on click
- Allow manual text input (MM/DD/YYYY)
- "From" must be before "To"
- Validate and show error if invalid

**Entity Search**:
- Auto-complete entity names
- Show recent selections at top
- "Load more" to expand list

### Search Result Interactions

**Hover State**:
```
- Card: elevation-1 → elevation-4
- Title: color unchanged, underline appears
- Cursor: pointer
- Background: subtle highlight (alpha 0.05)
```

**Click**:
- Navigate to entity detail or event detail page
- Maintain search context (return to results on back)

### Relevance Indicator

- Bar width represents relevance percentage
- Color: Gradient from #FFA726 (low) → #66BB6A (high)
- Show tooltip on hover: "85% relevance"

### Sorting Options

```
Sort by:
[Relevance ▼]  (default)
[Date (newest first)]
[Date (oldest first)]
[Popularity]
[Alphabetical (A-Z)]
[Alphabetical (Z-A)]
```

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation

- **Tab order**: Search box → Filters → Sort options → Results → Pagination
- **Search box focus**: Auto-focus on page load
- **Enter key**: Submit search
- **Escape key**: Close filters panel (mobile)
- **Arrow keys**: Navigate filter options (optional, for power users)

### ARIA Labels

```html
<!-- Search input -->
<input
  type="search"
  role="searchbox"
  aria-label="Search events, actors, and organizations"
  placeholder="Enter search term..."
/>

<!-- Active filters count -->
<span aria-live="polite" aria-atomic="true">
  3 filters active
</span>

<!-- Results region -->
<section role="region" aria-live="polite" aria-label="Search results">
  <!-- Results cards -->
</section>

<!-- Pagination -->
<nav aria-label="Search results pagination">
  <!-- Pagination controls -->
</nav>
```

### Color Contrast

- Text on results: 7:1 minimum
- Links: 7:1 minimum
- Filter checkboxes: 4.5:1 minimum
- Status badges: 7:1 minimum

### Form Accessibility

- **Labels**: All inputs have associated labels
- **Errors**: Clear error messages linked to inputs
- **Validation**: Real-time feedback
- **Hints**: Helper text for advanced options

---

## Mobile Optimization

### Touch Targets
- Checkboxes: 44x44px (actual), 24x24px visual
- Filter button: 44x44px
- Pagination buttons: 44x44px
- Result cards: Full width, min 56px height

### Mobile Filters Panel
- Full-screen overlay
- Header with close button (X, 44x44px)
- Scrollable content with padding
- Sticky footer (Apply/Clear buttons)
- No input zooming (16px+ font)

### Mobile Search
- Full-width search bar
- Clear button (X) appears when text entered
- Keyboard appears on focus (auto)
- Suggestions display below input

### Mobile Results
- Full-width cards
- Single column layout
- Stack instead of grid
- "Load more" button at bottom (instead of pagination)

---

## Performance Guidelines

### Search Performance
- Max 50 results per page (default 10)
- Server-side search with index
- 500ms max response time
- Show loading state while searching

### Image Loading
- Lazy load avatars/logos
- Use thumbnails (200x200px)
- WebP with JPEG fallback
- Placeholder skeleton while loading

### Caching
- Cache search queries for 24 hours
- Cache filter options for 7 days
- Cache autocomplete suggestions for 7 days

---

## Common Patterns

### Search URL Structure
```
/search?q=Barack+Obama&type=actor,event&verified=true&limit=10&page=2

Params:
- q: Search query
- type: Content types (actor, event, group, media)
- verified: Filter by verification (true, false, null)
- date_from: Start date (ISO format)
- date_to: End date (ISO format)
- sort: Sort order (relevance, date_desc, date_asc)
- limit: Results per page (10-50)
- page: Page number
```

### Filter Persistence
- Save user's last search and filters
- Show "Recent" section in suggestions
- Allow saving searches as "Alerts"

---

## Design Review Checklist (Explore Pages)

### Visual Design
- [ ] Search bar is prominent (56px, full width)
- [ ] Filters are well-organized and labeled
- [ ] Result cards are scannable
- [ ] Verification badges are clear and consistent
- [ ] Relevance indicators are visible
- [ ] Dark mode appearance is correct
- [ ] Spacing is consistent (multiples of 8px)

### Information Architecture
- [ ] Search is the primary entry point
- [ ] Filters are organized by category
- [ ] Result count and relevance are visible
- [ ] Pagination or infinite scroll is clear
- [ ] Empty state provides guidance

### Accessibility
- [ ] Focus indicators are visible (3px outline)
- [ ] Autocomplete results are announced to screen readers
- [ ] Filter changes update results dynamically
- [ ] Keyboard-only users can navigate all filters
- [ ] Color contrast is 7:1 minimum
- [ ] Error messages are clear and linked to inputs

### Mobile
- [ ] Search bar is full width
- [ ] Filters collapse into a modal
- [ ] Results stack in single column
- [ ] Touch targets are 44px+
- [ ] No horizontal scroll

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained by**: Design System Team
