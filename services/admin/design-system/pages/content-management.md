# Admin Service Page Design: Content Management (CRUD)

**Parent Document**: `services/admin/design-system/MASTER.md`  
**Applies to**: Event/Actor/Group create, edit, list pages

---

## Overview

Content management pages allow admins to create, read, update, and delete fact-checking content. Design goals:
- **Efficiency** - Minimize steps to perform actions
- **Batch operations** - Edit multiple items at once
- **Data completeness** - Forms guide through required fields
- **Quick feedback** - Immediate validation and confirmation

---

## List Page Layout

```
┌──────────────────────────────────────────┐
│ HEADER: "Events" | [+ Create]            │
├──────────────────────────────────────────┤
│ SEARCH: [Search events...]               │
│ FILTERS: [Status ▼] [Type ▼] [Apply]    │
├──────────────────────────────────────────┤
│ SELECT: [☐ All] (header)                │
│                                          │
│ ┌──────────────────────────────────────┐│
│ │☐│ Title              │ Status│Date   ││
│ │☐│ Event 1            │ Draft │2024-02││
│ │☐│ Event 2 (featured) │ Live  │2024-03││
│ │☐│ Event 3            │Draft │2024-01││
│ └──────────────────────────────────────┘│
│                                          │
│ BULK ACTIONS: [Edit] [Delete] [Export]  │
│ PAGINATION: [← Previous] [1][2][3][Next]│
│                                          │
└──────────────────────────────────────────┘
```

### List Table Structure

**Columns** (Sortable by clicking header):
- ☐ Checkbox (select row)
- Title (main content, clickable → edit)
- Status (color-coded badge)
- Date Created
- Last Modified
- Actions (Edit, Delete icons)

**Specifications**:
- Row height: 44-48px
- Padding: 12px
- Hover: Background highlight (alpha 0.05)
- Click row: Navigate to edit (or select checkbox)
- Sorting icon: ▲▼ on hovered header

### Batch Operations Bar

Shows only when items selected:
```
┌──────────────────────────────────────────┐
│ 3 items selected                         │
│ [Edit] [Delete] [Archive] [Export]      │
│ [Cancel selection]                       │
└──────────────────────────────────────────┘
```

---

## Create/Edit Form Layout

```
┌──────────────────────────────────────┐
│ H1: "Create Event" or "Edit Event"   │
│                                      │
│ FORM SECTION 1: BASIC INFO           │
│ [Title input field]                 │
│ [Description textarea]              │
│ [Date picker] [Time picker]        │
│ [Status: Draft/Live/Archived]       │
│                                      │
│ FORM SECTION 2: CONTENT             │
│ [Rich text editor]                  │
│ [+ Add image] [+ Add link]         │
│                                      │
│ FORM SECTION 3: ENTITIES            │
│ Involved Actors:                    │
│ [Search] [+ Barack Obama]           │
│ [- Joseph Biden]                    │
│                                      │
│ Involved Groups:                    │
│ [Search] [+ United Nations]         │
│                                      │
│ FORM SECTION 4: VERIFICATION        │
│ Status: [Verified ▼]               │
│ Sources: [+ Add source]            │
│ Confidence: [████████░░ 85%]       │
│                                      │
│ BUTTONS:                             │
│ [← Back] [Save Draft] [Publish]    │
│                                      │
│ (Auto-saves every 30 seconds)       │
│                                      │
└──────────────────────────────────────┘
```

### Form Field Specifications

**Text Input**:
- Height: 40px
- Padding: 8px 12px
- Border: 1px solid divider
- Focus: 2px primary border
- Error: Red border + message below
- Placeholder: 14px, secondary color

**Textarea**:
- Min height: 100px
- Max height: 400px (scroll)
- Resize: Vertical only
- Line height: 1.5

**Select Dropdown**:
- Height: 40px
- Show current selection
- Open: Show all options or search

**Checkbox/Radio**:
- Size: 20x20px (visual)
- Label: To the right
- Group gap: 8px vertical

**Date Picker**:
- Icon + text field
- Click: Calendar overlay
- Format: MM/DD/YYYY or YYYY-MM-DD
- Keyboard: Arrow keys to navigate

### Inline Edit Mode

When double-clicking a field in the list:
```
┌──────────────────────────┐
│ Title: [input field]     │
│        [✓ Save] [✗ Cancel]
└──────────────────────────┘
```

Properties:
- Full-width input
- Focus: Auto-focus on field
- Save: Ctrl+Enter or click checkmark
- Cancel: Escape or click X
- Timeout: Auto-save after 5 seconds of inactivity

---

## Visual Specifications

### Form Layout
- Max width: 900px
- Padding: 24px
- Column: Single (or 2 columns for related fields)
- Section gap: 32px
- Field gap: 16px
- Label: 14px, bold, required: red asterisk
- Help text: 12px, secondary color, below field

### Buttons
- Create: Primary blue (#42A5F5)
- Delete: Error red (#EF5350)
- Archive: Warning orange (#FFA726)
- Save Draft: Secondary (outline)
- Publish: Primary (filled)

### Table Styling
- Header: Background #252525, font bold
- Row: Alternating (none needed in dark mode)
- Hover: Background #1f1f1f
- Selected: Background #2d2d2d, border accent
- Borders: 1px #333333

---

## Interactive Behaviors

### Form Auto-save
- Saves every 30 seconds (if unsaved changes)
- Shows toast: "Draft saved" (3 seconds)
- Keyboard: Ctrl+S saves immediately

### Validation
- Real-time on blur (after user leaves field)
- Required fields: Show error immediately on submit
- Type checking: Show error for incorrect format
- Example error: "Title must be between 5-200 characters"

### Batch Edit
- Click [Edit] on multiple selected items
- Opens modal with fields to batch-update
- Options: Update all selected OR skip some items

---

## Accessibility

### Form Accessibility
- Labels associated with inputs (for/id)
- Required fields marked (*)
- Error messages linked to inputs (aria-describedby)
- Tab order: logical left-to-right, top-to-bottom
- Focus indicators: 2px outline

### Table Accessibility
- Row: Can be selected via keyboard
- Sorting: Announced to screen readers
- Column headers: Descriptive labels
- Row actions: Tab-accessible buttons

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained by**: Design System Team
