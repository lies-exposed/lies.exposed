# Admin Service Page Design: Analytics & Reports

**Parent Document**: `services/admin/design-system/MASTER.md`  
**Applies to**: Reports, metrics, analytics pages

---

## Overview

Analytics pages provide insights into system performance and content. Design goals:
- **Customizable** - Users can select metrics and date ranges
- **Exportable** - Data can be exported for external use
- **Comparative** - Show trends and comparisons
- **Actionable** - Insights lead to decisions

---

## Analytics Dashboard Layout

```
┌──────────────────────────────────────────┐
│ FILTERS & EXPORT                         │
│ [Date Range: Feb 1-21] [Refresh]        │
│ [Metrics: ▼] [Compare to: ▼]            │
│ [Export: CSV] [PDF] [Google Sheets]     │
├──────────────────────────────────────────┤
│                                           │
│ SUMMARY CARDS (4 columns):               │
│ ┌──────────┐ ┌──────────┐ ┌──────┐      │
│ │ Events   │ │ Reviews  │ │ Avg  │      │
│ │ Created  │ │Completed │ │Time  │      │
│ │ 42       │ │ 38       │ │ 4.2h │      │
│ │ ↑ 8%    │ │ ↑ 12%   │ │ ↓ 2% │      │
│ └──────────┘ └──────────┘ └──────┘      │
│                                           │
│ CHARTS (2 columns):                      │
│ ┌─────────────────────┐ ┌───────────────┐│
│ │ Events Created      │ │ Verification  ││
│ │ Over Time           │ │ Status        ││
│ │ (Line chart)        │ │ (Pie chart)   ││
│ └─────────────────────┘ └───────────────┘│
│                                           │
│ ┌─────────────────────┐ ┌───────────────┐│
│ │ Review Wait Time    │ │ Top Reviewers ││
│ │ (Bar chart)         │ │ (Table)       ││
│ └─────────────────────┘ └───────────────┘│
│                                           │
│ DETAILED TABLE:                          │
│ Top Actors by Event Count                │
│ ┌──────────────────────────────────────┐│
│ │ Rank │ Actor         │ Events │ % Tot││
│ │ 1    │ Barack Obama  │ 12     │ 2.8% ││
│ │ 2    │ UN Secretary  │ 8      │ 1.9% ││
│ │ 3    │ Joe Biden     │ 7      │ 1.6% ││
│ └──────────────────────────────────────┘│
│                                           │
└──────────────────────────────────────────┘
```

---

## Chart Types

**Line Chart (Events Over Time)**
- X-axis: Date
- Y-axis: Count
- Multiple series: Different verification status
- Hover: Show exact value and date
- Interactive legend: Click to show/hide

**Pie Chart (Status Distribution)**
- Segments: Verified, Disputed, Unverified
- Legend: Outside pie, with percentages
- Hover: Highlight segment + tooltip

**Bar Chart (Wait Times)**
- X-axis: Categories (reviewer, type, etc.)
- Y-axis: Hours/minutes
- Sort: Descending by default
- Hover: Show exact value

**Table (Top Items)**
- Sortable columns (click header)
- Pagination: 10 rows per page
- Export row: Available
- Highlight: Top 3 items in different color

---

## Filter & Export Section

```
┌────────────────────────────────────────┐
│ DATE RANGE:                            │
│ [Feb 1, 2024] to [Feb 21, 2024]       │
│ [Calendar] [Presets: Last 7 days ▼]   │
│                                        │
│ METRICS TO SHOW:                      │
│ ☑ Events Created                       │
│ ☑ Verification Status                  │
│ ☐ Review Times                         │
│ ☐ User Activity                        │
│ [Apply]                                │
│                                        │
│ EXPORT:                                │
│ [CSV] [JSON] [PDF] [Google Sheets]    │
│                                        │
│ [← Back] [Refresh]                    │
└────────────────────────────────────────┘
```

---

## Predefined Reports

Sidebar shortcuts:
```
REPORTS:
• Daily Summary
• Weekly Review
• Monthly Report
• Quarterly Analysis
• Custom Query
```

---

**Last Updated**: February 2026  
**Version**: 1.0
