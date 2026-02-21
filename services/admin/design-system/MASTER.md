# lies.exposed Admin - Service Design System

**Applies to**: Internal administrative backoffice at admin.lies.exposed

**Hierarchy**: Page-specific > This document > `packages/@liexp/ui/DESIGN_SYSTEM.md`

---

## Overview

The lies.exposed admin service is a **data-dense, power-user interface** for content management, fact-checking workflow, and system administration. The design system prioritizes:

1. **Efficiency** - Minimize clicks/steps for power users
2. **Information Density** - Show as much relevant data as possible
3. **Workflow Optimization** - Batch operations, keyboard shortcuts
4. **Accessibility** - WCAG 2.1 AA compliance for extended work sessions
5. **Dark Mode** - Reduced eye strain for long working hours

---

## Service Identity

### Purpose
Provide internal tools for content managers, fact-checkers, and administrators to create, review, and manage fact-checking content at scale.

### Key Characteristics
- **Internal-only**: Requires authentication and role-based access
- **Data-intensive**: Displays structured data in compact layouts
- **Task-focused**: Workflows for common operations
- **Extensible**: Tools and integrations for power users
- **Real-time**: Updates and notifications for active content

### Target Audience
- Content managers
- Fact-checkers
- System administrators
- QA/compliance specialists
- API integrators

---

## Design Differences from Master System

### 1. Spacing & Layout

**Master System**: 4px base unit (4, 8, 12, 16, 24, 32, 40, 48px...)

**Admin Override**: 50% reduction for power user density (2px base, effectively)

| Context | Master | Admin | Rationale |
|---------|--------|-------|-----------|
| Page margins | 48px | 16px | Maximize content area |
| Section gaps | 64px | 24px | Tight grouping |
| Card padding | 16-24px | 12-16px | Compact but readable |
| List padding | 8px vertical | 4px vertical | Tight lists |
| Button height | 44px | 36-40px | Space efficiency |
| Input height | 48px | 40px | Compact forms |

**Implementation**:
```typescript
// Admin-specific spacing scale
const adminSpacing = {
  xs: 4,      // Micro
  sm: 8,      // Small
  md: 12,     // Medium (1.5x)
  lg: 16,     // Base
  xl: 24,     // Large
  xxl: 32,    // Extra large
};

// Use with sx prop
<Box sx={{ p: 1.5 }}> {/* 12px padding */}
```

### 2. Typography System

**Master System**: Signika (headers), Lora (body)

**Admin Override**: Prioritize scanability and distinction over editorial elegance

| Element | Font | Size | Weight | Use Case |
|---------|------|------|--------|----------|
| H1 (Page Title) | Signika | 28px | 600 | Page headers |
| H2 (Section) | Signika | 22px | 600 | Section headers |
| H3 (Subsection) | Signika | 18px | 600 | Subsection headers |
| Body | Lora | 14px | 400 | Table cells, lists |
| Label | Signika | 13px | 600 | Form labels, badge text |
| Caption | Lora | 12px | 400 | Captions, timestamps |
| Code | Monospace | 13px | 400 | API responses, IDs |

**Guidelines**:
- Reduce line height to 1.4-1.5 (tighter)
- Use bold/color for quick scanning
- Monospace for technical content (IDs, codes)
- Consistent baseline alignment

### 3. Color Usage

**Master Palette** (use as-is):
- Primary: #FF7976 (coral, actions)
- Secondary: #4DD3CF (teal, status/links)
- Background: #121212 (dark)
- Surface: #1e1e1e (cards, sections)

**Admin-Specific Semantic Colors**:

| Color | Hex | Use Case | Rationale |
|-------|-----|----------|-----------|
| Success | #66BB6A | Completed tasks, approved | Green for positive |
| Warning | #FFA726 | Review needed, drafts | Attention without alarm |
| Error | #EF5350 | Failed operations, rejections | High contrast alert |
| Info | #42A5F5 | System messages, hints | Blue for information |
| Neutral | #757575 | Disabled state, secondary text | Low contrast secondary |
| Status (Active) | #4DD3CF | Currently editing/processing | Teal (secondary) |
| Status (Draft) | #FFA726 | Unsaved changes | Warning color |
| Status (Archived) | #9E9E9E | Hidden/archived content | Neutral |

