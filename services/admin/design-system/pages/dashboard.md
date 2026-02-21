# Admin Service Page Design: Dashboard

**Parent Document**: `services/admin/design-system/MASTER.md`  
**Applies to**: Admin overview/dashboard pages (`/dashboard`, `/admin`)

---

## Overview

The admin dashboard provides a high-level overview of system metrics, recent activity, and quick access to common tasks. Design goals:
- **Information density** - Pack useful data without overwhelming
- **Quick actions** - Common tasks accessible in 1-2 clicks
- **Real-time updates** - Show current state
- **Scanability** - Quickly identify important issues

---

## Page Layout

**Desktop**:
```
┌─────────────────────────────────────────┐
│ HEADER + Search + User menu             │
├─────────────────────────────────────────┤
│ SIDEBAR | MAIN CONTENT                  │
│         │                               │
│ [Menu]  │ KPI CARDS (4 columns)        │
│ ·····   │ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│         │ │KPI1│ │KPI2│ │KPI3│ │KPI4││
│         │ └────┘ └────┘ └────┘ └────┘│
│         │                               │
│         │ CHARTS/GRAPHS (2 columns)    │
│         │ ┌──────────────┐ ┌──────────┐│
│         │ │Chart 1       │ │Chart 2   ││
│         │ └──────────────┘ └──────────┘│
│         │                               │
│         │ RECENT ACTIVITY (Full width) │
│         │ ┌─────────────────────────┐ │
│         │ │ Activity 1              │ │
│         │ │ Activity 2              │ │
│         │ │ Activity 3              │ │
│         │ └─────────────────────────┘ │
│         │                               │
└─────────────────────────────────────────┘
```

---

## Section Specifications

### KPI Cards (Key Performance Indicators)

```
┌─────────────────────────────┐
│ TOTAL EVENTS                │ (Label: 12px, secondary)
│ 427                         │ (Number: 36px, bold, primary)
│ ↑ 12% from last week       │ (Trend: 12px, green/red)
│                             │
│ [Drill down →] (Optional)   │ (Link to detail)
└─────────────────────────────┘
```

**Grid**: 4 columns (desktop), 2 columns (tablet), 1 column (mobile)  
**Padding**: 16px  
**Height**: 120px  
**Spacing**: 12px gap

**KPI Types**:
- Total Events Tracked
- New Events (This Week)
- Verification Status (Verified/Disputed/Unverified)
- Active Contributors

### Charts Section

**Chart 1: Events by Status (Pie Chart)**
```
┌──────────────────────────────┐
│ EVENTS BY VERIFICATION STATUS│
│                              │
│        ●●●●●●●              │ (Legend)
│      ●●       ●●             │ • Verified: 87
│    ●●           ●●           │ • Disputed: 124
│   ●              ●           │ • Unverified: 216
│   ●              ●           │
│    ●●           ●●           │
│      ●●       ●●             │ Total: 427
│        ●●●●●●●              │
│                              │
└──────────────────────────────┘
```

**Chart 2: Events Over Time (Line Chart)**
```
┌──────────────────────────────┐
│ EVENTS CREATED (Last 30 days)│
│                              │
│ 50│        ╱╲                │
│ 40│      ╱  ╲      ╱╲        │
│ 30│    ╱      ╲    ╱  ╲      │
│ 20│  ╱          ╲╱      ╲    │
│ 10│╱                      ╲  │
│  0└──────────────────────── │
│   Day 1  Day 10  Day 20 Day 30
│                              │
└──────────────────────────────┘
```

**Properties**:
- Responsive (shrink on mobile)
- Interactive legend (click to show/hide)
- Hover: Show values
- Colors: Status badge colors (green, orange, gray)

### Recent Activity Section

```
┌────────────────────────────────────────┐
│ RECENT ACTIVITY (Last 24 hours)        │
├────────────────────────────────────────┤
│ 2:45 PM | [Event] New event created    │
│         | "Obama visits UN Summit"     │
│         | by John Smith                │
│                                        │
│ 2:15 PM | [Actor] Actor updated       │
│         | "Barack Obama" bio updated  │
│         | by Jane Doe                  │
│                                        │
│ 1:30 PM | [Verification] Status update│
│         | "Tech CEO meeting" verified │
│         | by System                   │
│                                        │
│ [View more activity →]                 │
│                                        │
└────────────────────────────────────────┘
```

**Properties**:
- Compact rows (40px min height)
- Time on left (12px, secondary color)
- Icon + action in middle
- Name/user on right (optional)
- Hover: Highlight row (alpha 0.05)
- Max 8 items (then "View more" link)

### Quick Actions Panel (Optional)

