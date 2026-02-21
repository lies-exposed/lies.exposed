# Admin Service Page Design: Review Queue

**Parent Document**: `services/admin/design-system/MASTER.md`  
**Applies to**: Content review/approval workflow pages

---

## Overview

The review queue allows admins to review and approve/reject pending content. Design goals:
- **Quick review** - See everything needed without scrolling
- **Clear decisions** - Obvious approve/reject buttons
- **Context** - Show related items and history
- **Bulk actions** - Process multiple items efficiently

---

## Review Queue Layout

```
┌────────────────────────────────────────────┐
│ QUEUE STATS: 23 Pending | 5 Rejected      │
│ FILTER: [Priority ▼] [Type ▼] [All Items]│
├────────────────────────────────────────────┤
│                                             │
│ ITEM CARD:                                 │
│ ┌────────────────────────────────────────┐│
│ │ [PRIORITY BADGE] EVENT: Title          ││
│ │ Submitted by: John Smith • 2 hours ago ││
│ │                                        ││
│ │ CONTENT PREVIEW (300px height):       ││
│ │ "Barack Obama met with UN Secretary..." ││
│ │ [+ Expand to see full content]        ││
│ │                                        ││
│ │ INVOLVED ENTITIES:                    ││
│ │ [Barack Obama] [UN] [New York]        ││
│ │                                        ││
│ │ STATUS: [Verified ▼] | Confidence: 85%││
│ │                                        ││
│ │ ACTIONS:                               ││
│ │ [✓ APPROVE] [✗ REJECT] [→ ASSIGN TO] ││
│ │ [? NEEDS WORK]                        ││
│ │                                        ││
│ │ HISTORY:                               ││
│ │ • Created: Feb 21, 2:45 PM            ││
│ │ • Updated: Feb 21, 3:10 PM            ││
│ │ • Previous reviewer: Jane Doe         ││
│ │                                        ││
│ └────────────────────────────────────────┘│
│                                             │
│ [Next Item ↓]                              │
│                                             │
└────────────────────────────────────────────┘
```

### Item Card Structure

- Priority badge: Color-coded (red=urgent, orange=high, yellow=normal, gray=low)
- Content type icon + title (16px, bold)
- Submitter info + timestamp (12px, secondary)
- Content preview (max 300px, scrollable if needed)
- Entity pills (inline, colored)
- Status dropdown + confidence bar
- Action buttons (prominent, easy to distinguish)
- History/metadata (collapsible, compact)

### Action Buttons

```
[✓ APPROVE]    (Green, primary)
[✗ REJECT]     (Red, prominent)
[→ ASSIGN TO]  (Secondary, with user selector)
[? NEEDS WORK] (Orange, with comment box)
```

---

## Approval Modal

When clicking APPROVE or REJECT:

```
┌────────────────────────────────────────┐
│ APPROVE SUBMISSION                     │
├────────────────────────────────────────┤
│ Title: "Barack Obama visits UN"        │
│                                        │
│ Add notes (optional):                 │
│ [Textarea...]                         │
│                                        │
│ Assign reviewer for final check:      │
│ [Search reviewers...] OR [Auto-assign]│
│                                        │
│ [Cancel] [Confirm Approve]            │
└────────────────────────────────────────┘
```

---

## Keyboard Shortcuts

```
'a' → Approve current item
'r' → Reject current item
'n' → Next item (scroll down)
'p' → Previous item (scroll up)
'c' → Add comment
'?' → Show shortcuts help
```

---

## Performance

- Load items on-demand (10 per page)
- "Load more" button or infinite scroll
- Cache rejected/approved items for 24 hours

---

**Last Updated**: February 2026  
**Version**: 1.0