**Quick Reference Badges**:
```typescript
// Color-coded status indicators
const statusColors = {
  verified: '#66BB6A',      // Green
  disputed: '#FFA726',      // Orange
  unverified: '#757575',    // Gray
  processing: '#42A5F5',    // Blue
  error: '#EF5350',         // Red
};
```

### 4. Component Sizing

**Master System**: Touch targets 44x44px minimum

**Admin Override**: Optimize for desktop first, mouse/keyboard input

| Component | Size | Rationale |
|-----------|------|-----------|
| Buttons (Primary) | 36-40px height | Keyboard + mouse |
| Buttons (Secondary) | 32-36px height | Compact toolbar |
| Buttons (Icon) | 32px (target 40px) | Icon-only actions |
| Input Fields | 40px height | Form density |
| List Rows | 40-48px min | Table efficiency |
| Card Height | Variable | Content-driven |
| Checkbox/Radio | 16x16px (target 24x24px) | Standard |

**Note**: Desktop users typically use mice, so targets can be smaller than mobile (but maintain 24px hit zones in touch-friendly areas).

### 5. Navigation & Information Architecture

**Master System**: Standard navigation patterns

**Admin Override**: Task-focused, quick access navigation

#### Primary Navigation
- **Logo** (left) - Dashboard link
- **Quick Actions** (left) - New event, new actor (with keyboard shortcut indicator)
- **Search** (center) - Global content search
- **User Menu** (right) - Profile, settings, logout

#### Secondary Navigation (Sidebar or Tabs)
- Dashboard / Overview
- Events Management
- Entities (Actors, Groups, Locations)
- Content Review Queue
- Analytics & Reports
- Settings & Configuration
- Admin Tools

#### Context Menu (Right-click)
- Edit
- Duplicate
- Delete
- Archive
- Share
- Export

### 6. Data Display & Tables

**Master System**: Standard table component

**Admin Enhancement**: Dense, sortable, filterable tables for power users

```typescript
// Table design pattern for admin
const AdminTable = {
  // Compact header
  header: {
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  
  // Dense rows
  row: {
    padding: '8px 12px',
    fontSize: '14px',
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  },
  
  // Interactive
  cell: {
    '&:focus-within': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    },
  },
};
```

**Table Features**:
- Column sorting (click header)
- Multi-select rows (checkboxes)
- Inline editing (double-click)
- Inline actions (edit, delete icons)
- Pagination (at bottom)
- Column visibility toggle
- Export to CSV

### 7. Form Design & Workflow

**Master System**: Standard forms

**Admin Enhancement**: Batch operations, keyboard navigation, auto-save

```typescript
// Admin form pattern
const AdminForm = {
  // Compact inputs
  input: {
    padding: '8px 12px',
    fontSize: '14px',
    borderRadius: 4,
    '&:focus': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
  
  // Inline validation
  error: {
    color: theme.palette.error.main,
    fontSize: '12px',
    marginTop: 2,
  },
};
```

**Features**:
- Auto-save drafts every 30 seconds
- Keyboard shortcuts (Ctrl+S save, Ctrl+Enter submit)
- Inline validation with field-level errors
- Required field indicators (red asterisk)
- Help icons with tooltips
- Batch edit mode (edit multiple rows)

### 8. Dialogs & Modals

**Master System**: Standard modal

**Admin Override**: Fast interactions, keyboard-first

```typescript
// Admin dialog pattern - compact, keyboard-accessible
const AdminDialog = {
  // Tight layout
  content: {
    padding: '16px',
  },
  
  // Action buttons
  actions: {
    padding: '12px 16px',
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
  },
};

// Keyboard shortcuts
const shortcuts = {
  'Escape': 'Close dialog',
  'Ctrl+Enter': 'Submit form',
  'Tab': 'Next field',
  'Shift+Tab': 'Previous field',
};
```

### 9. Search & Filter

**Master System**: Basic search

**Admin Enhancement**: Faceted search, saved filters, advanced queries

```typescript
// Advanced filter interface
const FilterUI = {
  // Filter chips
  chip: {
    height: 28,
    fontSize: 13,
    margin: '4px 4px',
  },
  
  // Saved filters sidebar
  sidebar: {
    width: 200,
    borderRight: `1px solid ${theme.palette.divider}`,
    padding: '12px',
  },
};

// Search syntax examples
const searchSyntax = `
status:verified actor:"Barack Obama"
created:2024-01-01..2024-12-31
source:wikipedia
`;
```