```
┌────────────────────────────────────────┐
│ QUICK ACTIONS                          │
├────────────────────────────────────────┤
│ [+ New Event]                          │
│ [+ New Actor]                          │
│ [+ New Group]                          │
│ [Review Queue] (12)                    │
│ [Pending Approvals] (3)                │
│                                        │
└────────────────────────────────────────┘
```

**Position**: Right sidebar or top-right corner  
**Fixed**: Sticky on scroll  
**Width**: 200px  
**Button style**: Primary/secondary

---

## Component Specifications

### KPI Card Component

```typescript
interface KPICardProps {
  label: string;           // "Total Events"
  value: number;          // 427
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;   // 12
    label: string;        // "from last week"
  };
  icon?: IconType;
  onClick?: () => void;   // Navigate to detail
  color?: 'primary' | 'success' | 'warning' | 'error';
}
```

**Visual**:
- Border: 1px solid divider
- Background: Surface color
- Border radius: 8px
- Shadow: elevation-1
- Hover: elevation-2, border accent
- Color coding: Green (success), Orange (warning), Red (error)

### Activity Item Component

```
[Icon] [Time] [Action] [Timestamp]
```

Properties:
- Icon size: 20px
- Time width: 60px
- Timestamp: Right-aligned
- Click: Navigate to item detail

---

## Visual Specifications

### Colors

| Element | Color | Usage |
|---------|-------|-------|
| KPI Up | #66BB6A | Positive trend |
| KPI Down | #EF5350 | Negative trend |
| Chart (Verified) | #66BB6A | Verified status |
| Chart (Disputed) | #FFA726 | Disputed status |
| Chart (Unverified) | #757575 | Unverified status |
| Activity icon | #4DD3CF | Activity indicator |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page title | Signika | 28px | 600 |
| KPI label | Lora | 12px | 400 |
| KPI value | Signika | 36px | 600 |
| Trend | Lora | 12px | 400 |
| Chart title | Signika | 14px | 600 |
| Activity time | Lora | 12px | 400 |
| Activity action | Lora | 14px | 400 |

### Spacing

```
Page padding: 24px
KPI grid gap: 16px
Chart section gap: 24px
Section gap: 32px
Activity item gap: 12px
Quick actions gap: 8px
```

---

## Interactive Behaviors

### KPI Card Hover
- Elevation: elevation-1 → elevation-2
- Border: divider → primary color (alpha 0.3)
- Cursor: Pointer (if clickable)

### Chart Interactions
- Legend click: Toggle series visibility
- Hover: Show tooltip with exact value
- Click point: Show detail (optional)

### Activity Click
- Highlight row
- Navigate to item detail
- Or open in modal

---

## Real-time Updates

### Auto-refresh Strategy
- KPI cards: Update every 5 minutes
- Charts: Update every 10 minutes
- Activity: Update every 1 minute
- Show "Last updated: X seconds ago" timestamp

### Update Animation
- KPI value change: Fade animation (200ms)
- New activity: Slide in from top (300ms)
- Chart change: Smooth transition (500ms)

---

## Mobile Dashboard

### Layout Changes
- KPI cards: 1 column (full width)
- Charts: Stack vertically
- Activity: Full width
- Quick actions: Moved to top as button bar

### Mobile Optimization
```
[+ New] [Queue] [Approvals] [More ▾]
(Horizontal scrolling if too many)
```

---

## Accessibility (WCAG 2.1 AA)

### Semantic HTML
```html
<main role="main" aria-label="Admin Dashboard">
  <h1>Dashboard</h1>
  
  <section aria-label="Key Performance Indicators">
    <article role="region" aria-label="Total Events: 427">
      <!-- KPI card -->
    </article>
  </section>
  
  <section aria-label="Charts">
    <!-- Charts with descriptions -->
  </section>
  
  <section aria-label="Recent Activity">
    <!-- Activity list -->
  </section>
</main>
```

### Color Contrast
- Labels: 4.5:1 minimum
- Values: 7:1 (importance)
- Trend indicators: Use color + text/icon

### Focus Management
- Tab through KPI cards
- Chart interactive elements keyboard-accessible
- Activity items clickable via keyboard
- Focus indicators: 2px outline

---

## Design Review Checklist

### Information Density
- [ ] KPIs visible without scrolling
- [ ] Charts are readable and clear
- [ ] Activity list shows most important items
- [ ] No unnecessary whitespace

### Usability
- [ ] KPI cards link to detailed views
- [ ] Charts have clear titles and legends
- [ ] Activity is sorted chronologically (newest first)
- [ ] "View more" links available

### Accessibility
- [ ] Focus order is logical
- [ ] Color contrast adequate
- [ ] Chart data accessible (table alternative)
- [ ] Trend indicators use text + color

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained by**: Design System Team