### 10. Notifications & Alerts

**Master System**: Toast notifications

**Admin Enhancement**: In-app notification center with history

```typescript
// Notification types for admin
const notificationTypes = {
  success: { icon: 'check', color: 'success', timeout: 3000 },
  error: { icon: 'error', color: 'error', timeout: 0 }, // Sticky
  warning: { icon: 'warning', color: 'warning', timeout: 5000 },
  info: { icon: 'info', color: 'info', timeout: 4000 },
  task: { icon: 'hourglass', color: 'info', timeout: 0 }, // Progress task
};
```

**Bell Icon Features**:
- Shows unread count
- Notification history (24 hours)
- Mark as read
- Clear all
- Filter by type (success, error, etc.)

### 11. Loading & Progress States

**Master System**: Loading spinner

**Admin Enhancement**: Progress indicators for long operations

| State | Display | Duration | Example |
|-------|---------|----------|---------|
| Quick Load | Skeleton | <500ms | Form submit |
| Long Load | Progress bar | 500ms-3s | Data import |
| Background | Toast notification | 3s+ | Batch processing |
| Upload | Upload progress | Variable | File upload |

### 12. Mobile Responsiveness (Limited)

**Note**: Admin interface is primarily desktop-focused. Mobile support is secondary.

**Breakpoint Strategy**:
- **Tablet (600px+)**: Show side navigation collapsed, expand on tap
- **Phone (<600px)**: Show mobile navigation, stack data vertically
- **Default**: Assume desktop with mouse/keyboard

### 13. Keyboard Shortcuts

**Master System**: No keyboard shortcuts documented

**Admin Requirement**: All common actions have keyboard shortcuts

```typescript
const keyboardShortcuts = {
  // Navigation
  'g + d': 'Go to Dashboard',
  'g + e': 'Go to Events',
  'g + a': 'Go to Actors',
  
  // Common actions
  'n': 'New event',
  'e': 'Edit selected',
  'd': 'Delete selected',
  'f': 'Focus search',
  '?': 'Show shortcuts help',
  
  // Form
  'Ctrl+S': 'Save/Submit',
  'Ctrl+Enter': 'Quick submit',
  'Esc': 'Cancel/Close',
};
```

**Display**: Show shortcuts in tooltips and a dedicated help modal (`?` key).

---

## Component Usage Guide (Admin)

### Approved Components

| Category | Component | Usage | Notes |
|----------|-----------|-------|-------|
| **Layout** | Grid | Data tables, multi-column | Use for density |
| | Stack | Form sections, vertical grouping | Use for compact spacing |
| | Paper | Card containers | Minimal elevation |
| **Data** | Table | Structured data display | Sortable, filterable |
| | List | Simple lists | Virtualized for length |
| | DataGrid (MUI) | Large datasets | Built-in pagination |
| **Forms** | TextField | Text input | Full width on forms |
| | Select | Dropdowns | Native HTML preferred |
| | Checkbox | Multi-select | Compact size |
| | RadioGroup | Single-choice | Vertical stack |
| | Switch | Toggle settings | Use sparingly |
| | DatePicker | Date selection | Keyboard-navigable |
| **Buttons** | Button (Primary) | Main actions | High visibility |
| | Button (Secondary) | Alternative actions | Lower priority |
| | IconButton | Toolbar actions | Size 32-40px |
| | ButtonGroup | Related actions | Compact button sets |
| **Navigation** | Tabs | Content sections | Horizontal tabs |
| | Breadcrumb | Page hierarchy | Always show path |
| | Menu | Context actions | Right-click or button |
| **Feedback** | Alert | Error/warning messages | Always dismissible |
| | Snackbar | Notifications | Auto-dismiss |
| | Tooltip | Help text | On hover/focus |
| | Skeleton | Loading state | Show content shape |
| **Dialog** | Dialog | Confirmations, forms | Modal overlay |
| | Drawer | Side panels | Slide from edge |
| **Search** | TextField | Search input | Focus first |
| | Autocomplete | Suggestions | With custom option display |
| | Chip | Filter tags | Multi-removable |

### Anti-Patterns (Avoid in Admin)

- ❌ Animations/transitions (slow users down)
- ❌ Hover-only actions (keyboard users can't access)
- ❌ Modeless dialogs (can be overlooked)
- ❌ Inline editing without undo (risky)
- ❌ Loading states without escape (can't cancel)
- ❌ Disabled buttons without explanation (use tooltip)
- ❌ Confirmation dialogs for minor actions (friction)
- ❌ Spinners for < 200ms operations (causes flicker)

---

## Page-Specific Overrides

Create page-specific design rules in `services/admin/design-system/pages/`:

1. **dashboard.md** - Overview/statistics
   - KPI cards
   - Charts and graphs
   - Recent activity
   - Quick actions

2. **content-management.md** - Event/entity CRUD
   - Form layouts
   - Inline editing
   - Bulk operations
   - Status workflows

3. **review-queue.md** - Content review workflow
   - Item display (cards/list)
   - Approval UI
   - Rejection reasons
   - Batch review

4. **analytics.md** - Reports and metrics
   - Filtering options
   - Chart display
   - Export functionality
   - Date range picker

---

## Design Review Checklist (Admin Service)

Before committing component changes or adding new pages:

### Information Architecture
- [ ] Page hierarchy is clear (breadcrumb visible)
- [ ] Related items are grouped together
- [ ] Primary action is obvious (larger/bolder)
- [ ] Secondary actions are accessible but not distracting
- [ ] Search and filters are prominent
- [ ] Status indicators are clear (color + text/icon)

### Efficiency & Usability
- [ ] Common actions are keyboard-accessible
- [ ] Tooltip shows keyboard shortcut if available
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] Forms don't require scrolling to see all fields
- [ ] Long lists use virtualization or pagination
- [ ] Batch operations are available for tables

### Accessibility
- [ ] Page has clear heading hierarchy
- [ ] All inputs have associated labels (not placeholder-only)
- [ ] Focus indicators are visible (3px outline)
- [ ] Keyboard shortcuts are documented (? key)
- [ ] Images have alt text (if used)
- [ ] Error messages describe the problem and solution
- [ ] ARIA labels describe button icons

### Visual Design
- [ ] Dark mode is correct and readable
- [ ] Spacing follows compact grid (not 4px standard)
- [ ] Colors convey meaning (not color-only)
- [ ] Contrast ratio is 4.5:1 minimum (7:1 for body)
- [ ] Typography is consistent
- [ ] No auto-playing animations

### Desktop Responsiveness
- [ ] Layout works on 1024x768 (older monitors)
- [ ] Horizontal scroll is not required
- [ ] Sidebar can be collapsed/expanded
- [ ] Data tables are scrollable if needed
- [ ] Touch targets are 32px+ (even though mouse-focused)

### Code Quality
- [ ] Component has TypeScript types
- [ ] JSDoc documents props and usage
- [ ] No console errors or warnings
- [ ] Follows naming conventions
- [ ] Storybook story exists (if new component)
- [ ] No hardcoded colors (use theme palette)

---

## Resources

### Documentation
- Master Design System: `packages/@liexp/ui/DESIGN_SYSTEM.md`
- Component Inventory: `packages/@liexp/ui/COMPONENT_INVENTORY.md`
- Naming Conventions: `packages/@liexp/ui/NAMING_CONVENTIONS.md`
- Component Status: `packages/@liexp/ui/COMPONENT_STATUS.md`

### Keyboard Shortcuts Library
- [Mousetrap](https://craig.is/killing/mice) - Keyboard shortcut library
- [Keydown Events](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) - MDN reference

### Tools & Libraries
- **Data Tables**: [MUI DataGrid](https://mui.com/x/react-data-grid/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + MUI components
- **Charts**: [Recharts](https://recharts.org/) or [Chart.js](https://www.chartjs.org/)
- **Date Picker**: [MUI DatePicker](https://mui.com/x/react-date-pickers/)
- **Icons**: [Material Icons](https://fonts.google.com/icons)

### Reference Links
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [MUI Documentation](https://mui.com/material-ui/getting-started/)
- [Keyboard Accessibility](https://www.nngroup.com/articles/keyboard-accessibility/)
- [Admin UI Patterns](https://admins.design/)

---

**Last Updated**: February 2026
**Version**: 1.0
**Maintained by**: Design System Team
